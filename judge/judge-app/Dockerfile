# 1. 표준 Amazon Linux 2 이미지를 기반으로 시작
FROM amazonlinux:2

# 2. amazon-linux-extras를 사용하여 Python 3.8 및 Java 11 활성화 및 설치
RUN amazon-linux-extras install -y python3.8 java-openjdk11

# 3. 나머지 도구 및 Python 라이브러리 설치
RUN yum install -y gcc-c++ dos2unix zip && \
    python3.8 -m pip install --upgrade pip && \
    python3.8 -m pip install requests pymysql awslambdaric && \
    yum clean all

# 4. Lambda 함수 코드 및 스크립트 복사 (절대 경로 사용)
WORKDIR /var/task
COPY app.py /var/task/
COPY run.sh /var/task/
RUN chmod +x /var/task/run.sh

# 5. Lambda 진입점(Entrypoint) 설정
ENTRYPOINT [ "/usr/bin/python3.8", "-m", "awslambdaric" ]

# 6. 핸들러 지정
CMD [ "app.handler" ]
