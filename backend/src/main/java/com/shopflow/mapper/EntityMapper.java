package com.shopflow.mapper;

import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    // ========== USER ==========
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .sellerProfile(user.getSellerProfile() != null ? toSellerProfileResponse(user.getSellerProfile()) : null)
                .build();
    }

    public SellerProfileResponse toSellerProfileResponse(SellerProfile sp) {
        if (sp == null) return null;
        return SellerProfileResponse.builder()
                .id(sp.getId())
                .shopName(sp.getShopName())
                .description(sp.getDescription())
                .logo(sp.getLogo())
                .rating(sp.getRating())
                .build();
    }

    // ========== PRODUCT ==========
    public ProductResponse toProductResponse(Product product) {
        if (product == null) return null;
        ProductResponse.ProductResponseBuilder builder = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .promoPrice(product.getPromoPrice())
                .stock(product.getStock())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .averageRating(product.getAverageRating())
                .totalSold(product.getTotalSold())
                .images(product.getImages());

        if (product.getCategories() != null) {
            builder.categories(product.getCategories().stream()
                    .map(this::toCategoryResponseFlat).collect(Collectors.toList()));
        }
        if (product.getVariants() != null) {
            builder.variants(product.getVariants().stream()
                    .map(this::toVariantResponse).collect(Collectors.toList()));
        }
        if (product.getSeller() != null && product.getSeller().getSellerProfile() != null) {
            SellerProfile sp = product.getSeller().getSellerProfile();
            builder.seller(SellerSummary.builder()
                    .id(product.getSeller().getId())
                    .shopName(sp.getShopName())
                    .rating(sp.getRating())
                    .build());
        }
        return builder.build();
    }

    public ProductSummaryResponse toProductSummary(Product product) {
        if (product == null) return null;
        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .promoPrice(product.getPromoPrice())
                .stock(product.getStock())
                .averageRating(product.getAverageRating())
                .totalSold(product.getTotalSold())
                .active(product.isActive())
                .image(product.getImages() != null && !product.getImages().isEmpty()
                        ? product.getImages().get(0) : null)
                .sellerShopName(product.getSeller() != null && product.getSeller().getSellerProfile() != null
                        ? product.getSeller().getSellerProfile().getShopName() : null)
                .build();
    }

    public VariantResponse toVariantResponse(ProductVariant variant) {
        if (variant == null) return null;
        return VariantResponse.builder()
                .id(variant.getId())
                .attribute(variant.getAttribute())
                .value(variant.getValue())
                .additionalStock(variant.getAdditionalStock())
                .priceDelta(variant.getPriceDelta())
                .build();
    }

    // ========== CATEGORY ==========
    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .children(category.getChildren() != null
                        ? category.getChildren().stream().map(this::toCategoryResponse).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    private CategoryResponse toCategoryResponseFlat(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .build();
    }

    // ========== CART ==========
    public CartResponse toCartResponse(Cart cart, BigDecimal subtotal, BigDecimal shipping,
                                        BigDecimal discount, BigDecimal total) {
        if (cart == null) return null;
        CartResponse.CartResponseBuilder builder = CartResponse.builder()
                .id(cart.getId())
                .subtotal(subtotal)
                .shippingFee(shipping)
                .discount(discount)
                .totalTTC(total);

        if (cart.getItems() != null) {
            builder.items(cart.getItems().stream().map(this::toCartItemResponse).collect(Collectors.toList()));
        }
        if (cart.getCoupon() != null) {
            builder.coupon(CouponSummary.builder()
                    .code(cart.getCoupon().getCode())
                    .type(cart.getCoupon().getType())
                    .value(cart.getCoupon().getValue())
                    .build());
        }
        return builder.build();
    }

    public CartItemResponse toCartItemResponse(CartItem item) {
        if (item == null) return null;
        BigDecimal unitPrice = item.getProduct().getPromoPrice() != null
                ? item.getProduct().getPromoPrice() : item.getProduct().getPrice();
        if (item.getVariant() != null && item.getVariant().getPriceDelta() != null) {
            unitPrice = unitPrice.add(item.getVariant().getPriceDelta());
        }
        int availableStock = item.getProduct().getStock();
        if (item.getVariant() != null) {
            availableStock += item.getVariant().getAdditionalStock();
        }
        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .productImage(item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                        ? item.getProduct().getImages().get(0) : null)
                .unitPrice(unitPrice)
                .quantity(item.getQuantity())
                .lineTotal(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())))
                .variant(item.getVariant() != null ? toVariantResponse(item.getVariant()) : null)
                .availableStock(availableStock)
                .build();
    }

    // ========== ORDER ==========
    public OrderResponse toOrderResponse(Order order) {
        if (order == null) return null;
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .subtotal(order.getSubtotal())
                .shippingFee(order.getShippingFee())
                .discount(order.getDiscount())
                .totalTTC(order.getTotalTTC())
                .orderDate(order.getOrderDate())
                .isNew(order.isNew())
                .customerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName())
                .items(order.getItems() != null
                        ? order.getItems().stream().map(this::toOrderItemResponse).collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }

    public OrderItemResponse toOrderItemResponse(OrderItem item) {
        if (item == null) return null;
        return OrderItemResponse.builder()
                .id(item.getId())
                .productName(item.getProductName())
                .variantInfo(item.getVariantInfo())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }

    // ========== REVIEW ==========
    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        return ReviewResponse.builder()
                .id(review.getId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .approved(review.isApproved())
                .build();
    }

    // ========== COUPON ==========
    public CouponResponse toCouponResponse(Coupon coupon) {
        if (coupon == null) return null;
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .type(coupon.getType())
                .value(coupon.getValue())
                .expirationDate(coupon.getExpirationDate())
                .maxUsages(coupon.getMaxUsages())
                .currentUsages(coupon.getCurrentUsages())
                .active(coupon.isActive())
                .build();
    }

    // ========== ADDRESS ==========
    public AddressResponse toAddressResponse(Address address) {
        if (address == null) return null;
        return AddressResponse.builder()
                .id(address.getId())
                .street(address.getStreet())
                .city(address.getCity())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .primary(address.isPrimary())
                .build();
    }

    // ========== PAGE ==========
    public <T> PageResponse<T> toPageResponse(Page<?> page, List<T> content) {
        return PageResponse.<T>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
