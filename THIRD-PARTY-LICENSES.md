# Third-Party Licenses and Dependencies

This document provides licensing information for all third-party libraries, frameworks,
dependencies, and data sources integrated into the LEIBO repository.

---

## 1. Core Framework & Runtime Dependencies

| Package / Library | License | Primary Purpose | Project Link |
| :--- | :--- | :--- | :--- |
| **Next.js** | MIT | React Web Application Framework | https://nextjs.org |
| **React** & **React DOM** | MIT | UI Component Library | https://react.dev |
| **TypeScript** | Apache-2.0 | Type System & Compiler | https://www.typescriptlang.org |
| **Tailwind CSS** | MIT | Utility-First CSS Framework | https://tailwindcss.com |
| **Prisma ORM** | Apache-2.0 | Next-generation Database ORM | https://www.prisma.io |
| **@prisma/adapter-pg** | Apache-2.0 | PostgreSQL Driver Adapter | https://www.prisma.io |
| **pg** | MIT | PostgreSQL Client for Node.js | https://github.com/brianc/node-postgres |
| **next-intl** | MIT | Internationalization (i18n) Framework | https://next-intl.dev |
| **@upstash/ratelimit** | MIT | Serverless Rate Limiting via Redis | https://upstash.com |
| **@upstash/redis** | MIT | Serverless Redis Client | https://upstash.com |
| **@sentry/nextjs** | MIT / Apache-2.0 | Error Monitoring & Telemetry | https://sentry.io |
| **@ai-sdk/openai** | Apache-2.0 | AI SDK Core Providers | https://sdk.vercel.ai |
| **@ai-sdk/google** | Apache-2.0 | Gemini API SDK Adapter | https://sdk.vercel.ai |
| **@ai-sdk/anthropic** | Apache-2.0 | Claude API SDK Adapter | https://sdk.vercel.ai |
| **zod** | MIT | TypeScript-First Schema Validation | https://zod.dev |

---

## 2. Development, Testing & Pipeline Tools

| Package / Library | License | Primary Purpose | Project Link |
| :--- | :--- | :--- | :--- |
| **Vitest** | MIT | Unit & Integration Test Runner | https://vitest.dev |
| **Playwright** | Apache-2.0 | End-to-End (E2E) Browser Testing | https://playwright.dev |
| **ESLint** | MIT | Static Code Analysis & Linter | https://eslint.org |
| **tsx** | MIT | TypeScript Execution Engine | https://github.com/privatenumber/tsx |
| **@aws-sdk/client-s3** | Apache-2.0 | Cloudflare R2 / S3 Storage Client | https://aws.amazon.com/sdk-for-javascript |
| **genshin-db** | MIT | Community Game Data Extraction | https://github.com/the-Bow-Brothers/genshin-db |

---

## 3. Data Sources & Community APIs

### 3.1. genshin-db
- **Author:** the-Bow-Brothers
- **License:** MIT License
- **Usage:** Provides structured static game data across 15 official game locales.

### 3.2. Enka.Network API
- **Provider:** Enka.Network
- **Usage:** Provides public showcase data for player profiles by UID.
- **Terms:** Rate-limited and cached according to fair-use API guidelines.

### 3.3. Theorycrafting Standards (KeqingMains)
- **Community:** KeqingMains (KQM)
- **Usage:** Build recommendations, energy recharge requirements, rotation benchmarks, and the 20-Roll Standard (KQMS) calculation guidelines.

---

## 4. Game Content & Proprietary Trademarks

All intellectual property rights regarding **Genshin Impact** game assets, characters,
artwork, audio, and game lore belong to **COGNOSPHERE PTE. LTD. / miHoYo Co., Ltd.**
Refer to `NOTICE` and `public/local-genshin-assets/ASSET-LICENSE.md`.
