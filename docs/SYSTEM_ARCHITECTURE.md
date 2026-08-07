graph TB
    User[User Browser]
    Vercel[Vercel CDN + Next.js]
    API[API Routes]
    Prisma[Prisma ORM]
    Neon[Neon PostgreSQL]
    Redis[Upstash Redis]
    R2[Cloudflare R2]
    GH[GitHub Actions]
    Scripts[Seed/Mirror Scripts]
    Genshin[genshin-db]

    User --> Vercel
    Vercel --> API
    API --> Prisma
    Prisma --> Neon
    API --> Redis
    API --> R2
    GH --> Scripts
    Scripts --> Genshin
    Scripts --> Neon
    Scripts --> R2