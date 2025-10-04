#!/bin/bash
set -e

# === 사용자 설정 ===
JAR_NAME="coby-0.0.1-SNAPSHOT.jar"
EC2_USER="ubuntu"
EC2_HOST="54.180.197.9"
# ❗❗ 수정 완료: 당신이 제공한 경로로 변경됨 ❗❗
EC2_KEY_PATH="/Users/ojonghyeon/Desktop/coby_bastion.pem"
REACT_API_URL="http://54.180.197.9:8080"

# === 로그 출력 함수 ===
print_remote_log() {
  echo -e "\n📝 최근 log.txt 출력 (EC2)"
  ssh -i "$EC2_KEY_PATH" $EC2_USER@$EC2_HOST "tail -n 20 log.txt || echo '❗ log.txt 파일 없음'"
}

# === 에러 발생 시 로그 출력하도록 트랩 설정 ===
trap 'echo "❌ 오류 발생! 로그 확인:"; print_remote_log; exit 1' ERR

# === [1] React .env 파일 수정 ===
ENV_PATH="frontend/.env"
if [ -f "$ENV_PATH" ]; then
  echo "🌍 .env 파일 덮어쓰기: REACT_APP_API_URL=$REACT_API_URL"
  echo "REACT_APP_API_URL=$REACT_API_URL" > "$ENV_PATH"
else
  echo "⚠️ .env 파일이 없어 수정 건너뜀"
fi

# === [2] React 빌드 및 복사 ===
echo "📦 [1/4] React 빌드 시작..."
cd frontend || exit
# ❗❗ 수정 완료: Mac 환경에 맞게 PATH를 제거함. 'npm'이 전역으로 사용 가능할 것으로 예상 ❗❗
if [ ! -d "node_modules" ]; then
  echo "📦 의존성 설치 중..."
  npm install
else
  echo "📦 의존성 설치 건너뜀"
fi

npm run build
echo "📁 빌드 결과 백엔드 static 디렉토리에 복사..."
rm -rf ../backend/src/main/resources/static/*
cp -r build/* ../backend/src/main/resources/static/
cd ..

# === [3] Spring Boot 빌드 ===
echo "🛠️ [2/4] Spring Boot JAR 빌드 중..."
cd backend || exit
# ❗❗ 수정 완료: 당신이 제공한 경로로 변경됨 ❗❗
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.15/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
./gradlew clean build -x test
cd ..

# === [4] EC2 전송 및 실행 ===
echo "🚀 [3/4] EC2에 JAR 전송 중..."
scp -i "$EC2_KEY_PATH" backend/build/libs/$JAR_NAME $EC2_USER@$EC2_HOST:/home/$EC2_USER/

echo "🔁 [4/4] EC2 서버 재실행..."
ssh -i "$EC2_KEY_PATH" $EC2_USER@$EC2_HOST << EOF
  pkill -f $JAR_NAME || true
  sleep 2
  # 🔐 환경변수 로드
  source ~/.env_coby

  nohup env \
    GOOGLE_CLIENT_ID="\$GOOGLE_CLIENT_ID" \
    GOOGLE_CLIENT_SECRET="\$GOOGLE_CLIENT_SECRET" \
    KAKAO_CLIENT_ID="\$KAKAO_CLIENT_ID" \
    DB_USERNAME="\$DB_USERNAME" \
    DB_PASSWORD="\$DB_PASSWORD" \
  nohup java -jar $JAR_NAME > log.txt 2>&1 &
  echo "✅ 서버 실행됨! (백그라운드 실행 중)"
EOF

echo "🎉 배포 완료! $REACT_API_URL 에서 서버 확인 가능"