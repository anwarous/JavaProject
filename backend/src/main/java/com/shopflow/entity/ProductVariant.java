package com.shopflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    @Column(nullable = false)
    private String attribute; // e.g., "Taille", "Couleur"

    @Column(name = "option_value", nullable = false)
    private String value; // e.g., "M", "Rouge"

    @Builder.Default
    private Integer additionalStock = 0;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal priceDelta = BigDecimal.ZERO;
}
