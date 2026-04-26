package com.shopflow.controller;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gestion du catalogue produits")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Liste paginée des produits avec filtres")
    public ResponseEntity<PageResponse<ProductSummaryResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) Boolean promo) {
        return ResponseEntity.ok(productService.getAllProducts(page, size, sort, categoryId, minPrice, maxPrice, sellerId, promo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un produit avec variantes et avis")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Créer un produit (SELLER/ADMIN)")
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request, user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Modifier un produit")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(productService.updateProduct(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    @Operation(summary = "Désactiver un produit (soft delete)")
    public ResponseEntity<MessageResponse> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        productService.deleteProduct(id, user);
        return ResponseEntity.ok(new MessageResponse("Product deactivated"));
    }

    @GetMapping("/search")
    @Operation(summary = "Recherche full-text par nom ou description")
    public ResponseEntity<PageResponse<ProductSummaryResponse>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.searchProducts(q, page, size));
    }

    @GetMapping("/top-selling")
    @Operation(summary = "Top 10 meilleures ventes")
    public ResponseEntity<List<ProductSummaryResponse>> topSelling() {
        return ResponseEntity.ok(productService.getTopSelling(10));
    }
}
