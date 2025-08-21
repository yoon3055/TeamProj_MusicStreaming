package com.music.dto;

import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private String paymentKey;
    private String orderId;
    private Integer amount;
}
