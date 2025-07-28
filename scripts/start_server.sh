#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_BUILD_DIR="$APP_DIR/frontend/build"
LOG_FILE="$APP_DIR/server.log"

# 환경 변수는 이미 AWS Secrets Manager로 주입된 걸로 가정

# JAR 찾기
JAR_FILE=$(find "$BACKEND_DIR" -type f -name "*.jar" ! -name "*plain*.jar" | sort | tail -n 1)
if [ -z "$JAR_FILE" ]; then
  echo "❌ JAR 파일을 찾을 수 없습니다."
  exit 1
fi

# 프론트엔드 정적 파일 배포
if [ -d "$FRONTEND_BUILD_DIR" ]; then
  sudo cp -r "$FRONTEND_BUILD_DIR"/* /var/www/html
else
  echo "⚠️  frontend/build 폴더 없음 — 건너뜀"
fi

# Spring Boot 실행
echo "🚀 Spring Boot 실행: $JAR_FILE"
nohup java \
  -Dspring.datasource.username="$DB_USERNAME" \
  -Dspring.datasource.password="$DB_PASSWORD" \
  -Dspring.security.oauth2.client.registration.google.client-id="$GOOGLE_CLIENT_ID" \
  -Dspring.security.oauth2.client.registration.google.client-secret="$GOOGLE_CLIENT_SECRET" \
  -Dspring.security.oauth2.client.registration.kakao.client-id="$KAKAO_CLIENT_ID" \
  -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &

sleep 5

# 서버 프로세스 살아있는지 확인
JAVA_PID=$(pgrep -f "$JAR_FILE")
if [ -z "$JAVA_PID" ]; then
  echo "❌ 서버 실행 실패! 로그 확인 필요"
  tail -n 100 "$LOG_FILE"
  exit 1
else
  echo "✅ 서버 백그라운드 실행 성공 (PID: $JAVA_PID)"
  exit 0
fi
