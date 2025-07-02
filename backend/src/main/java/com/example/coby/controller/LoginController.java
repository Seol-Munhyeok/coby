package com.example.coby.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LoginController {
    @GetMapping("/login/success")
    public String loginSuccess(@AuthenticationPrincipal OAuth2User user) {
        return "✅ Hello, " + user.getAttribute("email");
    }
}
