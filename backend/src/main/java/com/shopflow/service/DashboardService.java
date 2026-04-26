package com.shopflow.service;

import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.enums.OrderStatus;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final EntityMapper mapper;

    public AdminDashboard getAdminDashboard() {
        return AdminDashboard.builder()
                .totalRevenue(orderRepository.getTotalRevenue())
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.count())
                .topProducts(productRepository.findTopSelling(PageRequest.of(0, 5)).stream()
                        .map(mapper::toProductSummary).collect(Collectors.toList()))
                .recentOrders(orderRepository.findRecentOrders(PageRequest.of(0, 10)).stream()
                        .map(mapper::toOrderResponse).collect(Collectors.toList()))
                .build();
    }

    public SellerDashboard getSellerDashboard(User seller) {
        return SellerDashboard.builder()
                .revenue(orderRepository.getSellerRevenue(seller.getId()))
                .pendingOrders(orderRepository.findBySellerId(seller.getId(), PageRequest.of(0, 1000))
                        .getContent().stream()
                        .filter(o -> o.getStatus() == OrderStatus.PENDING).count())
                .totalProducts(productRepository.countBySellerId(seller.getId()))
                .lowStockProducts(productRepository.findLowStock(seller.getId(), 5).stream()
                        .map(mapper::toProductSummary).collect(Collectors.toList()))
                .recentOrders(orderRepository.findBySellerId(seller.getId(), PageRequest.of(0, 10))
                        .getContent().stream()
                        .map(mapper::toOrderResponse).collect(Collectors.toList()))
                .build();
    }
}
