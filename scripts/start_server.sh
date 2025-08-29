#!/bin/bash

# -------------------------------
# 경로 설정
# -------------------------------
APP_DIR="/home/ubuntu/app"
BUILD_OUTPUT="$APP_DIR/build_output"
BACKEND_DIR="$BUILD_OUTPUT/backend"
FRONTEND_DIR="$BUILD_OUTPUT/frontend/build"
SCRIPTS_DIR="$BUILD_OUTPUT/scripts"
WEB_DIR="/var/www/html"
LOG_FILE="$APP_DIR/application.log"
DEBUG_LOG="/tmp/start_debug.log"

# -------------------------------
# 1. JAR 파일 확인
# -------------------------------
JAR_FILE=$(find $BACKEND_DIR -name "*.jar" | head -n 1)
echo "[$(date)] JAR_FILE=$JAR_FILE" >> $DEBUG_LOG

if [ ! -f "$JAR_FILE" ]; then
  echo "[$(date)] ERROR: JAR 파일이 존재하지 않습니다!" >> $DEBUG_LOG
  exit 1
fi

# -------------------------------
# 2. 환경 변수 로드
# -------------------------------
ENV_FILE="$SCRIPTS_DIR/env.sh"
if [ -f "$ENV_FILE" ]; then
  source $ENV_FILE
  echo "[$(date)] 환경 변수 로드 완료" >> $DEBUG_LOG
else
  echo "[$(date)] WARNING: env.sh 파일이 없습니다. DB 연결 실패 가능" >> $DEBUG_LOG
fi

# -------------------------------
# 3. 프론트엔드 파일 복사 (퍼미션 확보)
# -------------------------------
if [ -d "$FRONTEND_DIR" ]; then
  sudo rm -rf $WEB_DIR/*
  sudo cp -r $FRONTEND_DIR/* $WEB_DIR
  sudo chown -R ubuntu:ubuntu $WEB_DIR
  echo "[$(date)] 프론트엔드 복사 완료" >> $DEBUG_LOG
else
  echo "[$(date)] WARNING: frontend build가 존재하지 않습니다" >> $DEBUG_LOG
fi

# -------------------------------
# 4. 기존 서버 종료
# -------------------------------
EXISTING_PID=$(ps -ef | grep "java -jar $JAR_FILE" | grep -v grep | awk '{print $2}')
if [ ! -z "$EXISTING_PID" ]; then
  kill -9 $EXISTING_PID
  echo "[$(date)] 기존 서버 PID $EXISTING_PID 종료" >> $DEBUG_LOG
fi

# -------------------------------
# 5. 서버 실행
# -------------------------------
nohup java -jar $JAR_FILE > $LOG_FILE 2>&1 &
PID=$!
sleep 2

# -------------------------------
# 6. 실행 확인
# -------------------------------
if ps -p $PID > /dev/null; then
  echo "[$(date)] 서버 실행 성공, PID=$PID" >> $DEBUG_LOG
else
  echo "[$(date)] ERROR: 서버 실행 실패! 로그 확인: $LOG_FILE" >> $DEBUG_LOG
  exit 1
fi

