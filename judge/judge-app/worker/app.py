import os
import json
import subprocess
import boto3
import logging
import requests
import pymysql

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3_client = boto3.client('s3')

RDS_HOST = os.environ.get('RDS_HOST')
RDS_USER = os.environ.get('RDS_USER')
RDS_PASSWORD = os.environ.get('RDS_PASSWORD')
RDS_DB_NAME = os.environ.get('RDS_DB_NAME')
BACKEND_URL = os.environ.get('BACKEND_URL')

def get_db_connection():
    try:
        conn = pymysql.connect(
            host=RDS_HOST,
            user=RDS_USER,
            password=RDS_PASSWORD,
            database=RDS_DB_NAME,
            connect_timeout=10
        )
        return conn
    except pymysql.MySQLError as e:
        logger.error(f"Error connecting to RDS: {e}", exc_info=True)
        raise

def handler(event, context):
    # Dispatcher Lambda로부터 직접 호출되므로, event는 이미 파싱된 JSON 객체입니다.
    # SQS Records 구조가 아님에 유의합니다.
    message_body = event
    
    submission_id = message_body.get('submission_id')
    problem_id = message_body.get('problem_id')
    user_id = message_body.get('user_id')
    s3_code_path = message_body.get('s3_code_path')
    language = message_body.get('language')

    if not all([submission_id, problem_id, s3_code_path, language]):
        logger.error(f"Missing required fields in message: {message_body}")
        return {'statusCode': 400, 'body': json.dumps('Missing required fields')}

    tmp_dir = f"/tmp/{submission_id}"
    os.makedirs(tmp_dir, exist_ok=True)
    
    original_cwd = os.getcwd()
    os.chdir(tmp_dir)

    judge_result = {"status": "Internal Error", "message": "Unknown error occurred"}

    try:
        path_parts = s3_code_path.replace("s3://", "").split('/', 1)
        user_code_bucket_name = path_parts[0]
        user_code_s3_key = path_parts[1]
        source_file_name = os.path.basename(user_code_s3_key)
        
        logger.info(f"Downloading user code {user_code_s3_key} from {user_code_bucket_name} to {tmp_dir}/{source_file_name}")
        s3_client.download_file(user_code_bucket_name, user_code_s3_key, source_file_name)

        conn = None
        try:
            conn = get_db_connection()
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                sql = "SELECT testcase_s3_path, expected_result_s3_path FROM problem WHERE id = %s"
                cursor.execute(sql, (problem_id,))
                result = cursor.fetchone()

                if not result:
                    raise ValueError(f"Problem ID {problem_id} not found in RDS.")

                testcase_s3_path = result['testcase_s3_path']
                expected_result_s3_path = result['expected_result_s3_path']
        except Exception as e:
            logger.error(f"Failed to retrieve S3 paths from RDS for problem {problem_id}: {e}", exc_info=True)
            judge_result = {"status": "Error", "message": f"Failed to get problem data: {str(e)}"}
            return {'statusCode': 500, 'body': json.dumps(judge_result)}
        finally:
            if conn:
                conn.close()

        def download_from_s3(s3_path, local_file_name):
            path_parts = s3_path.replace("s3://", "").split('/', 1)
            bucket = path_parts[0]
            key = path_parts[1]
            logger.info(f"Downloading {key} from {bucket} to {tmp_dir}/{local_file_name}")
            s3_client.download_file(bucket, key, local_file_name)

        download_from_s3(testcase_s3_path, "testcase.txt")
        download_from_s3(expected_result_s3_path, "result.txt")
        
        logger.info("Testcase and expected result files downloaded.")

        # run.sh 스크립트 경로 수정: Lambda 실행 환경의 /var/task/run.sh
        run_script_path = "/var/task/run.sh"
        
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

        if not BACKEND_URL:
            logger.error("BACKEND_URL environment variable is not set.")
        else:
            payload = {
                "submission_id": submission_id,
                "problem_id": problem_id,
                "user_id": user_id,
                "result": judge_result
            }
            headers = {'Content-Type': 'application/json'}
            
            logger.info(f"Sending result to backend: {BACKEND_URL}")
            try:
                response = requests.post(BACKEND_URL, data=json.dumps(payload), headers=headers, timeout=10)
                response.raise_for_status()
                logger.info(f"Result sent successfully. Backend response: {response.status_code}")
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to send result to backend: {e}", exc_info=True)

    except subprocess.TimeoutExpired:
        logger.error(f"Submission {submission_id} timed out during execution.")
        judge_result = {"status": "Lambda Timeout", "message": "Execution exceeded Lambda's allocated time."}
    except Exception as e:
        logger.error(f"Error processing submission {submission_id}: {e}", exc_info=True)
        judge_result = {"status": "Internal Lambda Error", "message": f"An unexpected error occurred: {str(e)}"}
    finally:
        os.chdir(original_cwd)

    return {
        'statusCode': 200,
        'body': json.dumps(judge_result)
    }