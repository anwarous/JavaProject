package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import com.shopflow.enums.CouponType;
import com.shopflow.enums.OrderStatus;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final EntityMapper mapper;

    private static final BigDecimal SHIPPING_FEE = new BigDecimal("7.00");
    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("100.00");
    private static final AtomicLong orderCounter = new AtomicLong(10000);

    @Transactional
    public OrderResponse placeOrder(User customer, OrderRequest request) {
        Cart cart = cartRepository.findByCustomerId(customer.getId())
                .orElseThrow(() -> new BusinessException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        // Verify address
        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));
        if (!address.getUser().getId().equals(customer.getId())) {
            throw new AccessDeniedException("This address does not belong to you");
        }

        // Calculate totals and verify stock
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            ProductVariant variant = cartItem.getVariant();
            int availableStock = product.getStock() + (variant != null ? variant.getAdditionalStock() : 0);

            if (cartItem.getQuantity() > availableStock) {
                throw new InsufficientStockException(product.getName(), cartItem.getQuantity(), availableStock);
            }

            BigDecimal unitPrice = product.getPromoPrice() != null ? product.getPromoPrice() : product.getPrice();
            if (variant != null && variant.getPriceDelta() != null) {
                unitPrice = unitPrice.add(variant.getPriceDelta());
            }

            subtotal = subtotal.add(unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity())));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .productName(product.getName())
                    .variantInfo(variant != null ? variant.getAttribute() + ": " + variant.getValue() : null)
                    .build();
            orderItems.add(orderItem);

            // Decrement stock
            if (variant != null) {
                int fromVariant = Math.min(cartItem.getQuantity(), variant.getAdditionalStock());
                variant.setAdditionalStock(variant.getAdditionalStock() - fromVariant);
                int remaining = cartItem.getQuantity() - fromVariant;
                product.setStock(product.getStock() - remaining);
            } else {
                product.setStock(product.getStock() - cartItem.getQuantity());
            }

            product.setTotalSold(product.getTotalSold() + cartItem.getQuantity());
            productRepository.save(product);
        }

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
        BigDecimal discount = BigDecimal.ZERO;

        // Apply coupon
        if (cart.getCoupon() != null) {
            Coupon coupon = cart.getCoupon();
            if (coupon.getType() == CouponType.PERCENT) {
                discount = subtotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                discount = coupon.getValue().min(subtotal);
            }
            coupon.setCurrentUsages(coupon.getCurrentUsages() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal totalTTC = subtotal.subtract(discount).add(shipping).max(BigDecimal.ZERO);

        String shippingAddr = address.getStreet() + ", " + address.getCity()
                + " " + address.getZipCode() + ", " + address.getCountry();

        Order order = Order.builder()
                .customer(customer)
                .orderNumber(generateOrderNumber())
                .shippingAddress(shippingAddr)
                .subtotal(subtotal)
                .shippingFee(shipping)
                .discount(discount)
                .totalTTC(totalTTC)
                .status(OrderStatus.PENDING)
                .build();

        order = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Clear cart
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);

        return mapper.toOrderResponse(order);
    }

    public OrderResponse getOrderById(Long id, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        // Only customer, related seller, or admin can view
        if (!order.getCustomer().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("You cannot view this order");
        }

        return mapper.toOrderResponse(order);
    }

    public PageResponse<OrderResponse> getMyOrders(User customer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findByCustomerId(customer.getId(), pageable);
        List<OrderResponse> content = orders.getContent().stream()
                .map(mapper::toOrderResponse).collect(Collectors.toList());
        return mapper.toPageResponse(orders, content);
    }

    public PageResponse<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findAll(pageable);
        List<OrderResponse> content = orders.getContent().stream()
                .map(mapper::toOrderResponse).collect(Collectors.toList());
        return mapper.toPageResponse(orders, content);
    }

    public PageResponse<OrderResponse> getSellerOrders(User seller, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        Page<Order> orders = orderRepository.findBySellerId(seller.getId(), pageable);
        List<OrderResponse> content = orders.getContent().stream()
                .map(mapper::toOrderResponse).collect(Collectors.toList());
        return mapper.toPageResponse(orders, content);
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatusRequest request, User currentUser) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        OrderStatus newStatus = OrderStatus.valueOf(request.getStatus().toUpperCase());
        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setNew(true);
        return mapper.toOrderResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, User customer) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You can only cancel your own orders");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new BusinessException("Order can only be cancelled when PENDING or PAID");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                variant.setAdditionalStock(variant.getAdditionalStock() + item.getQuantity());
            } else {
                product.setStock(product.getStock() + item.getQuantity());
            }
            product.setTotalSold(Math.max(0, product.getTotalSold() - item.getQuantity()));
            productRepository.save(product);
        }

        return mapper.toOrderResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        Map<OrderStatus, Set<OrderStatus>> allowedTransitions = Map.of(
                OrderStatus.PENDING, Set.of(OrderStatus.PAID, OrderStatus.CANCELLED),
                OrderStatus.PAID, Set.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
                OrderStatus.PROCESSING, Set.of(OrderStatus.SHIPPED),
                OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED)
        );

        Set<OrderStatus> allowed = allowedTransitions.getOrDefault(current, Set.of());
        if (!allowed.contains(next)) {
            throw new BusinessException(
                    String.format("Cannot transition from %s to %s", current, next));
        }
    }

    private String generateOrderNumber() {
        return String.format("ORD-%d-%05d", Year.now().getValue(), orderCounter.incrementAndGet());
    }
}
