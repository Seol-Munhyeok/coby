# app.py (Lambda 핸들러)
import os
import json
import subprocess
import boto3
import logging
import requests # HTTP 요청을 보내기 위한 라이브러리
import pymysql # RDS 직접 연결을 위한 라이브러리 (MySQL 예시)

# 로깅 설정
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

# RDS 직접 연결을 위한 설정 (환경 변수 사용)
# Lambda 환경 변수로 RDS_HOST, RDS_USER, RDS_PASSWORD, RDS_DB_NAME을 설정해야 합니다.
RDS_HOST = os.environ.get('RDS_HOST')
RDS_USER = os.environ.get('RDS_USER')
RDS_PASSWORD = os.environ.get('RDS_PASSWORD')
RDS_DB_NAME = os.environ.get('RDS_DB_NAME')

# 백엔드 URL 설정 (환경 변수 사용)
# Lambda 환경 변수로 BACKEND_URL을 설정해야 합니다.
BACKEND_URL = os.environ.get('BACKEND_URL')

def get_db_connection():
    """RDS MySQL 데이터베이스 연결을 설정합니다."""
    try:
        conn = pymysql.connect(
            host=RDS_HOST,
            user=RDS_USER,
            password=RDS_PASSWORD,
            database=RDS_DB_NAME,
            connect_timeout=10 # 연결 타임아웃 설정
        )
        return conn
    except pymysql.MySQLError as e:
        logger.error(f"Error connecting to RDS: {e}", exc_info=True)
        raise

def handler(event, context):
    for record in event['Records']:
        message_body = json.loads(record['body'])
        
        submission_id = message_body.get('submission_id')
        problem_id = message_body.get('problem_id')
        user_id = message_body.get('user_id')
        s3_code_path = message_body.get('s3_code_path') # 예: s3://bucket-name/submissions/submission_id/Main.py
        language = message_body.get('language') # 'python', 'java', 'cpp'

        if not all([submission_id, problem_id, s3_code_path, language]):
            logger.error(f"Missing required fields in message: {message_body}")
            continue

        # 1. 임시 작업 공간 생성 및 이동
        tmp_dir = f"/tmp/{submission_id}"
        os.makedirs(tmp_dir, exist_ok=True)
        
        original_cwd = os.getcwd()
        os.chdir(tmp_dir)

        judge_result = {"status": "Internal Error", "message": "Unknown error occurred"} # 기본 결과 초기화

        try:
            # 2. 사용자 소스 코드 다운로드
            path_parts = s3_code_path.replace("s3://", "").split('/', 1)
            user_code_bucket_name = path_parts[0]
            user_code_s3_key = path_parts[1]
            source_file_name = os.path.basename(user_code_s3_key)
            
            logger.info(f"Downloading user code {user_code_s3_key} from {user_code_bucket_name} to {tmp_dir}/{source_file_name}")
            s3_client.download_file(user_code_bucket_name, user_code_s3_key, source_file_name)

            # 3. RDS에서 테스트케이스 및 정답 파일의 S3 경로 조회 (직접 연결)
            conn = None
            try:
                conn = get_db_connection()
                with conn.cursor(pymysql.cursors.DictCursor) as cursor: # 딕셔너리 형태로 결과 반환
                    sql = f"SELECT testcase_s3_path, expected_result_s3_path FROM problems WHERE problem_id = '{problem_id}'"
                    cursor.execute(sql)
                    result = cursor.fetchone() # 한 행만 가져옴

                    if not result:
                        raise ValueError(f"Problem ID {problem_id} not found in RDS.")

                    testcase_s3_path = result['testcase_s3_path']
                    expected_result_s3_path = result['expected_result_s3_path']
            except Exception as e:
                logger.error(f"Failed to retrieve S3 paths from RDS for problem {problem_id}: {e}", exc_info=True)
                judge_result = {"status": "Error", "message": f"Failed to get problem data: {str(e)}"}
                os.chdir(original_cwd)
                continue # 다음 SQS 레코드로 이동
            finally:
                if conn:
                    conn.close() # DB 연결 닫기

            # 4. 테스트케이스 및 정답 파일 S3에서 다운로드
            def download_from_s3(s3_path, local_file_name):
                path_parts = s3_path.replace("s3://", "").split('/', 1)
                bucket = path_parts[0]
                key = path_parts[1]
                logger.info(f"Downloading {key} from {bucket} to {tmp_dir}/{local_file_name}")
                s3_client.download_file(bucket, key, local_file_name)

            download_from_s3(testcase_s3_path, "testcase.txt")
            download_from_s3(expected_result_s3_path, "result.txt")
            
            logger.info("Testcase and expected result files downloaded.")

            # 5. run.sh 스크립트 실행
            run_script_path = os.path.join(os.environ.get('LAMBDA_TASK_ROOT', '/var/task'), 'run.sh')
            
            logger.info(f"Executing {run_script_path} {language} {source_file_name}")
            
            process = subprocess.run(
                [run_script_path, language, source_file_name],
                capture_output=True,
                text=True,
                timeout=context.get_remaining_time_in_millis() / 1000 - 5
            )
            
            logger.info(f"run.sh stdout:\n{process.stdout}")
            if process.stderr:
                logger.error(f"run.sh stderr:\n{process.stderr}")

            # 6. run.sh가 생성한 결과 파일 읽기
            try:
                with open("judge_result.json", "r") as f:
                    judge_result = json.load(f)
                logger.info(f"Judging result for {submission_id}: {judge_result}")
            except FileNotFoundError:
                judge_result = {"status": "Judge Script Output Missing", "message": "judge_result.json not found"}
                logger.error(f"judge_result.json not found for {submission_id}")
            except json.JSONDecodeError:
                judge_result = {"status": "Judge Script Output Malformed", "message": "judge_result.json is malformed"}
                logger.error(f"judge_result.json malformed for {submission_id}")

            # 7. 채점 결과를 백엔드 서버로 통보 (HTTP POST 요청)
            # BACKEND_URL 환경 변수를 사용합니다.
            if not BACKEND_URL:
                logger.error("BACKEND_URL environment variable is not set.")
                # 이 경우 백엔드 통보 실패로 처리하거나, 다른 방식으로 알림을 보낼 수 있습니다.
            else:
                payload = {
                    "submission_id": submission_id,
                    "problem_id": problem_id,
                    "user_id": user_id,
                    "result": judge_result # run.sh에서 파싱한 채점 결과
                }
                headers = {'Content-Type': 'application/json'}
                
                logger.info(f"Sending result to backend: {BACKEND_URL}")
                try:
                    response = requests.post(BACKEND_URL, data=json.dumps(payload), headers=headers, timeout=10)
                    response.raise_for_status() # 200번대 응답이 아니면 예외 발생
                    logger.info(f"Result sent successfully. Backend response: {response.status_code}")
                except requests.exceptions.RequestException as e:
                    logger.error(f"Failed to send result to backend: {e}", exc_info=True)
                    # 백엔드 통보 실패는 채점 자체의 실패는 아니므로, judge_result 상태를 변경하지 않을 수 있습니다.
                    # 하지만 필요에 따라 judge_result에 통보 실패 정보를 추가할 수 있습니다.

        except subprocess.TimeoutExpired:
            logger.error(f"Submission {submission_id} timed out during execution.")
            judge_result = {"status": "Lambda Timeout", "message": "Execution exceeded Lambda's allocated time."}
        except Exception as e:
            logger.error(f"Error processing submission {submission_id}: {e}", exc_info=True)
            judge_result = {"status": "Internal Lambda Error", "message": f"An unexpected error occurred: {str(e)}"}
        finally:
            os.chdir(original_cwd) # 작업 디렉토리를 원래대로 되돌립니다.
            pass

    return {
        'statusCode': 200,
        'body': json.dumps('Processing complete')
    }