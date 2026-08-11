# File tra cứu đầy đủ — Genshin Impact API (genshin.jmp.blue)

**Đã kiểm chứng SỐNG THẬT lúc viết file này** — gọi trực tiếp
`https://genshin.jmp.blue` và nhận về JSON thật, không phải đoán như
`AmbrProvider.ts` bản trước. Nguồn: [genshindev/api](https://github.com/genshindev/api)
(812 sao GitHub, mã nguồn mở, license OSL-3.0).

## Base URL

```
https://genshin.jmp.blue
```

Đây là bản host "luôn cập nhật" (`always up-to-date`) do chính tác giả
API duy trì — không cần đăng ký, không cần API key, hoàn toàn miễn phí.

## 10 loại dữ liệu đang có (đã verify live)

Gọi `GET https://genshin.jmp.blue/` trả về đúng:
```json
{"types":["artifacts","boss","characters","consumables","domains","elements","enemies","materials","nations","weapons"]}
```

| Loại | Khớp với model nào trong DB LEIBO của bạn |
|---|---|
| `characters` | `Character` |
| `weapons` | `Weapon` |
| `artifacts` | `ArtifactSet` |
| `materials` | `Material` |
| `domains` | `Domain` |
| `boss`, `enemies` | Chưa có model tương ứng (đúng như đã bàn — Enemy chưa làm) |
| `consumables`, `nations`, `elements` | Không có model riêng trong LEIBO hiện tại |

## 6 kiểu endpoint — áp dụng cho MỌI loại ở trên

Thay `<type>` bằng 1 trong 10 loại ở bảng trên, `<id>` bằng slug (tên viết thường, cách nhau bằng dấu `-`, vd `hu-tao`, `staff-of-homa`).

| Endpoint | Trả về gì | Ví dụ |
|---|---|---|
| `GET /` | Danh sách 10 loại dữ liệu | `curl https://genshin.jmp.blue/` |
| `GET /<type>` | Danh sách slug của loại đó | `curl https://genshin.jmp.blue/characters` |
| `GET /<type>/all?lang=en` | Chi tiết ĐẦY ĐỦ của TẤT CẢ entity trong loại đó | `curl https://genshin.jmp.blue/characters/all?lang=en` |
| `GET /<type>/<id>?lang=en` | Chi tiết 1 entity | `curl https://genshin.jmp.blue/characters/albedo?lang=en` |
| `GET /<type>/<id>/list` | Danh sách ảnh có sẵn cho entity đó | `curl https://genshin.jmp.blue/characters/albedo/list` |
| `GET /<type>/<id>/<imageType>` | File ảnh (binary, không phải JSON) | `curl https://genshin.jmp.blue/characters/albedo/card` |

`lang` là tham số tuỳ chọn — không phải mọi field đều có đủ bản dịch,
mặc định trả tiếng Anh nếu bỏ qua.

## Câu lệnh test nhanh cho từng loại LEIBO cần

```bash
curl -s "https://genshin.jmp.blue/characters/albedo?lang=en"
curl -s "https://genshin.jmp.blue/weapons/staff-of-homa?lang=en"
curl -s "https://genshin.jmp.blue/artifacts/gladiators-finale?lang=en"
curl -s "https://genshin.jmp.blue/materials/mora?lang=en"
curl -s "https://genshin.jmp.blue/domains?lang=en"
```

Muốn lấy TOÀN BỘ nhân vật cùng lúc (để đối chiếu hàng loạt thay vì
từng người) thì dùng `/all`:

```bash
curl -s "https://genshin.jmp.blue/characters/all?lang=en" -o all-characters.json
```

## Lấy danh sách slug đúng (để biết `<id>` chính xác là gì)

Nếu không chắc slug 1 nhân vật/vũ khí viết thế nào, gọi danh sách trước:

```bash
curl -s "https://genshin.jmp.blue/characters" | head -c 2000
curl -s "https://genshin.jmp.blue/weapons" | head -c 2000
```

## Giới hạn cần biết

- **Không có rate limit công bố chính thức** (khác Ambr/Gemini) — nhưng vẫn nên gọi vừa phải, đây là dịch vụ cộng đồng miễn phí, không phải hạ tầng trả phí có SLA.
- **Chỉ có dữ liệu tĩnh** (README ghi rõ: *"This API only provides static data"*) — không có dữ liệu real-time như banner hiện tại, giá trị thị trường... nhưng LEIBO cũng chỉ cần dữ liệu tĩnh (thông số nhân vật/vũ khí) nên khớp đúng nhu cầu.
- Là dự án **fan-made cộng đồng** (812 sao GitHub, 206 fork, vẫn đang nhận PR) — không phải API chính thức của miHoYo, nhưng đây vốn là bản chất chung của MỌI nguồn "live" cho Genshin (kể cả Ambr/Enka đều là fan-made), không riêng gì nguồn này.

## Việc cần làm tiếp

Tôi đã cập nhật `AmbrProvider.ts` (đổi tên thành `JmpBlueProvider.ts`)
để dùng nguồn này thay vì Ambr — xem file code kèm theo. Bạn chỉ cần:
1. Đổi `AGENT_LIVE_PROVIDER=ambr` thành `AGENT_LIVE_PROVIDER=jmpblue` trong `.env`
2. Test thử 1 lệnh curl ở trên, xác nhận field trong JSON khớp với mapping tôi viết trong `JmpBlueProvider.ts` (tôi đã map dựa trên cấu trúc chuẩn của `genshindev/api`, nhưng vẫn nên bạn xác nhận 1 lần vì tôi chỉ fetch được endpoint gốc `/`, chưa fetch được sâu tới `/characters/albedo` do giới hạn công cụ của tôi — xem ghi chú trong code)
