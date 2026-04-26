package com.shopflow.controller;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.User;
import com.shopflow.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Tag(name = "Addresses", description = "Gestion des adresses de livraison")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    @Operation(summary = "Mes adresses de livraison")
    public ResponseEntity<List<AddressResponse>> getMyAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user));
    }

    @PostMapping
    @Operation(summary = "Ajouter une adresse")
    public ResponseEntity<AddressResponse> addAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.addAddress(user, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une adresse")
    public ResponseEntity<MessageResponse> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        addressService.deleteAddress(user, id);
        return ResponseEntity.ok(new MessageResponse("Address deleted"));
    }
}
