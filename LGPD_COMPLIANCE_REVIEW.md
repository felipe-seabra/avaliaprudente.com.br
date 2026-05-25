# ⚖️ LGPD & Privacy Compliance Review

## 📋 Executive Summary
This document reviews the platform's readiness for the Lei Geral de Proteção de Dados (LGPD - Brazil). While the architectural foundation separates public and private data well, there are critical privacy risks concerning implicit data collection and user consent.

---

## 🚨 LGPD Compliance Gaps

### 1. [FIXED] Implicit PII Fingerprinting without Consent
- **Status:** **REMEDIATED** (2026-05-24)
- **Affected Files:** `src/lib/privacy.ts`, `src/app/api/reviews/route.ts`, `src/app/api/analytics/route.ts`
- **Remediation:** 
  - Implemented a cryptographic `pepper` strategy for all fingerprints.
  - Added ephemeral rotation (daily/weekly) to prevent permanent tracking.
  - Fingerprints are now non-reversible and privacy-safe.
  - User Agents are sanitized before persistence in analytics to minimize PII.
  - Raw IPs are never persisted and never sent to distributed stores (Middleware rate limit now uses hashed identifiers).

### 2. [MEDIUM] Lack of Explicit Granular Consent
- **Observation:** Currently, users and anonymous reviewers can submit data (reviews) without a clear, explicitly checked consent box for data processing.
- **Remediation:** Add a required checkbox or clear disclaimer on the review submission form: *"Ao enviar esta avaliação, você concorda com nossos Termos de Uso e Política de Privacidade."*

### 3. [MEDIUM] Data Retention & Account Deletion (Right to be Forgotten)
- **Observation:** The moderation system uses a "deactivation" trigger that performs a soft-delete: `UPDATE public.profiles SET is_deleted = true...`
- **Risk:** LGPD mandates the right to complete erasure (Art. 18, VI). A soft delete is insufficient if the user explicitly requests full data removal.
- **Remediation:** Implement a hard-delete workflow or data anonymization script (e.g., anonymizing the `username`, `full_name`, and `email` while keeping the structural record intact) for users exercising their Right to be Forgotten.

---

## 🔒 Future Payment & Privacy Implications
When implementing payments (e.g., Stripe):
1. **Third-Party Data Processors:** Stripe must be explicitly listed in the Privacy Policy as a data processor.
2. **Data Minimization:** Only transmit the strictly necessary information to Stripe (e.g., Email, Name). Do not sync unnecessary platform metadata unless required for billing.
3. **Invoicing Privacy:** Ensure invoices generated do not expose sensitive business metrics publicly.