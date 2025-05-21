FROM python:3.11-slim
WORKDIR /app
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh
# 작업 디렉토리 생성 (코드 파일 마운트 위치)
RUN mkdir -p /app/code
WORKDIR /app/code
CMD ["/app/run.sh"]
