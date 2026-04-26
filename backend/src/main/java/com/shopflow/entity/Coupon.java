package com.shopflow.entity;

import com.shopflow.enums.CouponType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    private LocalDateTime expirationDate;

    @Builder.Default
    private Integer maxUsages = 100;

    @Builder.Default
    private Integer currentUsages = 0;

    @Builder.Default
    private boolean active = true;
}
