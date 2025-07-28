#!/bin/bash

APP_DIR="/home/ubuntu/app"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_BUILD_DIR="$APP_DIR/frontend/build"
LOG_FILE="$APP_DIR/server.log"

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
nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
