package com.music.subscription.repository;

import com.music.subscription.entity.UserSubscription;
import com.music.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserAndIsActive(User user, Boolean isActive);
    
    @Query("SELECT us FROM UserSubscription us WHERE us.user.id = :userId AND us.isActive = true AND us.endDate > CURRENT_TIMESTAMP")
    Optional<UserSubscription> findByUserIdAndIsActiveTrue(@Param("userId") Long userId);
    
    Optional<UserSubscription> findByOrderId(String orderId);
    
    @Query("SELECT COUNT(us) FROM UserSubscription us WHERE us.isActive = true AND us.endDate > CURRENT_TIMESTAMP")
    long countByIsActiveTrue();
    
    @Query("SELECT sp.name, COUNT(us) FROM UserSubscription us JOIN us.subscriptionPlan sp WHERE us.isActive = true AND us.endDate > CURRENT_TIMESTAMP GROUP BY sp.name")
    List<Object[]> countActiveSubscriptionsByPlan();
    
    List<UserSubscription> findByEndDateBetween(LocalDateTime start, LocalDateTime end);
    
    List<UserSubscription> findByUserOrderByStartDateDesc(User user);
}
