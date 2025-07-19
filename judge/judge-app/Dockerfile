# Dockerfile
# AWS Lambda Python 런타임 기반 이미지 사용
# 이 이미지는 Amazon Linux 2를 기반으로 하며, Python 런타임이 포함되어 있습니다.
# 다른 언어의 컴파일러/인터프리터를 추가로 설치할 수 있습니다.
FROM public.ecr.aws/lambda/python:3.9

# 필요한 패키지 설치:
# - java-11-amazon-corretto-devel: Java 11 JDK (javac, java 명령어 포함)
# - gcc-c++: C++ 컴파일러 (g++ 명령어 포함)
# - python3-devel: Python 개발 라이브러리 (Python 런타임은 기본 이미지에 포함)
# yum은 Amazon Linux 2의 패키지 관리자입니다.
RUN yum update -y &&     yum install -y java-11-amazon-corretto-devel gcc-c++ dos2unix &&     pip install requests pymysql &&     yum clean all

# 작업 디렉토리 설정 (Lambda 함수 코드가 위치할 곳)
WORKDIR ${LAMBDA_TASK_ROOT}

# Lambda 핸들러 코드 (app.py) 및 채점 스크립트 (run.sh) 복사
# 이 파일들은 다음 단계에서 생성합니다.
COPY app.py ${LAMBDA_TASK_ROOT}
COPY run.sh ${LAMBDA_TASK_ROOT}

# run.sh 스크립트에 실행 권한 부여
RUN chmod +x ${LAMBDA_TASK_ROOT}/run.sh

# Lambda 핸들러 지정 (app.py 파일의 handler 함수)
CMD [ "app.handler" ]