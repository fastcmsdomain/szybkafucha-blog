# SzybkaFuchaApp — Decisions

_Key architectural and product choices. Why we chose what. Keeps us from re-debating._

## Format

Each decision entry includes:
- **Context:** What problem were we solving?
- **Options Considered:** What else could we have done?
- **Decision:** What did we choose?
- **Rationale:** Why that one?
- **Date:** When we decided
- **Status:** Active / Archived / Under Review

---

## [Decision 1: Two-Sided Marketplace Model]

**Context:**  
We needed to decide: Is this B2B, B2C, or a marketplace connecting two types of users?

**Options Considered:**
1. **B2C + Employee Model** – SzybkaFucha hires its own contractors (high overhead, hard to scale)
2. **B2B** – Sell to businesses needing quick services (narrower market)
3. **Two-Sided Marketplace** – Connect individual clients with individual contractors (network effects, scalable)

**Decision:**  
Two-sided marketplace. Clients request → Contractors accept → Transactions via escrow → Ratings build reputation.

**Rationale:**  
- **Network Effects:** Both sides grow together. More contractors = more orders. More orders = more contractors.
- **Scalability:** We don't hire/manage employees. Contractors are independent.
- **Community:** Builds local trust and autonomy.
- **Speed:** Minimal overhead compared to B2C employee model.

**Trade-offs:**  
- Harder to control quality initially (mitigated by KYC + ratings)
- Fraud risk higher (mitigated by escrow + reviews)
- More complex matching algorithm needed

**Date:** 2026-02-25  
**Status:** Active

---

## [Decision 2: Escrow-Based Payments]

**Context:**  
How do we handle money? Direct transfer? Platform holds it?

**Options Considered:**
1. **Direct Transfer** – Client pays contractor directly (OLX model) → no trust, no protection
2. **Platform Escrow** – Platform holds money until completion confirmed → safer
3. **Card-Only + Chargeback** – Rely on card issuer chargebacks → slow, reactive

**Decision:**  
Escrow model. Client pays → SzybkaFucha holds → Contractor completes → Confirmation → Money released.

**Rationale:**  
- **Trust:** Protects both sides. Client gets refund if work isn't done. Contractor gets paid only after work confirmed.
- **Dispute Resolution:** We have leverage to mediate conflicts.
- **Prevents Flakes:** Client can't disappear. Contractor can't run with money.
- **Insurance:** Foundation for future fraud detection & insurance integration.

**Trade-offs:**  
- **Complexity:** Need reliable payment processor (Stripe, Przelewy24).
- **Latency:** Money not instant (24-48h typical payout).
- **Legal:** Must comply with Polish payment regulations (AML/KYC).
- **Commission Justification:** Makes our revenue model clearer (we're providing escrow service).

**Date:** 2026-02-25  
**Status:** Active

---

## [Decision 3: MVP = Single City Pilot]

**Context:**  
Do we launch nationwide or start small?

**Options Considered:**
1. **Nationwide from Day 1** – Ambitious, hard to manage quality, dilutes initial network
2. **Single City MVP** – Limited, but allows tight feedback loops
3. **Pre-selected Beta Users** – Very controlled, but slow to scale

**Decision:**  
Single city pilot (closed beta). Launch publicly in 1 city, prove the model, expand to 3-5 cities by month 2.

**Rationale:**  
- **Network Effects:** Easier to build density in 1 city. More matches, better experience.
- **Feedback:** Tight loops. We can talk to users, iterate fast.
- **Risk:** If something breaks, it's contained.
- **Marketing:** "Local heroes" narrative works better in a community.

**Trade-offs:**  
- **Slower Growth:** But safer path to product-market fit.
- **Geographic Limitation:** Contractors have limited area of operations.

**Date:** 2026-02-25  
**Status:** Active

---

## [Decision 4: KYC for Contractors, Not Clients]

**Context:**  
Do we verify everyone or just one side?

**Options Considered:**
1. **Full KYC for Both** – Maximum security, but friction (especially for casual users)
2. **None** – Low friction, high fraud risk
3. **KYC for Contractors Only** – Verify the service providers, lighter verification for clients

**Decision:**  
KYC for contractors, lighter verification for clients (email + phone).

**Rationale:**  
- **Risk Profile:** Contractors access real money flows. Clients are lower risk.
- **Onboarding:** Lower friction for clients = more orders = better for contractors.
- **Compliance:** Contractors are income generators (tax/AML concerns).
- **Practicality:** Full KYC slows launch significantly.

**Trade-offs:**  
- **Client Fraud Risk:** Clients could scam contractors. Mitigated by escrow + ratings.
- **Incomplete Picture:** We won't have full identity on all users.

**Date:** 2026-02-25  
**Status:** Active | **Pending:** Legal review on Polish AML requirements

---

## [Add more decisions as you make them]

---

_Review this file periodically. Archive outdated decisions._
