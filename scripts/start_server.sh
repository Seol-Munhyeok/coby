#!/bin/bash
set -euo pipefail   # 에러나면 바로 종료 + 미정의 변수 잡기

# ────────────── 경로 자동 감지 ──────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"   # start_server.sh 위치 (…/scripts)
APP_DIR="$(dirname "$SCRIPT_DIR")"            # 그 상위 폴더 (revision 루트)
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_BUILD_DIR="$APP_DIR/frontend/build"
LOG_FILE="$APP_DIR/server.log"
ENV_FILE="$SCRIPT_DIR/env.sh"                 # scripts/env.sh

echo "📁 SCRIPT_DIR = $SCRIPT_DIR"
echo "📁 APP_DIR    = $APP_DIR"

# ────────────── 환경 변수 로드 ──────────────
if [ -f "$ENV_FILE" ]; then
  echo "🔧 env.sh 로드 중..."
  set -a          # source 되는 변수 전부 export
  source "$ENV_FILE"
  set +a
else
  echo "❌ $ENV_FILE 을(를) 찾을 수 없습니다."
fi

# ────────────── JAR 선택 ──────────────
JAR_FILE=$(find "$BACKEND_DIR" -type f -name "*.jar" ! -name "*plain*.jar" | sort | tail -n 1)
if [ -z "$JAR_FILE" ]; then
  echo "❌ JAR 파일을 찾지 못했습니다."
  exit 1
fi

# ────────────── 프론트 빌드 배포 (선택) ──────────────
if [ -d "$FRONTEND_BUILD_DIR" ]; then
  sudo cp -r "$FRONTEND_BUILD_DIR"/* /var/www/html
else
  echo "⚠️  frontend/build 폴더 없음 — 건너뜀"
fi

# ────────────── 스프링 부트 실행 ──────────────
echo "🚀 실행 중: $JAR_FILE"
nohup java \
  -Dspring.datasource.username="$DB_USERNAME" \
  -Dspring.datasource.password="$DB_PASSWORD" \
  -Dspring.security.oauth2.client.registration.google.client-id="$GOOGLE_CLIENT_ID" \
  -Dspring.security.oauth2.client.registration.google.client-secret="$GOOGLE_CLIENT_SECRET" \
  -Dspring.security.oauth2.client.registration.kakao.client-id="$KAKAO_CLIENT_ID" \
  -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
