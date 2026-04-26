package com.shopflow.repository;

import com.shopflow.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.promoPrice IS NOT NULL")
    Page<Product> findPromotions(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.totalSold DESC")
    List<Product> findTopSelling(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.active = true ORDER BY p.createdAt DESC")
    List<Product> findNewest(Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId")
    Long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.stock < :threshold AND p.active = true")
    List<Product> findLowStock(@Param("sellerId") Long sellerId, @Param("threshold") int threshold);
}
