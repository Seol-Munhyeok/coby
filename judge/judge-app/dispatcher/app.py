import os
import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

lambda_client = boto3.client('lambda')

# 언어별 작업자 Lambda 함수 이름 (환경 변수로 설정하는 것이 좋음)
WORKER_LAMBDA_MAP = {
    'python': os.environ.get('PYTHON_WORKER_LAMBDA_NAME', 'judge-worker-python'),
    'java': os.environ.get('JAVA_WORKER_LAMBDA_NAME', 'judge-worker-java'),
    'cpp': os.environ.get('CPP_WORKER_LAMBDA_NAME', 'judge-worker-cpp')
}

def handler(event, context):
    for record in event['Records']:
        try:
            message_body = json.loads(record['body'])
            language = message_body.get('language')

            if not language:
                logger.error(f"Language not specified in message: {message_body}")
                continue

            worker_lambda_name = WORKER_LAMBDA_MAP.get(language)

            if not worker_lambda_name:
                logger.error(f"No worker Lambda configured for language: {language}")
                continue

            logger.info(f"Dispatching submission {message_body.get('submission_id')} for language {language} to {worker_lambda_name}")

            # 작업자 Lambda를 비동기적으로 호출
            lambda_client.invoke(
                FunctionName=worker_lambda_name,
                InvocationType='Event',  # 비동기 호출
                Payload=json.dumps(message_body)
            )

        except Exception as e:
            logger.error(f"Error dispatching message: {record['body']}", exc_info=True)
            # 필요하다면, 실패한 메시지를 Dead Letter Queue(DLQ)로 보내도록 설정할 수 있습니다.
            # 현재는 로깅만 처리합니다.
            continue

    return {
        'statusCode': 200,
        'body': json.dumps('Dispatching complete')
    }
