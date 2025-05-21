from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.responses import PlainTextResponse
import os
import shutil
import uuid
import subprocess
import logging
import traceback

app = FastAPI()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LANGUAGE_TO_IMAGE = {
    "java": "code-runner-java",
    "cpp": "code-runner-cpp",
    "python": "code-runner-python"
}

LANGUAGE_TO_EXTENSIONS = {
    "java": "java",
    "cpp": "cpp",
    "python": "py"
}

@app.post("/compile")
async def compile_code(code: UploadFile, language: str = Form(...)):
    logger.info(f"Received compilation request for language: {language}")
    
    if language not in LANGUAGE_TO_IMAGE:
        return PlainTextResponse(f"Unsupported language: {language}", status_code=400)

    # 고유한 작업 디렉토리 생성 (절대 경로 사용)
    workdir = os.path.abspath(f"/tmp/{uuid.uuid4().hex}")
    os.makedirs(workdir, exist_ok=True, mode=0o755)  # 권한 설정 추가
    logger.info(f"Created working directory: {workdir}")

    try:
        # 파일 저장
        if language not in LANGUAGE_TO_EXTENSIONS:
            return PlainTextResponse(f"No file extension defined for language: {language}", status_code=400)
            
        extension = LANGUAGE_TO_EXTENSIONS[language]
        filename = f"code.{extension}"
        filepath = os.path.join(workdir, filename)

        # 파일 내용 읽기 및 저장
        content = await code.read()
        if not content:
            return PlainTextResponse("Empty code file", status_code=400)
            
        with open(filepath, "wb") as f:
            f.write(content)
        
        # 실행 권한 추가 (필요한 경우)
        os.chmod(filepath, 0o755)
        logger.info(f"Saved code to {filepath} with permissions")

        # 도커 명령 실행
        docker_cmd = [
            "docker", "run", "--rm",
            "-v", f"{workdir}:/app/code",  # 전체 디렉토리 마운트
            LANGUAGE_TO_IMAGE[language]
        ]
        logger.info(f"Executing docker command: {' '.join(docker_cmd)}")
        
        try:
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                timeout=10,  # 안전을 위한 제한 시간
                check=False  # 에러가 발생해도 예외를 발생시키지 않음
            )
            
            # 결과 처리
            stdout = result.stdout.decode('utf-8', errors='replace') if result.stdout else ""
            stderr = result.stderr.decode('utf-8', errors='replace') if result.stderr else ""
            
            logger.info(f"Command completed with return code: {result.returncode}")
            logger.info(f"STDOUT: {stdout[:200]}...")  # 첫 200자만 로깅
            logger.info(f"STDERR: {stderr[:200]}...")  # 첫 200자만 로깅
            
            if result.returncode == 0:
                return PlainTextResponse(stdout)
            else:
                logger.error(f"Error during execution: {stderr}")
                return PlainTextResponse(f"Error:\n{stderr}", status_code=400)
        
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