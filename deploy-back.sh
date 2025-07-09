#!/bin/bash
set -e

# === 사용자 설정 ===
JAR_NAME="coby-0.0.1-SNAPSHOT.jar"
EC2_USER="ubuntu"
EC2_HOST="54.180.197.9"
EC2_KEY_PATH="/d/coby_bastion.pem"

# === [1] Spring Boot JAR 빌드 ===
echo "🛠️ [1/3] Spring Boot JAR 빌드 중..."
cd backend || exit

export JAVA_HOME="/c/Program Files/Java/jdk-17"
export PATH="$JAVA_HOME/bin:$PATH"

./gradlew clean build -x test
cd ..

# === [2] EC2에 JAR 전송 ===
echo "🚀 [2/3] EC2에 JAR 전송 중..."
scp -i "$EC2_KEY_PATH" backend/build/libs/$JAR_NAME $EC2_USER@$EC2_HOST:/home/$EC2_USER/

# === [3] EC2에서 서버 재시작 ===
echo "🔁 [3/3] EC2 서버 재실행..."
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

echo "🎉 백엔드만 배포 완료!"
