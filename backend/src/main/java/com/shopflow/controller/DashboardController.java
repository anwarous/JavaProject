package com.shopflow.controller;

import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Tableaux de bord")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dashboard administrateur — stats globales")
    public ResponseEntity<AdminDashboard> adminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    @Operation(summary = "Dashboard vendeur — revenus et commandes")
    public ResponseEntity<SellerDashboard> sellerDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getSellerDashboard(user));
    }
}
