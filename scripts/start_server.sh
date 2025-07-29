#!/bin/bash

APP_DIR="/home/ubuntu/app"
JAR_FILE=$(find $APP_DIR/backend -name "*.jar" | head -n 1)
LOG_FILE="/home/ubuntu/app/application.log"

sudo cp -r $APP_DIR/frontend/build/* /var/www/html

nohup java -jar $JAR_FILE > $LOG_FILE 2>&1 &
