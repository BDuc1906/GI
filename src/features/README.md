# Feature architecture

This project is gradually moving toward a feature-first structure so the core product can scale without mixing UI, business logic, and data access.

## Target structure

- `src/app` contains routing and page composition only.
- `src/features` contains feature-level UI, hooks, validation and server-side logic.
- `src/core` contains domain rules, shared types and reusable validation.
- `src/server` contains database access and server actions.
- `src/lib` remains for general-purpose utility code only.

## Product roadmap

### v1: Core value ✅ COMPLETE
- search
- character detail
- weapon detail
- artifact detail
- domain list and filters
- stable API contract

### v2: Experience expansion ✅ PARTIALLY COMPLETE
- **build planner** ✅
  - GET /api/build - weapon recommendation
  - GET /api/build/full - unified build plan (weapon + artifact + domain)
  - See docs/BUILD_API.md for full reference
- **compare view** ✅
  - GET /api/build/compare - character comparison
- **recommendations** ✅
  - Artifact recommendation: GET /api/build/artifact
  - Domain recommendation: GET /api/build/domain
  - Team composition: GET /api/build/team
- AI assistant (not started)
- personalized flows (not started)
  - Build history
  - User preferences
  - Saved builds

This keeps the product maintainable while allowing future growth without reworking the whole app.
