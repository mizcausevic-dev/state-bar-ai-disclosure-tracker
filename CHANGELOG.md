# Changelog

## 1.0.0-prod — 2026-05-31

- Hardened to v1.0-prod per squad doctrine; member of the LegalTech vertical 6-pack.
- Spec-component repo (no Pages deploy required); AGPL-3.0-or-later, synthetic example data only.
- Pulse universe entry not applicable (no custom subdomain).



## [0.1] — 2026-05-30

### Added

- Initial schema + lifecycle-aware verifier.
- 16-value `lifecycle_state` enum covering opinion drafting, public comment, formal-opinion-final, rule amendments, mandatory CLE, mandatory disclosure, enforcement, court standing orders, and rescission/supersession.
- 11-value `regulatory_vehicle` enum (ABA formal opinion, state bar formal opinion, state bar ethics committee opinion, state bar rule amendment, state bar CLE requirement, state supreme court rule change / order, federal district court standing order, etc.).
- 18-item `obligation_kinds` enum covering disclosure, consent, CLE, competence, confidentiality, vendor due diligence, citation verification, tribunal disclosure, work-product attribution, supervision, UPL screening, marketing prohibitions, no fee multiplier for AI-augmented work, incident reporting, cross-border data residency.
- Seed coverage: 9 jurisdictions — ABA + 7 state bars (CA, NY-COSAC, FL, DC, PA, TX, IL) + SDNY (the Mata v. Avianca sanction order as historical anchor).
- Lifecycle-ordering verifier enforces legal transitions per jurisdiction (no skipping draft → enforcement, etc.).
- CI workflow.

### Notable design

- `SDNY` and similar federal-district-court identifiers are first-class `bar_jurisdiction` values (alongside `US-CA-BAR` etc.) because court standing orders are a parallel disclosure-channel to bar opinions — both bind attorney conduct, just through different mechanisms.
- The Mata v. Avianca sanction event is the historical anchor that motivates the `citation-validation-before-production-ready` invariant in the sibling `matter-decision-record-audit-stream`.

### Not yet

- Full 50-state coverage (only 7 state bars seeded).
- Federal Circuit court standing orders (5th Cir., 9th Cir., D.C. Cir.).
- USPTO + Tax Court AI disclosure rules.
- Foreign jurisdictions (LSRA London, Bar of Quebec, etc.).