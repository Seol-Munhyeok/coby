#!/bin/bash
ps -ef | grep 'java -jar' | grep -v grep | awk '{print $2}' | xargs -r kill -9
