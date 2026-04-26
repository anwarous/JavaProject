# 🛒 ShopFlow — Système de Gestion d'une Boutique en Ligne

> Plateforme e-commerce complète avec Spring Boot 3 (Backend) et Next.js 14 (Frontend)

## 📋 Table des matières
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation & Lancement](#installation--lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Endpoints API](#endpoints-api)
- [Technologies](#technologies)

## 🏗 Architecture

```
shopflow/
├── backend/          # Spring Boot 3 — API REST
│   ├── src/main/java/com/shopflow/
│   │   ├── config/       # Security, OpenAPI, CORS
│   │   ├── controller/   # REST Controllers
│   │   ├── dto/          # Request & Response DTOs
│   │   ├── entity/       # JPA Entities
│   │   ├── enums/        # Role, OrderStatus, CouponType
│   │   ├── exception/    # Custom exceptions + ControllerAdvice
│   │   ├── mapper/       # Entity <-> DTO mapping
│   │   ├── repository/   # Spring Data JPA repositories
│   │   ├── security/     # JWT filter, service
│   │   └── service/      # Business logic
│   └── src/main/resources/
│       ├── application.yml
│       └── data.sql       # Seed data
├── frontend/         # Next.js 14 — App Router
│   ├── src/app/          # Pages & layouts
│   ├── src/components/   # Reusable components
│   └── src/lib/          # API client, auth, utils
└── README.md
```

## ⚙️ Prérequis

- **Java 21** (LTS)
- **Maven 3.9+**
- **Node.js 18+** & npm
- *(Optionnel)* PostgreSQL 16 pour le profil production

## 🚀 Installation & Lancement

### Backend (Spring Boot)

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

L'API sera accessible sur **http://localhost:8080**
- Swagger UI: http://localhost:8080/swagger-ui
- H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:shopflow`)

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur **http://localhost:3000**

### Profil PostgreSQL (optionnel)

```bash
# Créer la base de données
createdb shopflow

# Lancer avec le profil postgres
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@shopflow.com | Password123 |
| Vendeur | seller@shopflow.com | Password123 |
| Vendeur 2 | seller2@shopflow.com | Password123 |
| Client | customer@shopflow.com | Password123 |
| Client 2 | customer2@shopflow.com | Password123 |

## 🔗 Endpoints API

### Authentication — `/api/auth`
- `POST /register` — Inscription
- `POST /login` — Connexion (retourne JWT)
- `POST /refresh` — Renouvellement du token
- `POST /logout` — Déconnexion

### Products — `/api/products`
- `GET /` — Liste paginée + filtres
- `GET /{id}` — Détail produit
- `POST /` — Créer (SELLER/ADMIN)
- `PUT /{id}` — Modifier
- `DELETE /{id}` — Soft delete
- `GET /search?q=` — Recherche full-text
- `GET /top-selling` — Top 10

### Categories — `/api/categories`
- `GET /` — Arbre de catégories
- `POST/PUT/DELETE` — Gestion (ADMIN)

### Cart — `/api/cart`
- `GET /` — Panier du client
- `POST /items` — Ajouter article
- `PUT /items/{id}` — Modifier quantité
- `DELETE /items/{id}` — Retirer article
- `POST /coupon` — Appliquer code promo
- `DELETE /coupon` — Retirer code promo

### Orders — `/api/orders`
- `POST /` — Passer commande
- `GET /{id}` — Détail commande
- `GET /my` — Mes commandes
- `GET /` — Toutes (ADMIN)
- `PUT /{id}/status` — Changer statut
- `PUT /{id}/cancel` — Annuler

### Reviews — `/api/reviews`
- `POST /` — Poster un avis
- `GET /product/{id}` — Avis d'un produit
- `PUT /{id}/approve` — Approuver (ADMIN)

### Dashboard — `/api/dashboard`
- `GET /admin` — Stats globales
- `GET /seller` — Stats vendeur

### Coupons — `/api/coupons`
- `GET/POST/PUT/DELETE` — Gestion (ADMIN)
- `GET /validate/{code}` — Vérifier validité

## 🛠 Technologies

### Backend
- Java 21, Spring Boot 3.2.5, Spring Security 6 + JWT
- Spring Data JPA, H2/PostgreSQL
- Lombok, Springdoc OpenAPI 3, Jakarta Validation

### Frontend
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS, Lucide Icons
- Axios + JWT interceptor

## 📄 Licence
Projet académique — 2025/2026
