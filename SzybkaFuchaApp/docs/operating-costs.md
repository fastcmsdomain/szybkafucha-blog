# SzybkaFuchaApp — Analiza Kosztów Operacyjnych

_Jakie opłaty będzie ponosił administrator/startup w celu utrzymania platformy._

---

## 1. HOSTING

### 1.1 Opcja A: AWS (Recommended for MVP → Scale)

#### MVP Phase (Apr–Jun 2026)
- **Compute:** EC2 t3.medium (1 GB RAM, 2 vCPU)
  - Estimated: **$30/month**
- **Database:** RDS PostgreSQL db.t3.micro
  - Multi-AZ (not required yet, single AZ OK): **$40/month**
- **Redis:** ElastiCache t3.micro
  - For caching, queues: **$20/month**
- **Storage:** S3 (user avatars, order images)
  - ~50 GB estimated: **$1/month** + data transfer **$5/month**
- **CDN:** CloudFront (optional, not needed yet)
  - Skip for MVP: **$0/month**
- **Load Balancer:** Not needed yet
  - Skip: **$0/month**

**MVP Total:** **~$96/month**

#### Phase 2 (Jul–Oct 2026) – Growth Mode
- **Compute:** 2x EC2 t3.medium (auto-scaling group)
  - **$60/month** + load balancer **$16/month**
- **Database:** RDS PostgreSQL db.t3.small (more traffic)
  - **$80/month**
- **Redis:** ElastiCache t3.small
  - **$40/month**
- **Storage + Transfer:** S3 + CloudFront
  - **$20/month** (more images)
- **Backups & Monitoring:** CloudWatch, automated backups
  - **$15/month**

**Phase 2 Total:** **~$231/month**

#### Phase 3 (Nov 2026+) – Scale to 10+ Cities
- **Compute:** 4–6 t3.medium instances
  - **$120/month** + ALB **$16/month**
- **Database:** RDS db.t3.large (read replicas)
  - **$160/month** (includes backup storage)
- **Redis:** Larger cluster
  - **$80/month**
- **Storage:** Auto-scaling
  - **$50/month**
- **Security:** WAF, DDoS protection
  - **$20/month**

**Phase 3 Total:** **~$446/month**

---

### 1.2 Opcja B: Heroku (Simpler, More Expensive)

| Phase | Dyno Type | Price | Database | Redis | Total |
|-------|-----------|-------|----------|-------|-------|
| MVP | Hobby | $7/mo | Hobby ($9) | Hobby ($0) | **$16/mo** |
| MVP | Standard (better) | $50/mo | Standard ($50) | Premium ($15) | **$115/mo** |
| Phase 2 | Standard-2x, 2x | $250/mo | Premium+ ($200) | Premium+ ($35) | **$485/mo** |
| Phase 3 | Performance-M, 3–4x | $1500+/mo | Private ($400+) | Private ($100+) | **$2000+/mo** |

**Note:** Heroku is ~2–3x more expensive than AWS, but simpler to manage initially. For MVP it's viable ($115/mo). Beyond that, AWS is better.

---

### 1.3 Recommendation

- **MVP (Apr–Jun):** AWS (cheapest start) or Heroku Standard ($115/mo for simplicity)
- **Phase 2+ :** AWS (cost-effective at scale)

---

## 2. POBIERANIE OPŁAT (Payment Processing)

### 2.1 Stripe (International + Poland)

Stripe covers: card payments, international transfers, webhooks, PCI compliance.

#### Pricing Structure

| Component | Rate | Notes |
|-----------|------|-------|
| **Transaction Fee** | 2.9% + $0.30 USD | Per charge |
| **Payout Fee** | 1% (min $0.50 USD) | Contractor payouts |
| **ACH/Bank Transfer** | $1 USD | Withdrawals |

#### Example Calculation (MVP Phase)

**Scenario:** 25 orders/day × 30 days = 750 orders/month  
**Average order value:** 100 PLN (~$25 USD)  
**Total transaction value:** 750 × $25 = **$18,750**

| Fee | Calculation | Cost |
|-----|-------------|------|
| **Transaction Fees** | $18,750 × 2.9% + (750 × $0.30) | $543 + $225 = **$768** |
| **Payout Fees** | $18,750 × (1 – commission%) × 1% | ~$150 (if 10% commission) |
| **Total Stripe Cost** | | **~$918/month** |

#### Phase 2 (500 orders/day)

- 500 orders/day × 30 = 15,000 orders/month
- Avg order: still ~$25 USD
- Total: $375,000
- **Transaction fees:** $10,875 + $4,500 = **$15,375**
- **Payout fees:** ~$2,250
- **Total:** **~$17,625/month**

#### Phase 3 (Larger Scale)

- 2000+ orders/day
- More volume pricing possible (reach out to Stripe)
- Estimated **$60,000+/month** in processing fees

---

### 2.2 Przelewy24 (Local Polish Processor)

Alternative for Polish market. Pricing:
- **Transaction fee:** 1.9% + 0.40 PLN (~$0.10 USD)
- **Payout fee:** 0.5% (min 1 PLN)

**MVP Phase Same Scenario:**
| Fee | Calculation | Cost |
|-----|-------------|------|
| **Transaction Fees** | 18,750 × 1.9% + (750 × 0.40 PLN) | $356 + $30 = **$386** |
| **Payout Fees** | ~100 PLN (~$25) | **$25** |
| **Total P24** | | **~$411/month** |

**Advantage:** Cheaper, local. **Disadvantage:** Less international support, smaller ecosystem.

---

### 2.3 Recommendation

- **MVP + Phase 2:** Use **Stripe** (international readiness, better for future scaling)
- **Add P24 as backup** (for DomesticPL transactions, cheaper)
- **Combined:** Use Stripe primary, P24 secondary

---

## 3. WIADOMOŚCI / NOTYFIKACJE

### 3.1 SMS + Push Notifications

#### Firebase Cloud Messaging (FCM) – Push Notifications
- **Cost:** FREE (up to 10M/month included in Firebase Spark plan)
- For MVP/Phase 2: **$0/month** (you only pay for Firebase Realtime DB/Firestore if used)
- Phase 3: Consider paid plan: ~$25/month

**Usage MVP:**
- New order notification: 1 per order (25/day = 25K/month)
- Update notifications: 2 per transaction (50K/month)
- Total: ~75K/month (within free tier)

---

#### SMS Notifications (Twilio or Vonage)

| Provider | Per SMS | Est. Volume | Monthly Cost |
|----------|---------|-------------|--------------|
| **Twilio** | $0.0075 USD | 50K SMS/month | **$375** |
| **Vonage** | $0.0048 USD | 50K SMS/month | **$240** |
| **AWS SNS** | $0.00645 USD | 50K SMS/month | **$322** |

**Usage Estimate (MVP):**
- Order confirmation: 1 SMS per order (750/month)
- Payment notification: 1 SMS (750/month)
- Contractor notification: 1 SMS (750/month)
- Total: ~2,250 SMS/month

**MVP SMS Cost (Vonage):** 2,250 × $0.0048 = **~$11/month**

**Phase 2 (15K orders/month = 45K SMS/month):**
45K × $0.0048 = **~$216/month**

**Recommendation:** 
- MVP: Keep minimal SMS, rely on push (free via FCM)
- Phase 2+: Vonage for 1–2 SMS per transaction (~$200/month)

---

## 4. WERYFIKACJA KYC (Know Your Customer)

Weryfikacja tożsamości dla contractors. Outsource to specialized KYC provider.

### 4.1 KYC Providers

| Provider | Per Verification | Batch Discount | Notes |
|----------|------------------|-----------------|-------|
| **Veriff** | $1–2 USD | 0.50–1.00 at scale | Document + liveness check |
| **Onfido** | $2–5 USD | $0.80–2 at scale | Industry standard, fast |
| **Sumsub** | $1.50–3 USD | Negotiable | European-friendly |
| **Local (Poland-specific)** | Varies | Contact for quote | Might be cheaper locally |

---

### 4.2 Volume & Costs

#### MVP Phase
- **Contractors onboarded:** 50–100
- **KYC checks needed:** 50–100 initial + 10/month new
- **Provider:** Veriff or Onfido
- **Cost per check:** ~$1.50 USD (at volume discount)
- **MVP Monthly:** (10 new contractors × $1.50) + 100 initial (split over 2 months) = **~$50 initial + $15/month**

#### Phase 2
- **Active contractors:** 500–1000
- **Churn onboarding:** ~50–100 new/month
- **Cost:** 75 new × $1.50 = **~$112/month**

#### Phase 3
- **Active contractors:** 5000+
- **New onboarding:** 200–300/month
- **Cost:** 250 × $1.50 = **~$375/month** (but negotiate bulk discount)

---

## 5. INNE KOSZTY OPERACYJNE

### 5.1 Monitoring & Analytics
- **Sentry (error tracking):** $29/month (MVP) → $99/month (Phase 2)
- **DataDog or New Relic:** $30/month → $200/month (Phase 2+)
- **Recommendation:** Sentry ($29/mo) for MVP

### 5.2 Email Notifications
- **SendGrid:** Free up to 100/day, then $0.35/1000 emails
- **Mailgun:** $0/month if <1250/month
- **Cost for MVP:** **$0–9/month**
- **Phase 2+:** **$15–30/month**

### 5.3 CDN & File Storage
- Covered in hosting costs (S3 + CloudFront)

### 5.4 Development Tools
- **GitHub:** Free (or $21/mo for private repos)
- **Figma:** Free tier OK for MVP, $12/mo per seat for team
- **Asana/Linear:** Free or $90/month (project management)
- **Slack:** $8/user/month (optional, internal)
- **Recommendation:** Free tier for MVP

### 5.5 Domain & SSL
- **Domain name:** $12/year (~$1/month)
- **SSL Certificate:** FREE (Let's Encrypt)

### 5.6 Legal & Compliance (One-time or irregular)
- **Lawyer review (KYC/AML/Terms):** 2000–5000 PLN (~$500–1250 one-time)
- **Insurance (liability):** ? (needs quote)
- **Not monthly recurring**

---

## 📊 PODSUMOWANIE: ŁĄCZNE KOSZTY MIESIĘCZNE

### MVP Phase (Apr–Jun 2026)
| Category | Cost |
|----------|------|
| **Hosting (AWS)** | $96 |
| **Payment Processing (Stripe)** | $918 |
| **SMS Notifications (Vonage)** | $11 |
| **Push Notifications (FCM)** | $0 |
| **KYC Verification** | $50 |
| **Error Monitoring (Sentry)** | $29 |
| **Email** | $0 |
| **Domain + SSL** | $1 |
| **Misc & Buffer (10%)** | $110 |
| | |
| **🔴 TOTAL MVP/MONTH** | **$1,215** |

---

### Phase 2 (Jul–Oct 2026)
| Category | Cost |
|----------|------|
| **Hosting (AWS)** | $231 |
| **Payment Processing (Stripe)** | $17,625 |
| **SMS Notifications** | $216 |
| **Push Notifications** | $0 |
| **KYC Verification** | $112 |
| **Error Monitoring** | $99 |
| **Email** | $20 |
| **Domain** | $1 |
| **Misc (10%)** | $1,830 |
| | |
| **🟠 TOTAL PHASE 2/MONTH** | **$20,134** |

---

### Phase 3 (Nov 2026+, Scale Mode)
| Category | Cost |
|----------|------|
| **Hosting (AWS)** | $446 |
| **Payment Processing (Stripe)** | $60,000 |
| **SMS Notifications** | $1000 |
| **Push Notifications** | $25 |
| **KYC Verification** | $375 |
| **Monitoring & Analytics** | $200 |
| **Email** | $50 |
| **Customer Support Tools** | $100 |
| **Domain + SSL** | $1 |
| **Misc (10%)** | $6,220 |
| | |
| **🟢 TOTAL PHASE 3/MONTH** | **$68,417** |

---

## 💰 KEY INSIGHTS

### 1. Payment Processing = Biggest Cost
- **MVP:** 76% of costs ($918/$1215)
- **Phase 2:** 87% of costs ($17,625/$20,134)
- **Phase 3:** 88% of costs

**➜ Why?** Stripe charges 2.9% + $0.30 per transaction. This scales directly with order volume.

**Action:** Negotiate Stripe rates as you grow (volume discounts kick in at $250K+/month).

---

### 2. Hosting is Cheap
- **MVP:** Only $96/month
- **Scales reasonably:** $446 by Phase 3

**➜ AWS scales better than fixed costs.**

---

### 3. KYC is Minimal Cost
- Misconception: KYC is expensive. Reality: $50–375/month depending on scale.
- One-time legal review is bigger expense.

---

### 4. Revenue Needed to Break Even

Assuming 10% commission on transactions:

| Phase | Monthly Costs | Needed Transaction Volume | Transactions/Day |
|-------|---------------|---------------------------|------------------|
| **MVP** | $1,215 | $12,150 | 405/day (25% margin) |
| **Phase 2** | $20,134 | $201,340 | 6,711/day |
| **Phase 3** | $68,417 | $684,170 | 22,805/day |

**Break-even at current projections:**
- MVP: 750 orders/day = **$75,000/month volume** = 10% = **$7,500 commission** ✅ Profitable
- Phase 2: 15,000 orders/day = **$375,000/month volume** = 10% = **$37,500 commission** ✅ Profitable
- Phase 3: Scale assumes 60,000+ orders/day = **$1.5M+/month volume** ✅ Very profitable

---

## 🎯 RECOMMENDATIONS

### MVP Launch Checklist

1. **Choose Hosting:** AWS (cheaper, flexible) or Heroku ($115/mo for simplicity)
2. **Stripe Setup:** Integrate Stripe, negotiate volume credits if possible
3. **Reduce SMS:** Rely on FCM push for MVP (free)
4. **KYC Provider:** Start with Veriff or Onfido, 1–2 check costs manageable
5. **Monitor Burn:** Track Stripe costs closely (will be 75% of budget)

### Cost Reduction Strategies

- **Phase 2:** Negotiate Stripe to 2.5% (achievable at $250K+/month spending)
- **Phase 3:** Consider Wise (TransferWise) for contractor payouts instead of Stripe 1% → might save $500/month
- **Infrastructure:** Consider Kubernetes / self-hosted by Phase 3 (but adds complexity)
- **Local Market:** Use Przelewy24 for Polish transactions (~50% cheaper than Stripe)

---

## ⚠️ Hidden Costs (Not Included)

- **Team salaries** (biggest cost, not infrastructure)
- **Marketing & user acquisition**
- **Insurance & legal compliance** (one-time, ~$1000+)
- **Office space** (if applicable)
- **Customer support tools** (Zendesk, etc.) – add $100/mo Phase 2+

---

## Timeline of Cost Growth

```
Apr 2026 (MVP Launch)       → ~$1,200/mo
May 2026                    → ~$2,000/mo (growth)
Jun 2026                    → ~$3,500/mo (Phase 2 prep)
Jul 2026 (Phase 2)          → $20,000/mo (jump due to volume)
Aug–Oct 2026                → $20–30,000/mo (steady)
Nov 2026 (Phase 3)          → $68,000+/mo (scale to 10 cities)
```

**Inflection point:** Phase 1 → 2 (3x cost jump), primarily due to payment processing volume.

---

_Last updated: 2026-02-25_
