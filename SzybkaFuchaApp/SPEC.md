# SzybkaFuchaApp — Specyfikacja Produktu

## Problem

Ludzie tracą czas na drobne zadania, które nie chcą robić sami. Szukanie zaufanego wykonawcy jest chaotyczne – OLX, Facebook, znajomi. Brak weryfikacji, brak bezpiecznych płatności, brak historii.

## Rozwiązanie

Dwiostronny marketplace z:
- Weryfikacją wykonawców
- Bezpiecznym escrow
- Systemem reputacji
- Dopasowaniem geograficznym

---

## User Stories

### Klient (Zleceniodawca)

**Story 1: Szybkie dodanie zlecenia**
- Jako klient chcę w 2 minuty dodać zlecenie
- Wybieram kategorię, opisuję zadanie, ustawiam budżet i lokalizację
- Dostaję listę dostępnych wykonawców sorted by rating

**Story 2: Bezpieczna transakcja**
- Jako klient chcę wiedzieć, że pieniądze są bezpieczne
- Pieniądze idą do escrow, nie bezpośrednio do wykonawcy
- Tylko po potwierdzeniu wykonania trafiają do wykonawcy

**Story 3: Komunikacja z wykonawcą**
- Jako klient chcę móc się komunikować z wykonawcą w aplikacji
- Czat, powiadomienia, opcjonalne śledzenie lokalizacji

**Story 4: Historia i reputacja**
- Jako klient chcę widzieć historię wykonawcy
- Rating, komentarze, liczba ukończonych zleceń

### Wykonawca (Kontraktor)

**Story 1: Znalezienie zleceń**
- Jako wykonawca chcę widzieć dostępne zlecenia w mojej okolicy
- Dostaję powiadomienia o nowych zleceniach
- Akceptuję to, co mi pasuje

**Story 2: Zarządzanie profilem**
- Jako wykonawca chcę pokazać moje umiejętności i doświadczenie
- Mogę ustawić kategorie, promień działania, dostępność

**Story 3: Elastyczność**
- Jako wykonawca chcę pracować na własnych warunkach
- Akceptuję to co chcę, kiedy mam czas

**Story 4: Zarobki**
- Jako wykonawca chcę widzieć, ile zarabiam
- Historia transakcji, wypłaty

---

## Core Features

### 1. Dodanie Zlecenia
- Formularz: kategoria, opis, budżet, lokalizacja, termin
- Status: `created`
- Powiadomienia do wykonawców

### 2. Dopasowanie Wykonawców
- Algorytm: lokalizacja, dostępność, kategoria, rating
- Lista sortowana by rating
- Możliwość bezpośredniego zaproszenia wykonawcy

### 3. Akceptacja Zlecenia
- Klient wybiera wykonawcę
- Wykonawca akceptuje
- Status: `accepted`
- Eskalacja pieniędzy do escrow

### 4. Realizacja
- Status: `in_progress`
- Chat między stronami
- Opcjonalne śledzenie lokalizacji

### 5. Zakończenie
- Wykonawca: „gotowe"
- Klient: potwierdza wykonanie
- Status: `completed`
- Pieniądze trafiają do wykonawcy (minus prowizja)

### 6. Ocena i Reputacja
- Obie strony oceniają (1–5 gwiazdek + komentarz)
- System reputacji
- Widoczne dla przyszłych klientów/wykonawców

### 7. Profil Użytkownika
- Avatar, opis, kategorie (dla wykonawcy)
- Historia transakcji
- Verified badge (po KYC)

### 8. System Powiadomień
- Nowe zlecenia
- Akceptacja/odrzucenie
- Zmiana statusu
- Nowa ocena

---

## Non-Functional Requirements

- **Performance:** Załadowanie listy zleceń < 2s
- **Security:** Weryfikacja KYC dla wykonawców, HTTPS, encryption
- **Reliability:** 99.5% uptime
- **Accessibility:** Mobile-first design

---

## Out of Scope (v1.0)

- Premium promocje wykonawców
- Subskrypcje
- AI matching
- Integracja z zewnętrznymi systemami płatności (start: Stripe)
- Międzymiastowy matching

---

## Success Metrics

- Liczba zleceń na dzień
- Completion rate (% zleceń ukończonych)
- Average rating (dla klientów i wykonawców)
- Retention (% powrotnych użytkowników w 30 dni)

---

Last updated: 2026-02-25
