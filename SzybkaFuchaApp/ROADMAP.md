# SzybkaFuchaApp — Development Roadmap

## Vision

SzybkaFucha to pierwsza polska platforma, która łączy szybkie zadania z lokalnymi wykonawcami. Długoterminowo: sieć powiązanych wciąż rosnących miast, gdzie każdy może zarabiać elastycznie, a każdy może znaleźć pomoć.

---

## Phase 1: MVP – Core Loop (Target: Kwiecień 2026)

**Goal:** Pracujący marketplace dla 1 miasta (pilot). Wystarczy, by klient mógł dodać zlecenie, wykonawca akceptować, transakcja zakończyć się z oceną.

**Features:**
- [ ] Auth & Profiling (klient + wykonawca)
- [ ] Dodanie zlecenia (formularz + kategorie)
- [ ] Lista dostępnych zleceń (dla wykonawcy)
- [ ] Akceptacja/odrzucenie zlecenia
- [ ] Czat między stronami (basic)
- [ ] System ocen 1–5 gwiazdek
- [ ] Integracja płatności (Stripe/Przelewy24)
- [ ] Escrow logic (blokada → wypłata)
- [ ] Push notifications
- [ ] Mobile app (React Native lub Flutter)
- [ ] Admin panel (moderacja, stats)

**Success Criteria:**
- 50+ zleceń w ciągu 2 tygodni pilotu
- 80%+ completion rate
- 4.0+ average rating
- Zero fraud reports

**Deployment:**
- iOS TestFlight + Android beta na Google Play

---

## Phase 2: Stabilizacja & Growth (Target: Czerwiec 2026)

**Goal:** Potestować na prawdziwych użytkownikach, ulepszyć flow, dodać Features driven by feedback.

**Features:**
- [ ] Śledzenie lokalizacji (opt-in)
- [ ] Rating & review system v2 (photos, detailed feedback)
- [ ] Verified badges (KYC backend)
- [ ] Zaawansowane filtry (dla klienta: kategoria, rating, availability)
- [ ] Bulk opcje (klient może dodać więcej zadań naraz)
- [ ] Performance optimization
- [ ] Bug fixes from beta

**Growth:**
- Expand to 2–3 nowych miast
- Recruitment of first contractors
- Local partnerships (seniorzy, lokale)?

---

## Phase 3: Ecosystem (Target: Sierpień 2026)

**Goal:** Kompleksowy marketplace. Premium features, lepsze matching, scaling.

**Features:**
- [ ] Premium contractor subscriptions
- [ ] Featured listings (płatne promotion)
- [ ] AI-powered matching (recommendations)
- [ ] Recurring tasks (np. cotygodniowe sprzątanie)
- [ ] Multi-language support (jeśli robi się międzynarodowo)
- [ ] Analytics dashboard (dla wykonawców)
- [ ] Support chat (live customer support)

**Scale:**
- 10+ miast
- 1000+ active contractors
- 500K+ total transactions

---

## Critical Path

1. **Feb–Mar:** Design, backend architecture, first sprint
2. **Mar–Apr:** MVP development, first internal testing
3. **Apr:** Closed beta (100–200 users in 1 city)
4. **May:** Public launch v1.0
5. **Jun–Aug:** Growth, feedback loops, Phase 2 features

---

## Known Blockers

- **Payments Legal:** Wymogi KYC dla platform płatniczych w PL (need compliance review)
- **Insurance:** Czy potrzebujemy ubezpieczenia dla zleceń? (need legal consult)
- **Contractor Recruitment:** Jak zainteresować pierwszych wykonawców? (marketing + incentives)

---

Last updated: 2026-02-25
