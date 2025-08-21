package com.music.common.config;

import com.music.subscription.service.PushNotificationClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PushNotificationConfig {

    /**
     * PushNotificationClient 인터페이스를 구현하는 Bean 등록
     */
    @Bean
    public PushNotificationClient pushNotificationClient() {
        return (userId, title, message) -> {
            // TODO: 실제 푸시 알림 로직 구현 (예: FCM, APNs 연동)
            System.out.printf("[PUSH MOCK] userId=%d, title='%s', message='%s'%n",
                              userId, title, message);
        };
    }
}
