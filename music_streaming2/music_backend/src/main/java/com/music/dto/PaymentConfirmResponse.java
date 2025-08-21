package com.music.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentConfirmResponse {
    private String planType;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String paymentKey;
    private String orderId;
    private Integer amount;
}
