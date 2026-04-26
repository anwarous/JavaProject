package com.shopflow.service;

import com.shopflow.dto.request.Requests.*;
import com.shopflow.dto.response.Responses.*;
import com.shopflow.entity.*;
import com.shopflow.exception.Exceptions.*;
import com.shopflow.mapper.EntityMapper;
import com.shopflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    public PageResponse<ProductSummaryResponse> getAllProducts(int page, int size, String sort,
            Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Long sellerId, Boolean promo) {

        Pageable pageable = createPageable(page, size, sort);

        Specification<Product> spec = Specification.where(isActive());

        if (categoryId != null) {
            spec = spec.and(hasCategory(categoryId));
        }
        if (minPrice != null) {
            spec = spec.and((root, q, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, q, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (sellerId != null) {
            spec = spec.and((root, q, cb) -> cb.equal(root.get("seller").get("id"), sellerId));
        }
        if (Boolean.TRUE.equals(promo)) {
            spec = spec.and((root, q, cb) -> cb.isNotNull(root.get("promoPrice")));
        }

        Page<Product> products = productRepository.findAll(spec, pageable);
        List<ProductSummaryResponse> content = products.getContent().stream()
                .map(mapper::toProductSummary).collect(Collectors.toList());
        return mapper.toPageResponse(products, content);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, User seller) {
        Product product = Product.builder()
                .seller(seller)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .promoPrice(request.getPromoPrice())
                .stock(request.getStock())
                .images(request.getImages() != null ? request.getImages() : new ArrayList<>())
                .build();

        // Categories
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            product.setCategories(categories);
        }

        product = productRepository.save(product);

        // Variants
        if (request.getVariants() != null) {
            for (VariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .attribute(vr.getAttribute())
                        .value(vr.getValue())
                        .additionalStock(vr.getAdditionalStock() != null ? vr.getAdditionalStock() : 0)
                        .priceDelta(vr.getPriceDelta() != null ? vr.getPriceDelta() : BigDecimal.ZERO)
                        .build();
                variantRepository.save(variant);
            }
        }

        return mapper.toProductResponse(productRepository.findById(product.getId()).orElse(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, User currentUser) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getSeller().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("You can only edit your own products");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setPromoPrice(request.getPromoPrice());
        product.setStock(request.getStock());

        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryIds()));
            product.setCategories(categories);
        }

        // Update variants
        if (request.getVariants() != null) {
            variantRepository.deleteAll(product.getVariants());
            product.getVariants().clear();
            for (VariantRequest vr : request.getVariants()) {
                ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .attribute(vr.getAttribute())
                        .value(vr.getValue())
                        .additionalStock(vr.getAdditionalStock() != null ? vr.getAdditionalStock() : 0)
                        .priceDelta(vr.getPriceDelta() != null ? vr.getPriceDelta() : BigDecimal.ZERO)
                        .build();
                variantRepository.save(variant);
            }
        }

        product = productRepository.save(product);
        return mapper.toProductResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id, User currentUser) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (!product.getSeller().getId().equals(currentUser.getId())
                && !currentUser.getRole().name().equals("ADMIN")) {
            throw new AccessDeniedException("You can only delete your own products");
        }

        product.setActive(false); // Soft delete
        productRepository.save(product);
    }

    public PageResponse<ProductSummaryResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.search(query, pageable);
        List<ProductSummaryResponse> content = products.getContent().stream()
                .map(mapper::toProductSummary).collect(Collectors.toList());
        return mapper.toPageResponse(products, content);
    }

    public List<ProductSummaryResponse> getTopSelling(int limit) {
        return productRepository.findTopSelling(PageRequest.of(0, limit)).stream()
                .map(mapper::toProductSummary).collect(Collectors.toList());
    }

    // Specification helpers
    private Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("active"));
    }

    private Specification<Product> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            var join = root.join("categories");
            return cb.equal(join.get("id"), categoryId);
        };
    }

    private Pageable createPageable(int page, int size, String sort) {
        if (sort == null) return PageRequest.of(page, size, Sort.by("createdAt").descending());
        return switch (sort) {
            case "price_asc" -> PageRequest.of(page, size, Sort.by("price").ascending());
            case "price_desc" -> PageRequest.of(page, size, Sort.by("price").descending());
            case "newest" -> PageRequest.of(page, size, Sort.by("createdAt").descending());
            case "popular" -> PageRequest.of(page, size, Sort.by("totalSold").descending());
            case "rating" -> PageRequest.of(page, size, Sort.by("averageRating").descending());
            default -> PageRequest.of(page, size, Sort.by("createdAt").descending());
        };
    }
}
