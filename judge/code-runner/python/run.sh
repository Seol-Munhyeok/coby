#!/bin/bash
cd /app/code

# 두 파일을 병렬로 한 줄씩 읽음
paste testcase.txt result.txt | while IFS=$'\t' read -r testcase expected; do

    # 코드 실행 후 실제 출력 저장
    output=$(echo "$testcase" | python3 Main.py)

    # 줄 끝 공백 제거 후 비교
    trimmed_output=$(echo "$output" | sed 's/[[:space:]]*$//')
    trimmed_expected=$(echo "$expected" | sed 's/[[:space:]]*$//')

    if [ "$trimmed_output" != "$trimmed_expected" ]; then
        echo "Fail"
        exit 0
    fi
done

echo "Pass"
exit 0

