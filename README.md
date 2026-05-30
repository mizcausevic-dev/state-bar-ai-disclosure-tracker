# state-bar-ai-disclosure-tracker

> **LegalTech jurisdiction-spanning lifecycle tracker (Spec #2 of the LegalTech 6-pack).** Tracks ABA formal opinions, state bar formal / ethics opinions, state supreme court orders, and federal court standing orders that govern licensed-attorney AI use. Covers **attorneys' own AI use ethics** — distinct from sibling-vertical trackers (which cover regulators telling the private sector / government what to do).

Part of the [Kinetic Gain Protocol Suite](https://suite.kineticgain.com).

> Status: v0.1 draft. Schema at [`schema/disclosure-event.schema.json`](./schema/disclosure-event.schema.json), seed data at [`bars/*.ndjson`](./bars/), verifier at [`src/verify.mjs`](./src/verify.mjs).

## Seed coverage (v0.1)

| Bar / Court | Anchor citation | Lifecycle state |
| --- | --- | --- |
| ABA | [Formal Op 512](https://www.americanbar.org/groups/professional_responsibility/) (Jul 2024) | formal-opinion-final |
| California Bar | [Practical Guidance for GenAI](https://www.calbar.ca.gov/Portals/0/documents/ethics/Generative-AI-Practical-Guidance.pdf) (Nov 2023) | advisory-non-binding |
| NY State Bar (COSAC) | [AI Task Force Report](https://nysba.org/) (Apr 2024) | formal-opinion-final |
| Florida Bar | Ethics Op 24-1 (Jan 2024) | formal-opinion-final |
| DC Bar | Ethics Op 388 (Apr 2024) | formal-opinion-final |
| Pennsylvania Bar + Philadelphia Bar (joint) | Joint Formal Op 2024-200 (May 2024) | formal-opinion-final |
| Texas State Bar | COLE Op 705 (Feb 2024) | formal-opinion-final |
| Illinois State Bar | Advisory Op 24-04 (Sep 2024) | advisory-non-binding |
| **S.D.N.Y. (Judge Castel)** | **Mata v. Avianca sanction order** (Jun 2023) | court-standing-order-issued |

The Mata v. Avianca sanction is the historical anchor — it's the case that put AI-hallucinated citation risk on every state bar's radar. Drives the `citation-validation-before-production-ready` invariant in the sibling [`matter-decision-record-audit-stream`](https://github.com/mizcausevic-dev/matter-decision-record-audit-stream) repo.

## Event schema

`bar_jurisdiction` pattern allows:
- `ABA` (national)
- `US-XX-BAR` (state bar — CA, NY, FL, etc.)
- `US-XX-SCT` (state supreme court)
- `US-XX-COSAC` (NY State Bar Committee on Standards of Attorney Conduct)
- `SDNY` / `EDNY` / `NDCAL` / etc. (federal district court standing orders)

`lifecycle_state` covers 16 transitions including `draft-opinion-circulated → in-public-comment → formal-opinion-final → mandatory-disclosure-required → mandatory-disclosure-effective → enforcement-active → enforcement-action-published`, plus `advisory-non-binding`, `court-standing-order-issued`, `rescinded`, `superseded`, `under-review`.

`obligation_kinds` is an 18-item enum covering: ai-tool-disclosure-in-engagement-letter, client-informed-consent, CLE-credit-on-AI, confidentiality-safeguards, vendor-due-diligence, citation-verification, ai-generated-content-disclosure-to-tribunal, work-product-attribution, supervision-by-licensed-attorney, unauthorized-practice-of-law screening, misleading-marketing-prohibited, no-fee-multiplier-for-AI-augmented-work, incident-reporting-to-bar-association, cross-border-data-residency-disclosure, etc.

## Verify

```bash
npm install
npm run verify
# OK · 9 events across 9 bar jurisdictions · schema ✓ · lifecycle transitions ✓
```

The verifier enforces:
1. **Schema validation** against `disclosure-event.schema.json`.
2. **Lifecycle ordering** — within the same `bar_jurisdiction`, events sorted by timestamp must form a legal transition chain (no jumping from `draft-opinion-circulated` straight to `enforcement-active`, etc.).

## Composes with

- [`matter-decision-record-audit-stream`](https://github.com/mizcausevic-dev/matter-decision-record-audit-stream) — the LegalTech Operator audit-stream that this tracker provides regulatory context to
- [`aba-rule-1-6-readiness-evidence-bundle`](https://github.com/mizcausevic-dev/aba-rule-1-6-readiness-evidence-bundle) — Evidence Bundle that consumes lifecycle events
- [`state-government-ai-disclosure-tracker`](https://github.com/mizcausevic-dev/state-government-ai-disclosure-tracker) — sibling-vertical (GovTech)
- [`state-real-estate-ai-disclosure-tracker`](https://github.com/mizcausevic-dev/state-real-estate-ai-disclosure-tracker) — sibling-vertical (PropTech)
- [Kinetic Gain Protocol Suite](https://suite.kineticgain.com) — umbrella

## Compliance posture

Tracking-readiness scaffolding for law firms + legal-AI vendors. Awareness of bar-jurisdiction obligations does not constitute compliance with those obligations — per the standing public-language guardrail across the Suite. Verify all bar citations against the current published opinion before relying on them; this dataset is a starting point, not legal advice.

## License

Spec text + JSON schemas + lifecycle data: MIT.
