-- =====================================================
-- ShopFlow — Données de démonstration
-- Mot de passe pour tous: Password123
-- =====================================================

INSERT INTO users (id, email, password, first_name, last_name, role, active, created_at) VALUES
(1, 'admin@shopflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'ShopFlow', 'ADMIN', true, NOW()),
(2, 'seller@shopflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Ahmed', 'Ben Ali', 'SELLER', true, NOW()),
(3, 'seller2@shopflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Fatma', 'Trabelsi', 'SELLER', true, NOW()),
(4, 'customer@shopflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Youssef', 'Gharbi', 'CUSTOMER', true, NOW()),
(5, 'customer2@shopflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Amira', 'Souissi', 'CUSTOMER', true, NOW());

INSERT INTO seller_profiles (id, user_id, shop_name, description, logo, rating) VALUES
(1, 2, 'TechZone TN', 'Votre destination pour les meilleurs gadgets tech en Tunisie', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200', 4.5),
(2, 3, 'Mode et Style', 'Boutique de vetements tendance et accessoires de mode', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200', 4.2);

INSERT INTO addresses (id, user_id, street, city, zip_code, country, is_primary) VALUES
(1, 4, '15 Rue de la Liberte', 'Tunis', '1000', 'Tunisie', true),
(2, 4, '22 Avenue Habib Bourguiba', 'Sousse', '4000', 'Tunisie', false),
(3, 5, '8 Rue Ibn Khaldoun', 'Sfax', '3000', 'Tunisie', true);

INSERT INTO carts (id, customer_id, modified_at) VALUES
(1, 4, NOW()),
(2, 5, NOW());

INSERT INTO categories (id, name, description, parent_id) VALUES
(1, 'Electronique', 'Appareils electroniques et gadgets', NULL),
(2, 'Smartphones', 'Telephones intelligents', 1),
(3, 'Ordinateurs', 'Laptops et ordinateurs de bureau', 1),
(4, 'Accessoires Tech', 'Cables, chargeurs, coques', 1),
(5, 'Mode', 'Vetements et accessoires', NULL),
(6, 'Homme', 'Mode masculine', 5),
(7, 'Femme', 'Mode feminine', 5),
(8, 'Maison et Jardin', 'Decoration et jardinage', NULL),
(9, 'Sport', 'Articles de sport et fitness', NULL),
(10, 'Livres', 'Livres et e-books', NULL);

INSERT INTO products (id, seller_id, name, description, price, promo_price, stock, active, created_at, average_rating, total_sold) VALUES
(1, 2, 'iPhone 15 Pro Max', 'Le dernier iPhone avec puce A17 Pro, ecran Super Retina XDR 6.7 pouces', 4299.00, 3999.00, 25, true, NOW(), 4.8, 150),
(2, 2, 'Samsung Galaxy S24 Ultra', 'Galaxy AI integre, S Pen, ecran Dynamic AMOLED 6.8 pouces', 3899.00, NULL, 30, true, NOW(), 4.6, 120),
(3, 2, 'MacBook Pro 14 M3', 'Puce M3 Pro, 18Go RAM, 512Go SSD, ecran Liquid Retina XDR', 7499.00, 6999.00, 15, true, NOW(), 4.9, 80),
(4, 2, 'AirPods Pro 2', 'Reduction active du bruit, audio spatial, boitier MagSafe USB-C', 899.00, 749.00, 50, true, NOW(), 4.7, 200),
(5, 2, 'iPad Air M2', 'Puce M2, ecran Liquid Retina 11 pouces, compatible Apple Pencil Pro', 2499.00, NULL, 20, true, NOW(), 4.5, 60),
(6, 3, 'Veste en Cuir Premium', 'Veste en cuir veritable, coupe slim, doublure en soie', 450.00, 359.00, 40, true, NOW(), 4.3, 90),
(7, 3, 'Robe de Soiree Elegante', 'Robe longue en satin, coupe sirene, plusieurs couleurs', 280.00, NULL, 35, true, NOW(), 4.1, 70),
(8, 3, 'Sneakers Urban Style', 'Baskets confortables en cuir, semelle antiderapante', 189.00, 149.00, 60, true, NOW(), 4.4, 180),
(9, 2, 'Clavier Mecanique RGB', 'Switches Cherry MX, retroeclairage RGB, repose-poignet', 349.00, 299.00, 45, true, NOW(), 4.6, 110),
(10, 2, 'Ecran 4K 27 pouces IPS', 'Resolution 4K UHD, 60Hz, HDR400, USB-C charge 65W', 1299.00, NULL, 18, true, NOW(), 4.5, 45),
(11, 3, 'Sac a Dos Cuir Vintage', 'Sac en cuir pleine fleur, compartiment laptop 15 pouces', 220.00, 179.00, 30, true, NOW(), 4.2, 55),
(12, 2, 'Montre Connectee Sport', 'GPS, cardio, SpO2, 14 jours autonomie, etanche 5ATM', 599.00, 499.00, 35, true, NOW(), 4.4, 95);

INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (3, 3),
(4, 1), (4, 4), (5, 1), (6, 5), (6, 6),
(7, 5), (7, 7), (8, 5), (8, 9), (9, 1), (9, 4),
(10, 1), (10, 3), (11, 5), (12, 1), (12, 9);

INSERT INTO product_images (product_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'),
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'),
(3, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'),
(3, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600'),
(4, 'https://images.unsplash.com/photo-1606741965326-cb990c80a098?w=600'),
(5, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'),
(6, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600'),
(7, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600'),
(8, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'),
(9, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600'),
(10, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'),
(11, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'),
(12, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600');

INSERT INTO product_variants (id, product_id, attribute, option_value, additional_stock, price_delta) VALUES
(1, 1, 'Stockage', '256 Go', 10, 0.00),
(2, 1, 'Stockage', '512 Go', 8, 400.00),
(3, 1, 'Stockage', '1 To', 5, 800.00),
(4, 2, 'Couleur', 'Noir', 10, 0.00),
(5, 2, 'Couleur', 'Creme', 8, 0.00),
(6, 2, 'Couleur', 'Violet', 5, 0.00),
(7, 6, 'Taille', 'S', 10, 0.00),
(8, 6, 'Taille', 'M', 15, 0.00),
(9, 6, 'Taille', 'L', 10, 0.00),
(10, 6, 'Taille', 'XL', 5, 0.00),
(11, 7, 'Couleur', 'Noir', 12, 0.00),
(12, 7, 'Couleur', 'Rouge', 10, 0.00),
(13, 7, 'Couleur', 'Bleu Marine', 8, 0.00),
(14, 8, 'Pointure', '40', 10, 0.00),
(15, 8, 'Pointure', '42', 15, 0.00),
(16, 8, 'Pointure', '44', 12, 0.00),
(17, 8, 'Pointure', '46', 8, 0.00);

INSERT INTO coupons (id, code, type, amount, expiration_date, max_usages, current_usages, active) VALUES
(1, 'WELCOME10', 'PERCENT', 10.00, '2026-12-31 23:59:59', 1000, 42, true),
(2, 'SUMMER25', 'PERCENT', 25.00, '2026-08-31 23:59:59', 500, 18, true),
(3, 'FLAT50', 'FIXED', 50.00, '2026-06-30 23:59:59', 200, 5, true);

INSERT INTO reviews (id, customer_id, product_id, rating, comment, created_at, approved) VALUES
(1, 4, 1, 5, 'Excellent telephone! La qualite photo est incroyable.', NOW(), true),
(2, 5, 1, 4, 'Tres bon iPhone, mais le prix reste eleve.', NOW(), true),
(3, 4, 4, 5, 'La reduction de bruit est impressionnante.', NOW(), true),
(4, 5, 8, 4, 'Tres confortables pour la marche quotidienne.', NOW(), true),
(5, 4, 3, 5, 'Machine exceptionnelle pour le developpement.', NOW(), true);

ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE seller_profiles ALTER COLUMN id RESTART WITH 100;
ALTER TABLE addresses ALTER COLUMN id RESTART WITH 100;
ALTER TABLE carts ALTER COLUMN id RESTART WITH 100;
ALTER TABLE categories ALTER COLUMN id RESTART WITH 100;
ALTER TABLE products ALTER COLUMN id RESTART WITH 100;
ALTER TABLE product_variants ALTER COLUMN id RESTART WITH 100;
ALTER TABLE coupons ALTER COLUMN id RESTART WITH 100;
ALTER TABLE reviews ALTER COLUMN id RESTART WITH 100;
