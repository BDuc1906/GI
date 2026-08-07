# Database LEIBO

- **Provider:** Neon PostgreSQL (serverless)
- **ORM:** Prisma
- **Connection strings:**
  - `DATABASE_URL` – qua pooler (runtime)
  - `DIRECT_URL` – trực tiếp (migrate)
- **Migration:** Prisma migrate deploy
- **Indexes:** Trên các cột hay filter (vision, weaponType, rarity, category)
- **Backup:** Neon tự động.