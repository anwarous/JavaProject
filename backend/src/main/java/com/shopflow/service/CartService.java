package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CouponRepository couponRepository;
    private final EntityMapper mapper;

    private static final BigDecimal SHIPPING_FEE = new BigDecimal("7.00");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("100.00");

    public CartResponse getCart(User customer) {
        Cart cart = getOrCreateCart(customer);
        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(User customer, CartItemRequest request) {
        Cart cart = getOrCreateCart(customer);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isActive()) {
            throw new BusinessException("Product is no longer available");
        }

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant", "id", request.getVariantId()));
        }

        // Check stock
        int availableStock = product.getStock() + (variant != null ? variant.getAdditionalStock() : 0);
        if (request.getQuantity() > availableStock) {
            throw new InsufficientStockException(product.getName(), request.getQuantity(), availableStock);
        }

        // Check if item already in cart
        CartItem existingItem;
        if (variant != null) {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantId(
                    cart.getId(), product.getId(), variant.getId()).orElse(null);
        } else {
            existingItem = cartItemRepository.findByCartIdAndProductIdAndVariantIsNull(
                    cart.getId(), product.getId()).orElse(null);
        }

        if (existingItem != null) {
            int newQty = existingItem.getQuantity() + request.getQuantity();
            if (newQty > availableStock) {
                throw new InsufficientStockException(product.getName(), newQty, availableStock);
            }
            existingItem.setQuantity(newQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartRepository.save(cart);
        }

        return buildCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse updateItemQuantity(User customer, Long itemId, CartItemUpdateRequest request) {
        Cart cart = getOrCreateCart(customer);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AccessDeniedException("This item is not in your cart");
        }

        int availableStock = item.getProduct().getStock()
                + (item.getVariant() != null ? item.getVariant().getAdditionalStock() : 0);
        if (request.getQuantity() > availableStock) {
            throw new InsufficientStockException(item.getProduct().getName(), request.getQuantity(), availableStock);
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return buildCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse removeItem(User customer, Long itemId) {
        Cart cart = getOrCreateCart(customer);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new AccessDeniedException("This item is not in your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return buildCartResponse(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Transactional
    public CartResponse applyCoupon(User customer, CouponApplyRequest request) {
        Cart cart = getOrCreateCart(customer);
        Coupon coupon = couponRepository.findByCode(request.getCode())
                .orElseThrow(() -> new InvalidCouponException("Invalid coupon code: " + request.getCode()));

        if (!coupon.isActive()) {
            throw new InvalidCouponException("Coupon is inactive");
        }
        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new InvalidCouponException("Coupon has expired");
        }
        if (coupon.getCurrentUsages() >= coupon.getMaxUsages()) {
            throw new InvalidCouponException("Coupon usage limit reached");
        }

        cart.setCoupon(coupon);
        cartRepository.save(cart);

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCoupon(User customer) {
        Cart cart = getOrCreateCart(customer);
        cart.setCoupon(null);
        cartRepository.save(cart);
        return buildCartResponse(cart);
    }

    // Helpers
    private Cart getOrCreateCart(User customer) {
        return cartRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> cartRepository.save(Cart.builder().customer(customer).build()));
    }

    private CartResponse buildCartResponse(Cart cart) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal unitPrice = item.getProduct().getPromoPrice() != null
                    ? item.getProduct().getPromoPrice() : item.getProduct().getPrice();
            if (item.getVariant() != null && item.getVariant().getPriceDelta() != null) {
                unitPrice = unitPrice.add(item.getVariant().getPriceDelta());
            }
            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;

        BigDecimal discount = BigDecimal.ZERO;
        if (cart.getCoupon() != null) {
            Coupon coupon = cart.getCoupon();
            if (coupon.getType() == CouponType.PERCENT) {
                discount = subtotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                discount = coupon.getValue().min(subtotal);
            }
        }

        BigDecimal total = subtotal.subtract(discount).add(shipping).max(BigDecimal.ZERO);

        return mapper.toCartResponse(cart, subtotal, shipping, discount, total);
    }
}
