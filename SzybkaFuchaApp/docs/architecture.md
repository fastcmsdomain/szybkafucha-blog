# SzybkaFuchaApp — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Clients & Contractors                │
│            (Mobile App: iOS/Android + Web)              │
└────────────────┬────────────────────────────────┬────────┘
                 │                                │
     ┌───────────▼──────────────┐    ┌───────────▼──────────────┐
     │    Client App            │    │  Contractor App          │
     │ - Add order              │    │ - Browse orders          │
     │ - Pay (Stripe/P24)       │    │ - Accept/Reject          │
     │ - Rate contractor        │    │ - Complete & charge      │
     │ - Chat                   │    │ - Manage profile         │
     └───────────┬──────────────┘    └───────────┬──────────────┘
                 │                                │
                 └────────────────┬───────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │     REST API / GraphQL     │
                    │   (Node.js + Express)      │
                    └─────────────┬──────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   ┌────▼─────┐          ┌────────▼────────┐      ┌───────▼────┐
   │PostgreSQL│          │Redis (Cache)    │      │Stripe/P24  │
   │Database  │          │Sessions & Queue │      │Integration │
   └──────────┘          └─────────────────┘      └────────────┘
        │
   ┌────▼────────────────────────────────────┐
   │ Tables:                                  │
   │ - Users (clients & contractors)          │
   │ - Orders (requests, status, etc.)        │
   │ - Transactions (payments, escrow)        │
   │ - Ratings (reviews)                      │
   │ - Notifications                          │
   │ - Order messages (chat)                  │
   └──────────────────────────────────────────┘
```

---

## Technology Stack (Proposed)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Mobile Frontend** | React Native | Cross-platform (iOS + Android), fast iteration, large ecosystem |
| **Web Frontend** | React.js | Admin panel, contractor dashboard, responsive |
| **Backend** | Node.js + Express | Fast development, JS full-stack, good for real-time (WebSockets) |
| **Database** | PostgreSQL | ACID compliance, JSON support, geospatial queries (ST_Distance) |
| **Cache/Queue** | Redis | Sessions, task queue (order matching), real-time features |
| **Payments** | Stripe + Przelewy24 | PL support, escrow handling, compliance |
| **File Storage** | AWS S3 / Firebase | Profile images, order attachments |
| **Real-time** | WebSockets / Socket.io | Chat, notifications, live order tracking |
| **Deployment** | Docker + AWS / Heroku | Containerized, scalable, managed |
| **Admin** | Custom dashboard (React) | Moderation, metrics, fraud detection |

**Decision Status:** ⏳ _TO BE DECIDED_ in Sprint 1

---

## Core Components

### 1. **User Service**
- Authentication (JWT, OAuth for future)
- Profile management (client vs. contractor)
- KYC verification (contractor profiles)
- Rating & review storage

### 2. **Order Service**
- Order creation, listing, filtering
- Status management: created → accepted → in_progress → completed
- Geographic matching (location-based queries)
- Order search & discovery

### 3. **Matching Service**
- Algorithmic matching (location, category, availability, rating)
- Real-time notifications to contractors
- Manual contractor invitation

### 4. **Payment Service**
- Escrow logic (funds locked until completion)
- Stripe/Przelewy24 integration
- Payout processing
- Commission handling

### 5. **Chat Service**
- Real-time messaging (WebSocket)
- Message history
- Notification triggers

### 6. **Notification Service**
- Push notifications (Firebase Cloud Messaging)
- In-app notifications
- Email notifications (opt-in)

### 7. **Admin Service**
- User moderation
- Fraud detection
- Metrics & analytics
- Content flagging

---

## Data Model (Simplified)

### Users
```sql
id, email, phone, password_hash, 
first_name, last_name, avatar_url, 
role (client|contractor), 
verified (KYC status),
created_at, updated_at
```

### Orders
```sql
id, client_id, contractor_id,
category, title, description, budget,
location (lat/long), radius,
status (created|accepted|in_progress|completed|cancelled),
created_at, accepted_at, completed_at
```

### Transactions
```sql
id, order_id, amount, commission,
status (pending|escrowed|paid|failed),
stripe_charge_id, created_at
```

### Ratings
```sql
id, order_id, from_user_id, to_user_id,
score (1-5), comment, created_at
```

---

## API Endpoints (v1.0)

### Auth
- `POST /auth/register` – Create account
- `POST /auth/login` – Login
- `POST /auth/logout` – Logout
- `GET /auth/profile` – Current user

### Orders
- `POST /orders` – Create order (client)
- `GET /orders` – List available orders (contractor)
- `GET /orders/:id` – Get order details
- `PATCH /orders/:id/status` – Update status
- `POST /orders/:id/accept` – Accept order (contractor)

### Payments
- `POST /orders/:id/payment` – Initiate payment (client)
- `POST /webhooks/stripe` – Stripe webhook
- `GET /transactions` – Transaction history

### Chat
- `POST /orders/:id/messages` – Send message
- `GET /orders/:id/messages` – Get chat history
- WebSocket: `/ws/orders/:id/chat` – Real-time chat

### Users
- `GET /users/:id` – Get profile
- `PATCH /users/:id` – Update profile
- `POST /users/:id/kyc` – Submit KYC (contractor)

### Ratings
- `POST /orders/:id/rate` – Rate user
- `GET /users/:id/ratings` – User's ratings

---

## Geospatial Matching

We use PostgreSQL's PostGIS extension:

```sql
-- Find contractors near an order
SELECT c.* FROM contractors c
WHERE ST_DWithin(
  ST_MakePoint(c.location_long, c.location_lat)::geography,
  ST_MakePoint(:order_long, :order_lat)::geography,
  :radius_meters
)
AND c.category = :order_category
ORDER BY c.rating DESC
LIMIT 10;
```

---

## Security Considerations

- **Authentication:** JWT tokens, refresh tokens, CORS
- **Data Protection:** HTTPS only, encrypted passwords (bcrypt)
- **KYC:** Contractor identity verification (ID document)
- **Payment:** PCI DSS compliance (use Stripe, not direct payment handling)
- **Fraud Detection:** Transaction patterns, duplicate accounts, rate limiting
- **Rate Limiting:** Per IP, per user (prevent abuse)

---

## Scalability Notes

**Phase 1 (MVP):** Single server, can handle 10K daily orders
**Phase 2:** Horizontally scaled backend (load balancer), read replicas for DB
**Phase 3:** Microservices (orders, payments, matching as separate services), CDN for static assets

---

For decision context, see [memory/decisions.md](../memory/decisions.md)
