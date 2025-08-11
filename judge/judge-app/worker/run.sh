#!/bin/bash

# run.sh
# 인자: $1 = 언어 (python, java, cpp), $2 = 소스 코드 파일명 (예: Main.py)
# 모든 파일은 현재 작업 디렉토리 (Lambda의 /tmp/[submission_id])에 있다고 가정합니다.
# 테스트케이스 파일은 testcase.txt, 정답 파일은 result.txt로 가정합니다.

LANGUAGE=$1
SOURCE_FILE=$2
TESTCASE_FILE="testcase.txt" # Lambda 핸들러에서 생성할 파일
EXPECTED_RESULT_FILE="result.txt" # Lambda 핸들러에서 생성할 파일

OUTPUT_FILE="user_output.txt"
ERROR_FILE="runtime_error.txt"
COMPILE_ERROR_FILE="compile_error.txt"
JUDGE_RESULT_FILE="judge_result.json" # 최종 결과를 JSON 형태로 저장할 파일

# 이전 실행 결과 파일 삭제 (재실행 방지)
rm -f "$OUTPUT_FILE" "$ERROR_FILE" "$COMPILE_ERROR_FILE" "$JUDGE_RESULT_FILE"

# 채점 결과 초기화
RESULT_STATUS="Unknown Error"
EXEC_TIME="N/A"
MEM_USAGE="N/A"
COMPILE_OUTPUT=""
RUNTIME_OUTPUT=""
USER_OUTPUT=""

# dos2unix를 사용하여 입력 파일 형식 통일
dos2unix "$TESTCASE_FILE" "$EXPECTED_RESULT_FILE" > /dev/null 2>&1

# 사용자 코드 실행 시간 및 메모리 제한 (ulimit)
# Lambda의 전체 시간/메모리 제한과 별개로, 사용자 코드 실행에 대한 추가적인 제한을 두는 것이 좋습니다.
# 예시: CPU 시간 5초, 가상 메모리 256MB (256 * 1024 KB)
# ulimit -t 5
# ulimit -v 262144

case "$LANGUAGE" in
    "python")
        # Python 코드 실행
        # timeout 명령어는 지정된 시간 내에 명령이 완료되지 않으면 종료합니다.
        # /usr/bin/time -f "%e %M"은 실행 시간(초)과 최대 상주 메모리(KB)를 측정합니다.
        # 2>&1은 stderr를 stdout으로 리다이렉트합니다.
        (timeout 5s /usr/bin/time -f "%e %M" -o "time_output.tmp" python3 "$SOURCE_FILE" < "$TESTCASE_FILE" > "$OUTPUT_FILE" 2> "$ERROR_FILE")
        EXIT_CODE=$?
        
        # time 명령어의 출력에서 실행 시간과 메모리 사용량 파싱
        if [ -f "time_output.tmp" ]; then
            TIME_OUTPUT=$(cat "time_output.tmp")
            EXEC_TIME=$(echo "$TIME_OUTPUT" | awk '{print $1}')
            MEM_USAGE=$(echo "$TIME_OUTPUT" | awk '{print $2}')
            rm "time_output.tmp"
        fi

        if [ $EXIT_CODE -eq 124 ]; then
            RESULT_STATUS="Time Limit Exceeded"
        elif [ $EXIT_CODE -ne 0 ]; then
            RESULT_STATUS="Runtime Error"
            RUNTIME_OUTPUT=$(cat "$ERROR_FILE")
        else
            # 정답 확인 로직 (user_output.txt와 result.txt 비교)
            # -q 옵션은 차이점을 출력하지 않고 종료 코드만 반환합니다.
            diff -w -q "$OUTPUT_FILE" "$EXPECTED_RESULT_FILE" > /dev/null
            if [ $? -eq 0 ]; then
                RESULT_STATUS="Accepted"
            else
                RESULT_STATUS="Wrong Answer"
            fi
        fi
        ;;
    "java")
        # Java 컴파일
        javac "$SOURCE_FILE" 2> "$COMPILE_ERROR_FILE"
        if [ $? -ne 0 ]; then
            RESULT_STATUS="Compile Error"
            COMPILE_OUTPUT=$(cat "$COMPILE_ERROR_FILE")
        else
            # Java 실행 (클래스 이름은 Main.java -> Main)
            CLASS_NAME=$(basename "$SOURCE_FILE" .java)
            (timeout 5s /usr/bin/time -f "%e %M" -o "time_output.tmp" java "$CLASS_NAME" < "$TESTCASE_FILE" > "$OUTPUT_FILE" 2> "$ERROR_FILE")
            EXIT_CODE=$?

            # time 명령어의 출력에서 실행 시간과 메모리 사용량 파싱
            if [ -f "time_output.tmp" ]; then
                TIME_OUTPUT=$(cat "time_output.tmp")
                EXEC_TIME=$(echo "$TIME_OUTPUT" | awk '{print $1}')
                MEM_USAGE=$(echo "$TIME_OUTPUT" | awk '{print $2}')
                rm "time_output.tmp"
            fi

            if [ $EXIT_CODE -eq 124 ]; then
                RESULT_STATUS="Time Limit Exceeded"
            elif [ $EXIT_CODE -ne 0 ]; then
                RESULT_STATUS="Runtime Error"
                RUNTIME_OUTPUT=$(cat "$ERROR_FILE")
            else
                diff -w -q "$OUTPUT_FILE" "$EXPECTED_RESULT_FILE" > /dev/null
                if [ $? -eq 0 ]; then
                    RESULT_STATUS="Accepted"
                else
                    RESULT_STATUS="Wrong Answer"
                fi
            fi
        fi
        ;;
    "cpp")
        # C++ 컴파일
        g++ "$SOURCE_FILE" -o a.out 2> "$COMPILE_ERROR_FILE"
        if [ $? -ne 0 ]; then
            RESULT_STATUS="Compile Error"
            COMPILE_OUTPUT=$(cat "$COMPILE_ERROR_FILE")
        else
            # C++ 실행
            (timeout 5s /usr/bin/time -f "%e %M" -o "time_output.tmp" ./a.out < "$TESTCASE_FILE" > "$OUTPUT_FILE" 2> "$ERROR_FILE")
            EXIT_CODE=$?

            # time 명령어의 출력에서 실행 시간과 메모리 사용량 파싱
            if [ -f "time_output.tmp" ]; then
                TIME_OUTPUT=$(cat "time_output.tmp")
                EXEC_TIME=$(echo "$TIME_OUTPUT" | awk '{print $1}')
                MEM_USAGE=$(echo "$TIME_OUTPUT" | awk '{print $2}')
                rm "time_output.tmp"
            fi

            if [ $EXIT_CODE -eq 124 ]; then
                RESULT_STATUS="Time Limit Exceeded"
            elif [ $EXIT_CODE -ne 0 ]; then
                RESULT_STATUS="Runtime Error"
                RUNTIME_OUTPUT=$(cat "$ERROR_FILE")
            else
                diff -w -q "$OUTPUT_FILE" "$EXPECTED_RESULT_FILE" > /dev/null
                if [ $? -eq 0 ]; then
                    RESULT_STATUS="Accepted"
                else
                    RESULT_STATUS="Wrong Answer"
                fi
            fi
        fi
        ;;
    *)
        RESULT_STATUS="Unsupported Language"
        ;;
esac

# 사용자 코드의 표준 출력 캡처
if [ -f "$OUTPUT_FILE" ]; then
    USER_OUTPUT=$(cat "$OUTPUT_FILE")
fi

# 최종 결과를 JSON 파일로 저장
# JSON 문자열 내부에 줄바꿈이나 따옴표가 있을 경우를 대비하여 이스케이프 처리
cat << EOF > "$JUDGE_RESULT_FILE"
{
  "status": "$RESULT_STATUS",
  "execution_time": "$EXEC_TIME",
  "memory_usage": "$MEM_USAGE",
  "compile_output": "$(echo "$COMPILE_OUTPUT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')",
  "runtime_output": "$(echo "$RUNTIME_OUTPUT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')",
  "user_output": "$(echo "$USER_OUTPUT" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')"
}
EOF