package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.Coupon;
import com.shopflow.enums.CouponType;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final EntityMapper mapper;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(mapper::toCouponResponse).collect(Collectors.toList());
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Coupon code already exists: " + request.getCode());
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .type(CouponType.valueOf(request.getType().toUpperCase()))
                .value(request.getValue())
                .expirationDate(request.getExpirationDate())
                .maxUsages(request.getMaxUsages() != null ? request.getMaxUsages() : 100)
                .build();
        return mapper.toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setCode(request.getCode().toUpperCase());
        coupon.setType(CouponType.valueOf(request.getType().toUpperCase()));
        coupon.setValue(request.getValue());
        coupon.setExpirationDate(request.getExpirationDate());
        if (request.getMaxUsages() != null) coupon.setMaxUsages(request.getMaxUsages());
        return mapper.toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setActive(false);
        couponRepository.save(coupon);
    }

    public CouponResponse validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new InvalidCouponException("Invalid coupon code"));
        if (!coupon.isActive()) throw new InvalidCouponException("Coupon is inactive");
        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now()))
            throw new InvalidCouponException("Coupon has expired");
        if (coupon.getCurrentUsages() >= coupon.getMaxUsages())
            throw new InvalidCouponException("Coupon usage limit reached");
        return mapper.toCouponResponse(coupon);
    }
}
