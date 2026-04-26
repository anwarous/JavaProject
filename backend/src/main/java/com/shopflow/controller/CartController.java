package com.shopflow.controller;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Panier d'achat du client connecté")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Afficher le panier du client connecté")
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    @Operation(summary = "Ajouter un article au panier")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(user, request));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Modifier la quantité d'un article")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(user, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Retirer un article du panier")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(user, itemId));
    }

    @PostMapping("/coupon")
    @Operation(summary = "Appliquer un code promo")
    public ResponseEntity<CartResponse> applyCoupon(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CouponApplyRequest request) {
        return ResponseEntity.ok(cartService.applyCoupon(user, request));
    }

    @DeleteMapping("/coupon")
    @Operation(summary = "Retirer le code promo")
    public ResponseEntity<CartResponse> removeCoupon(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.removeCoupon(user));
    }
}
