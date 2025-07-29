#!/bin/bash
APP_DIR="/home/ubuntu/app"
WEB_DIR="/var/www/html"

if [ -d "$APP_DIR" ]; then
  sudo rm -rf ${APP_DIR}/*
fi

if [ -f "${WEB_DIR}/index.html" ]; then
  sudo rm -rf ${WEB_DIR}/*
fi
