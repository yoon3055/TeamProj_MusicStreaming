package com.music.subscription.service;

import com.music.subscription.entity.UserSubscription;
import com.music.subscription.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpirationNotificationService {
    private final UserSubscriptionRepository subRepo;
    private final PushNotificationClient pushClient;

    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void notifyExpiringSoon() {
        var now = LocalDateTime.now();
        var in3 = now.plusDays(3);
        List<UserSubscription> expiring = subRepo.findByEndDateBetween(now, in3);
        expiring.forEach(s -> {
            pushClient.send(
              s.getUser().getId(),
              "구독 만료 알림",
              "귀하의 구독이 " + s.getEndDate().toLocalDate() + "에 만료됩니다."
            );
        });
    }
}
