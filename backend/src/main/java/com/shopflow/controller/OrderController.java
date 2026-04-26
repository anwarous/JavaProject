package com.shopflow.controller;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Gestion des commandes")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Passer une commande depuis le panier")
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(user, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'une commande")
    public ResponseEntity<OrderResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getOrderById(id, user));
    }

    @GetMapping("/my")
    @Operation(summary = "Mes commandes (client connecté)")
    public ResponseEntity<PageResponse<OrderResponse>> myOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getMyOrders(user, page, size));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toutes les commandes (ADMIN)")
    public ResponseEntity<PageResponse<OrderResponse>> allOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Commandes du vendeur connecté")
    public ResponseEntity<PageResponse<OrderResponse>> sellerOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getSellerOrders(user, page, size));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Mettre à jour le statut (SELLER/ADMIN)")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.updateStatus(id, request, user));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Annuler une commande (CUSTOMER si PENDING/PAID)")
    public ResponseEntity<OrderResponse> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.cancelOrder(id, user));
    }
}
