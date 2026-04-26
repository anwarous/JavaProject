package com.shopflow.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Requests {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        @NotBlank
        private String role; // CUSTOMER or SELLER
        // Seller fields (optional)
        private String shopName;
        private String shopDescription;
        private String shopLogo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RefreshTokenRequest {
        @NotBlank
        private String refreshToken;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductRequest {
        @NotBlank
        private String name;
        private String description;
        @NotNull @DecimalMin("0.01")
        private BigDecimal price;
        private BigDecimal promoPrice;
        @NotNull @Min(0)
        private Integer stock;
        private List<Long> categoryIds;
        private List<String> images;
        private List<VariantRequest> variants;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VariantRequest {
        @NotBlank
        private String attribute;
        @NotBlank
        private String value;
        private Integer additionalStock;
        private BigDecimal priceDelta;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryRequest {
        @NotBlank
        private String name;
        private String description;
        private Long parentId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemRequest {
        @NotNull
        private Long productId;
        private Long variantId;
        @NotNull @Min(1)
        private Integer quantity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemUpdateRequest {
        @NotNull @Min(1)
        private Integer quantity;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CouponApplyRequest {
        @NotBlank
        private String code;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderRequest {
        @NotNull
        private Long addressId;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderStatusRequest {
        @NotBlank
        private String status;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReviewRequest {
        @NotNull
        private Long productId;
        @NotNull @Min(1) @Max(5)
        private Integer rating;
        private String comment;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CouponRequest {
        @NotBlank
        private String code;
        @NotBlank
        private String type; // PERCENT or FIXED
        @NotNull @DecimalMin("0.01")
        private BigDecimal value;
        private LocalDateTime expirationDate;
        private Integer maxUsages;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressRequest {
        @NotBlank
        private String street;
        @NotBlank
        private String city;
        @NotBlank
        private String zipCode;
        @NotBlank
        private String country;
        private boolean primary;
    }
}
