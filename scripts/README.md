# LEIBO Script Management Architecture

Hệ thống scripts tự động hóa, kiểm định dữ liệu và bảo trì của LEIBO được chuẩn hóa theo kiến trúc **Clean & Maintainable**:
- **Một nguồn dữ liệu chuẩn (Single Source of Truth)**.
- **Rõ ràng vai trò (Role-based boundaries)**.
- **Tách biệt công cụ nội bộ phát triển (DevTools) khỏi các pipeline sản xuất/CI/CD**.
- **Không tự ý sửa source bằng string manipulation hoặc tạo build thiếu căn cứ**.

---

## 1. Cấu trúc thư mục

```text
scripts/
├── assets/                  # Quản lý hình ảnh và tài nguyên game
│   ├── validate-assets-ci.ts# Asset Validation Gate (chạy trong CI và pre-deploy)
│   └── ...
├── backup/                  # Sao lưu và phục hồi cơ sở dữ liệu
│   └── database-backup.ts   # Quản lý dump Postgres, nén gzip và đồng bộ S3/R2
├── devtools/                # Công cụ debug, kiểm tra thủ công & điều tra dữ liệu
│   ├── check/               # Kiểm tra kết nối DB, R2 bucket, live URLs
│   ├── debug/               # Debug thông số vũ khí, ảnh nhân vật
│   ├── inspect/             # So sánh dữ liệu GenshinDB, Ambr, translation shapes
│   ├── list/                # Liệt kê ảnh thiếu, splash missing
│   └── ...                  # Script tiện ích dòng lệnh cho lập trình viên
├── fix/                     # Các bản vá dữ liệu game có kiểm soát
│   ├── fix-vision-mismatch.ts
│   └── ...
├── i18n/                    # Quốc tế hóa và kiểm định chất lượng bản dịch
│   ├── validate-i18n-quality.ts           # Translation Quality Gate (CI)
│   ├── translation-consistency-checker.ts # Kiểm tra độ đồng nhất định dạng
│   ├── translation-review-system.ts       # Hệ thống duyệt bản dịch
│   ├── translate-with-glossary.ts         # Đồng bộ glossary game content
│   └── game-terminology-glossary.json     # Bảng thuật ngữ game chuẩn 15 ngôn ngữ
├── images/                  # Quản lý tải và đồng bộ asset chính thức
│   ├── download-all-genshin-assets.mjs    # Nguồn sync asset duy nhất (npm run assets:sync)
│   ├── mirror-images-to-r2.ts             # Đồng bộ sang Cloudflare R2
│   └── download-version-key-visuals.mjs   # Tải artwork phiên bản game
├── lib/                     # Thư viện helper dùng chung giữa các scripts
├── maintenance/             # Dọn dẹp cache, build artifacts và temporary files
├── monitoring/              # Giám sát chất lượng dữ liệu & dashboard
├── pipeline/                # Pipeline thu thập dữ liệu game
│   ├── crawl-characters.ts  # Trích xuất dữ liệu nhân vật từ genshin-db
│   ├── crawl-extra-data.ts  # Trích xuất dữ liệu vũ khí, thánh di vật, bí cảnh
│   └── auto-fix.ts          # Tự động khắc phục sai lệch dữ liệu
├── seed/                    # Khởi tạo và nạp dữ liệu vào cơ sở dữ liệu
│   ├── seed.ts              # Trình nạp dữ liệu chính (PostgreSQL via Prisma)
│   └── verify-seed-integrity.ts # Kiểm tra tính toàn vẹn sau khi seed
├── sync/                    # Đồng bộ dữ liệu định kỳ
│   ├── update-data.ts       # Tự động phát hiện update genshin-db & mở PR
│   ├── auto-sync-game-data.ts
│   └── sync-docs.mjs        # Đồng bộ tài liệu API
└── update-character-builds.ts # Build Validation Gate kiểm tra 4 tầng
```

---

## 2. Nguyên tắc vận hành

1. **Không commit report tự sinh vào Git:**
   Mọi báo cáo kết quả (như `*.report.json`, `live-image-check.json`, `consistency-report.json`, `.tmp/reports/`) đều được định tuyến vào thư mục tạm hoặc upload qua GitHub Actions Artifacts, tuyệt đối không commit vào git tree.
2. **Không tự động sinh build giả:**
   Mọi build nhân vật phải có `profileId`, `playstyleVi`, giả định điều kiện benchmark, nguồn tham chiếu (KQM, KQMS) và ngày xác minh. Nếu thiếu dữ liệu, minh bạch hiển thị thiếu dữ liệu.
3. **Asset Authenticity:**
   Chỉ sử dụng hình ảnh chính thức của Genshin Impact từ kho `public/local-genshin-assets/` hoặc R2 mirror. Không lấy ảnh gần giống để thế vào vị trí thiếu. Thà hiển thị placeholder còn hơn hiển thị sai nhân vật hay vũ khí.
