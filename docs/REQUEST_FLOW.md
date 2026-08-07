# Luồng request API

1. **Client** gửi request đến `/api/...`.
2. **Middleware** (`middleware.ts`):
   - Gắn `requestId`.
   - Xử lý CORS.
   - Kiểm tra rate limit (nếu có).
   - Log request.
3. **Route Handler** (`src/app/api/.../route.ts`):
   - Parse params (query, path).
   - Validate input.
   - Gọi service.
4. **Service Layer** (nếu có) xử lý business logic.
5. **Repository** (Prisma) thực hiện query DB.
6. **Response** được gói trong envelope (`ok()` hoặc `fail()`).
7. **Logger** ghi log response (status, duration).