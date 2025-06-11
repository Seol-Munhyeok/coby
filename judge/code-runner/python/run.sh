#!/bin/bash
cd /app/code
# 통계 변수 초기화
test_count=0
total_real_time=0
total_memory=0
RUN_CMD="python3 Main.py"

dos2unix /app/code/*.txt > /dev/null 2>&1

# 두 파일을 병렬로 한 줄씩 읽음
while IFS=$'\t' read -r testcase expected; do
    test_count=$((test_count + 1))
    
    # 임시 파일로 time 출력 저장
    TIME_OUTPUT=$(mktemp)
    
    # time 명령어로 실행 시간 및 리소스 사용량 측정
    output=$(echo "$testcase" | /usr/bin/time -f "REAL_TIME:%e|MAX_MEMORY:%M" -o "$TIME_OUTPUT" $RUN_CMD 2>&1)
    exit_code=$?
    
    # 실행 실패 체크
    if [ $exit_code -ne 0 ]; then
        rm -f "$TIME_OUTPUT"
        echo "[DEBUG] Runtime error ["$testcase"|"$exit_code"|"$output"]"
        echo "Fail"
        exit 0
    fi
    
    # time 정보 읽기
    if [ -f "$TIME_OUTPUT" ]; then
        time_info=$(cat "$TIME_OUTPUT")
        rm "$TIME_OUTPUT"
        
        # 시간과 메모리 정보 파싱
        real_time=$(echo "$time_info" | grep -o "REAL_TIME:[0-9]*\.[0-9]*" | cut -d':' -f2)
        max_memory=$(echo "$time_info" | grep -o "MAX_MEMORY:[0-9]*" | cut -d':' -f2)
        
        # 메모리를 MB로 변환 (KB -> MB)
        memory_mb=$(echo "scale=2; $max_memory / 1024" | bc -l)
    else
        echo "[DEBUG] Cannot read time_info: ["$time_info"]"
        echo "Fail"
        exit 0
    fi
    
    # 결과 비교 (줄 끝 공백 제거)
    trimmed_output=$(echo "$output" | sed 's/[[:space:]]*$//')
    trimmed_expected=$(echo "$expected" | sed 's/[[:space:]]*$//')

    if [ "$trimmed_output" != "$trimmed_expected" ]; then
        echo "Actual: [$trimmed_output]"
        echo "Expected: [$trimmed_expected]"
        echo "Fail"
        exit 0
    fi
    
    # 통계 누적
    total_real_time=$(echo "$total_real_time + $real_time" | bc -l)
    total_memory=$(echo "$total_memory + $memory_mb" | bc -l)
done < <(paste testcase.txt result.txt)

# 모든 테스트케이스 통과 시 평균 계산 및 출력
if [ $test_count -gt 0 ]; then
    raw_avg_time=$(echo "scale=4; $total_real_time / $test_count" | bc -l)
    raw_avg_memory=$(echo "scale=2; $total_memory / $test_count" | bc -l)
    avg_time=$(printf "%.4f" "$raw_avg_time")
    avg_memory=$(printf "%.2f" "$raw_avg_memory")
    echo "Pass|${avg_time}|${avg_memory}"
else
    echo "[DEBUG] Last"
    echo "Fail"
fi

exit 0