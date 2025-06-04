from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from fastapi.responses import JSONResponse
from fastapi.responses import PlainTextResponse
import json
import os
import shutil
import uuid
import subprocess
import logging
import traceback

def parse_result_to_json(stdout_text):
    """
    run.sh의 출력 결과를 JSON으로 변환
    입력 형태: "Pass|1.234|5678" 또는 "Fail|0|0" 또는 "TimeOut|0|0"
    출력 형태: {"result": "Pass", "avg_time": "1.234", "avg_memory": "5678"}
    """
    try:
        # 공백 제거 및 파싱
        output = stdout_text.strip()
        
        if not output:
            return {
                "result": "Fail",
                "avg_time": "0",
                "avg_memory": "0"
            }
        
        # "|"로 분리
        parts = output.split('|')
        
        if len(parts) == 3:
            result_status = parts[0].strip()  # Pass, Fail, TimeOut
            avg_time = parts[1].strip()
            avg_memory = parts[2].strip()
        else:
            # 파싱 실패시 기본값
            result_status = "Fail"
            avg_time = "0"
            avg_memory = "0"
        
        return {
            "result": result_status,
            "avg_time": avg_time,
            "avg_memory": avg_memory
        }
        
    except Exception as e:
        # 파싱 중 오류 발생시 기본값 반환
        logger.error(f"Error parsing result: {e}")
        return {
            "result": "Fail",
            "avg_time": "0",
            "avg_memory": "0"
        }

app = FastAPI()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LANGUAGE_TO_IMAGE = {
    ".java": "code-runner-java",
    ".cpp": "code-runner-cpp",
    ".py": "code-runner-python"
}

# language: str = Form(...) 

@app.post("/compile")
async def compile_code(code: UploadFile = File(...), 
                       testcase: UploadFile = File(...), 
                       result : UploadFile = File(...),
                       language: str = Form(...)):
    code_extension = os.path.splitext(code.filename)[1]
    logger.info(f"Received compilation request for language: {code_extension}")
    
    if code_extension not in LANGUAGE_TO_IMAGE:
        return PlainTextResponse(f"Unsupported language: {code_extension}", status_code=400)

    # 고유한 작업 디렉토리 생성 (절대 경로 사용)
    workdir = os.path.abspath(f"/tmp/{uuid.uuid4().hex}")
    os.makedirs(workdir, exist_ok=True, mode=0o755)  # 권한 설정 추가
    logger.info(f"Created working directory: {workdir}")

    try:  
        filename = f"Main{code_extension}"
        codefilepath = os.path.join(workdir, filename)

        # 파일 내용 읽기 및 저장
        content = await code.read()
        if not content:
            return PlainTextResponse("Empty code file", status_code=400)
            
        with open(codefilepath, "wb") as f:
            f.write(content)

        # 실행 권한 추가 (필요한 경우)
        os.chmod(codefilepath, 0o755)
        logger.info(f"Saved code to {codefilepath} with permissions")

        extension = "txt"
        filename = f"testcase.{extension}"
        tcfilepath = os.path.join(workdir, filename)

        # test case 파일 내용 읽기 및 저장
        content = await testcase.read()
        if not content:
            return PlainTextResponse("Empty testcase file", status_code=400)
            
        with open(tcfilepath, "wb") as f:
            f.write(content)

        logger.info(f"Saved testcase to {tcfilepath}")

        extension = "txt"
        filename = f"result.{extension}"
        resultfilepath = os.path.join(workdir, filename)
        
        content = await result.read()
        if not content:
            return PlainTextResponse("Empty result file", status_code=400)
            
        with open(resultfilepath, "wb") as f:
            f.write(content)
        
        logger.info(f"Saved resultfile to {resultfilepath}")
        # 도커 명령 실행
        docker_cmd = [
            "docker", "run", "--rm",
            "-v", f"{workdir}:/app/code",  # 전체 디렉토리 마운트
            LANGUAGE_TO_IMAGE[code_extension]
        ]
        logger.info(f"Executing docker command: {' '.join(docker_cmd)}")
        
        try:
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                timeout=60,  # 안전을 위한 제한 시간
                check=False  # 에러가 발생해도 예외를 발생시키지 않음
            )
            
            # 결과 처리
            stdout = result.stdout.decode('utf-8', errors='replace') if result.stdout else ""
            stderr = result.stderr.decode('utf-8', errors='replace') if result.stderr else ""
            
            logger.info(f"Command completed with return code: {result.returncode}")
            logger.info(f"STDOUT: {stdout[:600]}...")  # 첫 200자만 로깅
            logger.info(f"STDERR: {stderr[:200]}...")  # 첫 200자만 로깅

            if result.returncode == 0:
            # stdout을 JSON으로 변환
                result_json = parse_result_to_json(stdout)
                return JSONResponse(content=result_json)
        
        except subprocess.SubprocessError as e:
            logger.error(f"Subprocess error: {str(e)}")
            return PlainTextResponse(f"Error executing docker: {str(e)}", status_code=500)
            
    except subprocess.TimeoutExpired:
        logger.error("Execution timed out")
        return PlainTextResponse("Execution timed out", status_code=408)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        logger.error(traceback.format_exc())
        return PlainTextResponse(f"Server error: {str(e)}", status_code=500)
    finally:
        # 작업 디렉토리 정리
        if os.path.exists(workdir):
            shutil.rmtree(workdir)
            logger.info(f"Cleaned up working directory: {workdir}")