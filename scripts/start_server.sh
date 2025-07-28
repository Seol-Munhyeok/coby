#!/bin/bash

APP_DIR="/home/ubuntu/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_BUILD_DIR="$APP_DIR/frontend/build"
LOG_FILE="$APP_DIR/server.log"

# ✅ 환경 변수 로드
if [ -f "$APP_DIR/scripts/env.sh" ]; then
  echo "🔧 환경 변수 로딩 중..."
  source "$APP_DIR/scripts/env.sh"
else
  echo "❌ env.sh 파일이 없어 환경변수를 로딩할 수 없습니다."
fi

# 가장 큰 JAR 파일을 선택 (plain.jar 회피)
JAR_FILE=$(find "$BACKEND_DIR" -name "*.jar" | grep -v "plain" | sort | tail -n 1)

# React 빌드 결과 복사
if [ -d "$FRONTEND_BUILD_DIR" ]; then
  sudo cp -r "$FRONTEND_BUILD_DIR"/* /var/www/html
else
  echo "❌ frontend/build 폴더 없음"
fi

# Spring 서버 실행
echo "✅ 실행 중: $JAR_FILE"
nohup java \
  -Dspring.datasource.username="$DB_USERNAME" \
  -Dspring.datasource.password="$DB_PASSWORD" \
  -Dspring.security.oauth2.client.registration.google.client-id="$GOOGLE_CLIENT_ID" \
  -Dspring.security.oauth2.client.registration.google.client-secret="$GOOGLE_CLIENT_SECRET" \
  -Dspring.security.oauth2.client.registration.kakao.client-id="$KAKAO_CLIENT_ID" \
  -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
