from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from fastapi.responses import JSONResponse
from fastapi.responses import PlainTextResponse
import asyncio
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
    ".java": "custiya/code-runner-java",
    ".cpp": "custiya/code-runner-cpp",
    ".py": "custiya/code-runner-python"
}

# language: str = Form(...) 

@app.post("/compile")
async def compile_code(code: UploadFile = File(...),
                       testcase: UploadFile = File(...),
                       result : UploadFile = File(...),
                       room_id: int = Form(...)):
    # 컨테이너 내부의 고정된 tmp 경로 사용
    container_tmp_base = "/app/tmp"
    if not os.path.exists(container_tmp_base):
        # /app/tmp 디렉토리가 없다면 에러 발생 (Docker 볼륨 마운트 확인 필요)
        raise PlainTextResponse("Temporary directory '/app/tmp' not found inside the container.", status_code=500)

    code_extension = os.path.splitext(code.filename)[1]
    logger.info(f"Received compilation request for language: {code_extension}")

    if code_extension not in LANGUAGE_TO_IMAGE:
        return PlainTextResponse(f"Unsupported language: {code_extension}", status_code=400)

    uid = uuid.uuid4().hex
    # 컨테이너 내부 경로를 기준으로 작업 디렉토리 생성
    workdir = os.path.join(container_tmp_base, uid)
    os.makedirs(workdir, exist_ok=True, mode=0o755)
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

        # 실행 권한 추가
        os.chmod(codefilepath, 0o755)
        logger.info(f"Saved code to {codefilepath} with permissions")

        # testcase 파일 저장
        tcfilepath = os.path.join(workdir, "testcase.txt")
        content = await testcase.read()
        if not content:
            return PlainTextResponse("Empty testcase file", status_code=400)
        with open(tcfilepath, "wb") as f:
            f.write(content)
        logger.info(f"Saved testcase to {tcfilepath}")

        # result 파일 저장
        resultfilepath = os.path.join(workdir, "result.txt")
        content = await result.read()
        if not content:
            return PlainTextResponse("Empty result file", status_code=400)
        with open(resultfilepath, "wb") as f:
            f.write(content)
        logger.info(f"Saved resultfile to {resultfilepath}")

        container_name = f"compile-{room_id}-{uid}"
        # 도커 명령 실행
        docker_cmd = [
            "docker", "run", "--rm",
            "--name", container_name,
            # workdir는 컨테이너 내부의 절대 경로이므로 그대로 마운트
            "-v", f"{workdir}:/app/code_root",
            "-e", f"TARGET_UUID={uid}",
            LANGUAGE_TO_IMAGE[code_extension]
        ]

        logger.info(f"Executing docker command: {' '.join(docker_cmd)}")
        logger.info(f"Checking workdir contents on host before docker run: {workdir}")
        # 호스트 파일 시스템의 workdir 내용을 확인 (컨테이너 내부에서 실행)
        # 이 명령의 출력은 main.py 컨테이너의 STDOUT에 나타남, 디버깅 구문
        # check=True로 설정하여 ls 명령어 실패시 예외 발생
        try:
            ls_output = subprocess.run(
                ["ls", "-la", workdir],
                capture_output=True,
                check=True,
                text=True # 텍스트 모드로 stdout/stderr 디코딩
            )
            logger.info(f"Host workdir contents (before docker run):\n{ls_output.stdout.strip()}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to list host workdir: {workdir}. Error: {e.stderr.strip()}")

        proc = await asyncio.create_subprocess_exec(
            *docker_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(),timeout=60.0)
            # result = subprocess.run(
            #     docker_cmd,
            #     capture_output=True,
            #     timeout=60,  # 안전을 위한 제한 시간
            #     check=False  # 에러가 발생해도 예외를 발생시키지 않음
            # )
            
            # 결과 처리
            stdout_str = stdout.decode('utf-8', errors='replace') if stdout else ""
            stderr_str = stderr.decode('utf-8', errors='replace') if stderr else ""
            
            # logger.info(f"Command completed with return code: {result.returncode}")
            logger.info(f"STDOUT: {stdout_str[:600]}...")  # 첫 200자만 로깅
            logger.info(f"STDERR: {stderr_str[:200]}...")  # 첫 200자만 로깅

            if proc.returncode == 0:
            # stdout을 JSON으로 변환
                result_json = parse_result_to_json(stdout_str)
                return JSONResponse(content=result_json)
            else:
                return JSONResponse(content={"result":"Fail","avg_time":0,"avg_memory":0,"err":stderr_str},
                                    status_code=200)
        except asyncio.TimeoutError:
            logger.error(f"Execution timed out for container {container_name}. Killing process.")
            if proc:
                proc.kill()
                await proc.wait()
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


@app.post("/test")
async def test1(code: UploadFile = File(...), 
                       language: str = Form(...)):
    logger.info(f"{code.filename} received")