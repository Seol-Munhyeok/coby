#!/bin/bash
APP_DIR="/home/ubuntu/app"
WEB_DIR="/var/www/html"

echo "Current user: $(whoami)" >> /tmp/cleanup_debug.log

if [ -d "$APP_DIR" ]; then
  sudo rm -rf ${APP_DIR}/*
fi

if [ -f "${WEB_DIR}/index.html" ]; then
  sudo rm -rf ${WEB_DIR}/*
fi
