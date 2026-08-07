# LEIBO - KẾ HOẠCH CẢI TIẾN 27 BƯỚC CHI TIẾT

**Dự án:** LEIBO – Genshin Impact Database  
**Ngày:** 2026-08-07  
**Phiên bản:** 1.0  

---

## MỤC LỤC

1. [Tổng quan dự án](#bước-1-tổng-quan-dự-án)
2. [Công nghệ sử dụng](#bước-2-công-nghệ-sử-dụng)
3. [Cấu trúc thư mục](#bước-3-cấu-trúc-thư-mục)
4. [Kiến trúc hệ thống](#bước-4-kiến-trúc-hệ-thống)
5. [Phân tích module](#bước-5-phân-tích-module)
6. [Luồng request](#bước-6-luồng-request)
7. [Xác thực](#bước-7-xác-thực)
8. [Phân quyền](#bước-8-phân-quyền)
9. [Cơ sở dữ liệu](#bước-9-cơ-sở-dữ-liệu)
10. [Kiến trúc API](#bước-10-kiến-trúc-api)
11. [Luồng nghiệp vụ](#bước-11-luồng-nghiệp-vụ)
12. [Đồ thị phụ thuộc](#bước-12-đồ-thị-phụ-thuộc)
13. [Dịch vụ bên ngoài](#bước-13-dịch-vụ-bên-ngoài)
14. [Cấu hình](#bước-14-cấu-hình)
15. [Ghi log](#bước-15-ghi-log)
16. [Xử lý lỗi](#bước-16-xử-lý-lỗi)
17. [Bảo mật](#bước-17-bảo-mật)
18. [Hiệu suất](#bước-18-hiệu-suất)
19. [Khả năng mở rộng](#bước-19-khả-năng-mở-rộng)
20. [Triển khai](#bước-20-triển-khai)
21. [Kiểm thử](#bước-21-kiểm-thử)
22. [Quy tắc code](#bước-22-quy-tắc-code)
23. [Mẫu thiết kế](#bước-23-mẫu-thiết-kế)
24. [Điểm mạnh](#bước-24-điểm-mạnh)
25. [Nợ công nghệ](#bước-25-nợ-công-nghệ)
26. [Đề xuất cải tiến](#bước-26-đề-xuất-cải-tiến)
27. [Phụ lục](#bước-27-phụ-lục)

---

## BƯỚC 1: TỔNG QUAN DỰ ÁN
**Ưu tiên:** 🔴 CRITICAL  
**Thời gian dự kiến:** 1 ngày  
**File cần tạo:** `docs/PROJECT_OVERVIEW.md`

**Vấn đề:** Không có tài liệu tổng quan, người mới không hiểu mục đích và phạm vi của dự án.

**Giải pháp:** Tạo file `PROJECT_OVERVIEW.md` với nội dung:

```markdown
# LEIBO – Tổng quan dự án

## Giới thiệu
LEIBO là trang web tra cứu dữ liệu Genshin Impact miễn phí, hướng đến người chơi Việt Nam.

## Vấn đề
- Người chơi cần tra cứu thông tin nhân vật, vũ khí, thánh di vật, bí cảnh một cách nhanh chóng.
- Dữ liệu từ các nguồn tiếng Anh khó tiếp cận.
- Các trang hiện có thường chậm hoặc thiếu dữ liệu cập nhật.

## Giải pháp
- Web app tĩnh + API public.
- Pipeline tự động cập nhật dữ liệu hàng tuần từ genshin-db.
- Tự host ảnh trên Cloudflare R2 để tránh hotlink chết.

## Đối tượng
Game thủ Genshin Impact Việt Nam.

## Mục tiêu
- **Ngắn hạn:** Cung cấp tra cứu đầy đủ, nhanh, chính xác.
- **Dài hạn:** Damage calculator, build guide, cộng đồng, đa ngôn ngữ.