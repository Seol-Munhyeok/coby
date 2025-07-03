# 공식 파이썬 런타임 이미지 사용
FROM python:3.9-slim-buster

# 작업 디렉토리 설정
WORKDIR /app

# 필요한 시스템 패키지 설치
# Docker 클라이언트를 설치하기 위한 curl, gpg, apt-transport-https 등이 필요합니다.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    apt-transport-https \
    ca-certificates \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*
    
# Docker 공식 GPG 키 추가
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN chmod a+r /etc/apt/keyrings/docker.gpg

# Docker apt 리포지토리 추가
RUN echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 클라이언트 (docker-ce-cli) 설치
RUN apt-get update && apt-get install -y docker-ce-cli


# 파이썬 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY main.py .

# 포트 노출 (FastAPI/Uvicorn이 사용할 포트)
EXPOSE 8001

# 컨테이너 시작 시 Uvicorn 실행
# 호스트 0.0.0.0으로 바인딩하여 외부에서 접근 가능하게 함
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]