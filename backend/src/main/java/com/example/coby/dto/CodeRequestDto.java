package com.example.coby.dto;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
public class CodeRequestDto {
    private String code;
    private String language;

    public String getCode() {
        log.info(this.code + "\n");
        return this.code;
    }

    public String getLanguage() {
        log.info(this.language);
        return this.language;
    }
}
