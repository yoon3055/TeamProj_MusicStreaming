package com.music.subscription.service;

/**
 * 푸시 알림 전송을 위한 인터페이스
 */
public interface PushNotificationClient {
    /**
     * 특정 사용자에게 푸시 알림을 전송합니다.
     *
     * @param userId 대상 사용자 ID
     * @param title 알림 제목
     * @param message 알림 메시지
     */
    void send(Long userId, String title, String message);
}
