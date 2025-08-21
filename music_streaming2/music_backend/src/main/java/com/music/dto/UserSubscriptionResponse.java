package com.music.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class UserSubscriptionResponse {
    private String planType;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String planName;
    private Integer price;
    private String description;
}
