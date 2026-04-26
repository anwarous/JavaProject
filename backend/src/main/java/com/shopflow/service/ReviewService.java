package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final EntityMapper mapper;

    @Transactional
    public ReviewResponse createReview(User customer, ReviewRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (reviewRepository.existsByCustomerIdAndProductId(customer.getId(), product.getId())) {
            throw new DuplicateResourceException("You have already reviewed this product");
        }

        // Verify purchase
        boolean hasPurchased = orderRepository.findByCustomerId(customer.getId(),
                PageRequest.of(0, 1000)).getContent().stream()
                .anyMatch(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getId().equals(product.getId())));

        if (!hasPurchased) {
            throw new BusinessException("You can only review products you have purchased");
        }

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .approved(false)
                .build();

        review = reviewRepository.save(review);
        updateProductRating(product.getId());
        return mapper.toReviewResponse(review);
    }

    public PageResponse<ReviewResponse> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByProductIdAndApprovedTrue(productId, pageable);
        List<ReviewResponse> content = reviews.getContent().stream()
                .map(mapper::toReviewResponse).collect(Collectors.toList());
        return mapper.toPageResponse(reviews, content);
    }

    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setApproved(true);
        review = reviewRepository.save(review);
        updateProductRating(review.getProduct().getId());
        return mapper.toReviewResponse(review);
    }

    private void updateProductRating(Long productId) {
        Double avg = reviewRepository.getAverageRating(productId);
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setAverageRating(avg != null ? avg : 0.0);
            productRepository.save(product);
        }
    }
}
