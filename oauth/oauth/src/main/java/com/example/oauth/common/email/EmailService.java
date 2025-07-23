// EmailService.java
package com.example.oauth.common.email;

public interface EmailService {
    void sendEmail(String to, String subject, String text);
}

