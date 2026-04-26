package com.shopflow.dto.response;

import com.shopflow.enums.CouponType;
import com.shopflow.enums.OrderStatus;
import com.shopflow.enums.Role;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class Responses {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private UserResponse user;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private Role role;
        private boolean active;
        private LocalDateTime createdAt;
        private SellerProfileResponse sellerProfile;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SellerProfileResponse {
        private Long id;
        private String shopName;
        private String description;
        private String logo;
        private Double rating;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal promoPrice;
        private Integer stock;
        private boolean active;
        private LocalDateTime createdAt;
        private Double averageRating;
        private Integer totalSold;
        private List<String> images;
        private List<CategoryResponse> categories;
        private List<VariantResponse> variants;
        private SellerSummary seller;
        private List<ReviewResponse> reviews;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductSummaryResponse {
        private Long id;
        private String name;
        private BigDecimal price;
        private BigDecimal promoPrice;
        private Integer stock;
        private Double averageRating;
        private Integer totalSold;
        private String image;
        private String sellerShopName;
        private boolean active;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SellerSummary {
        private Long id;
        private String shopName;
        private Double rating;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class VariantResponse {
        private Long id;
        private String attribute;
        private String value;
        private Integer additionalStock;
        private BigDecimal priceDelta;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
        private Long parentId;
        private List<CategoryResponse> children;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartResponse {
        private Long id;
        private List<CartItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal shippingFee;
        private BigDecimal discount;
        private BigDecimal totalTTC;
        private CouponSummary coupon;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal lineTotal;
        private VariantResponse variant;
        private Integer availableStock;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CouponSummary {
        private String code;
        private CouponType type;
        private BigDecimal value;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private OrderStatus status;
        private String shippingAddress;
        private BigDecimal subtotal;
        private BigDecimal shippingFee;
        private BigDecimal discount;
        private BigDecimal totalTTC;
        private LocalDateTime orderDate;
        private boolean isNew;
        private List<OrderItemResponse> items;
        private String customerName;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String productName;
        private String variantInfo;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ReviewResponse {
        private Long id;
        private String customerName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
        private boolean approved;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CouponResponse {
        private Long id;
        private String code;
        private CouponType type;
        private BigDecimal value;
        private LocalDateTime expirationDate;
        private Integer maxUsages;
        private Integer currentUsages;
        private boolean active;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressResponse {
        private Long id;
        private String street;
        private String city;
        private String zipCode;
        private String country;
        private boolean primary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AdminDashboard {
        private BigDecimal totalRevenue;
        private Long totalOrders;
        private Long pendingOrders;
        private Long totalUsers;
        private Long totalProducts;
        private List<ProductSummaryResponse> topProducts;
        private List<OrderResponse> recentOrders;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SellerDashboard {
        private BigDecimal revenue;
        private Long pendingOrders;
        private Long totalProducts;
        private List<ProductSummaryResponse> lowStockProducts;
        private List<OrderResponse> recentOrders;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
