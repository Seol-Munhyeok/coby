## Compile Server 설정하는 법

### 환경 설정
* 경로 설정 : COBY\judge
* 환경 설정 : 명령어 입력
    - venv를 통하여 가상환경 설정
```
 .\.venv\Scripts\activate
```
* 코드 실행이 안될 경우 아래의 명렁어 사용
```
pip install fastapi uvicorn python-multipart
```
### 도커 이미지 빌드
```
docker build -t code-runner-python ./code-runner/python/
docker build -t code-runner-java ./code-runner/java/
docker build -t code-runner-cpp ./code-runner/cpp/
```
### 코드 실행
1. docker desktop 실행
2. 아래의 코드를 통해 python 서버 실행
```
uvicorn main:app --reload --port 8000
# --host 옵션으로 ip설정도 추가 가능
```

### 참조
* 파이썬만 실행 평균 시간과 평균 메모리 사용량, pass/fail 확인 가능
* cpp, java는 단순 컴파일만 됨