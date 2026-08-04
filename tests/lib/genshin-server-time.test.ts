import { describe, expect, it } from "vitest";
import {
  genshinServerWeekdayIndex,
  genshinServerWeekdayName,
} from "@/lib/genshin-server-time";

describe("genshinServerWeekdayIndex (server Châu Á, UTC+8, reset 4h sáng)", () => {
  it("03:59 sáng giờ server (ngay TRƯỚC mốc reset) vẫn tính là ngày hôm trước", () => {
    // 2026-08-05 03:59 UTC+8 = 2026-08-04 19:59 UTC.
    // Đổi ngày CHƯA xảy ra (còn 1 phút nữa mới 4h sáng) -> vẫn là Thứ Ba (04/08/2026).
    const date = new Date("2026-08-04T19:59:00Z");
    expect(genshinServerWeekdayIndex(date)).toBe(2); // Tuesday
  });

  it("04:00 sáng giờ server (ĐÚNG mốc reset) đã sang ngày mới", () => {
    // 2026-08-05 04:00 UTC+8 = 2026-08-04 20:00 UTC -> đổi ngày, thành Thứ Tư.
    const date = new Date("2026-08-04T20:00:00Z");
    expect(genshinServerWeekdayIndex(date)).toBe(3); // Wednesday
  });

  it("nửa đêm giờ server (00:00) — theo lịch dương là ngày mới nhưng theo GAME vẫn là ngày hôm trước vì chưa tới giờ reset", () => {
    // 2026-08-05 00:00 UTC+8 = 2026-08-04 16:00 UTC.
    // Lịch dương thông thường sẽ nói đây là Thứ Tư (05/08) — nhưng trong
    // game vẫn là Thứ Ba (04/08) vì domain/weekly boss chưa reset. Đây
    // chính xác là trường hợp code cũ (tính theo nửa đêm) sẽ trả SAI.
    const date = new Date("2026-08-04T16:00:00Z");
    expect(genshinServerWeekdayIndex(date)).toBe(2); // Tuesday, KHÔNG PHẢI Wednesday
  });

  it("không phụ thuộc múi giờ Việt Nam (UTC+7) — lệch 1h so với server Châu Á (UTC+8) quanh mốc reset", () => {
    // 2026-08-04T20:30:00Z = 03:30 giờ VN (04/08, TRƯỚC nửa đêm VN) nhưng
    // = 04:30 giờ server Asia (05/08, SAU mốc reset 4h). Nếu code còn tính
    // theo giờ VN sẽ cho ra Thứ Ba — đúng theo giờ server phải là Thứ Tư.
    const date = new Date("2026-08-04T20:30:00Z");
    expect(genshinServerWeekdayIndex(date)).toBe(3); // Wednesday
  });

  it("genshinServerWeekdayName() trả đúng tên tiếng Anh khớp Domain.daysOfWeek trong DB", () => {
    const date = new Date("2026-08-04T20:00:00Z"); // vừa qua mốc reset -> Wednesday
    expect(genshinServerWeekdayName(date)).toBe("Wednesday");
  });

  it("hỗ trợ đổi utcOffsetHours cho server khác (vd Mỹ UTC-5), không hardcode riêng Châu Á", () => {
    // Cùng 1 thời điểm UTC, server Mỹ (UTC-5) có thể vẫn ở ngày hôm trước
    // trong khi server Châu Á (UTC+8) đã sang ngày mới.
    const date = new Date("2026-08-04T20:00:00Z"); // Asia: Wednesday (đã reset)
    const americaIndex = genshinServerWeekdayIndex(date, -5); // America: chưa tới 4h sáng
    expect(americaIndex).toBe(2); // vẫn Tuesday
  });
});
