package com.example.coby.dto;

import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonInclude;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CodeUpdateMessage(
        String type,     // "code_update", "submit_code" 등 다양한 타입으로 사용 가능
        String roomId,
        String userId,
        int lineCount,   // code_update 메시지에 주로 사용
        //String code,     // submit_code 또는 code_update에 코드 내용 포함 시 사용
        String language  // submit_code에 주로 사용
) {}