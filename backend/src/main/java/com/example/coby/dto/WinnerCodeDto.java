package com.example.coby.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Data
@Getter
@Setter
public class WinnerCodeDto {
    private String code;
    private String language;
    private Long Id;
    private String nickname;
}
