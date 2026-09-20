"use client";

/**
 * Version Hub & Banners
 * - Current Wishes with countdown
 * - Giftcode mới nhất
 */

export function VersionHub() {

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Cập nhật phiên bản mới
        </h2>
        <p className="text-text-secondary">
          Banner cầu nguyện hiện tại & Giftcode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Wishes */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary text-lg whitespace-nowrap overflow-hidden text-ellipsis">
              🎟️ Banner cầu nguyện hiện tại
            </h3>
            <span className="px-3 py-1 bg-gold/20 text-gold-bright text-xs font-semibold rounded-full whitespace-nowrap ml-2">
              Live
            </span>
          </div>
          <div className="space-y-4">
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="font-medium text-text-primary">Nhân vật - Bước 1</span>
                <span className="text-gold-bright font-semibold whitespace-nowrap">⏰ 5 ngày 12 giờ</span>
              </div>
              <div className="text-sm text-text-muted">
                Kết thúc: Thứ 5, 22:00
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <span className="font-medium text-text-primary">Vũ khí - Bước 1</span>
                <span className="text-gold-bright font-semibold whitespace-nowrap">⏰ 5 ngày 12 giờ</span>
              </div>
              <div className="text-sm text-text-muted">
                Kết thúc: Thứ 5, 22:00
              </div>
            </div>
          </div>
        </div>

        {/* Giftcode */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary text-lg whitespace-nowrap overflow-hidden text-ellipsis">
              🎁 Giftcode mới nhất
            </h3>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full whitespace-nowrap ml-2">
              3 codes
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0 flex-1">
                  <code className="text-gold-bright font-mono text-sm break-all">GENSHINGIFT0626</code>
                  <div className="text-xs text-text-muted mt-1">Primogem x50</div>
                </div>
                <button className="px-3 py-1 bg-gold text-text-inverted text-xs font-semibold rounded hover:bg-gold/80 transition-colors whitespace-nowrap">
                  Sao chép
                </button>
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0 flex-1">
                  <code className="text-gold-bright font-mono text-sm break-all">GIMM2GENGIFT0626</code>
                  <div className="text-xs text-text-muted mt-1">Primogem x100</div>
                </div>
                <button className="px-3 py-1 bg-gold text-text-inverted text-xs font-semibold rounded hover:bg-gold/80 transition-colors whitespace-nowrap">
                  Sao chép
                </button>
              </div>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0 flex-1">
                  <code className="text-gold-bright font-mono text-sm break-all">LIOVINGALLEN0626</code>
                  <div className="text-xs text-text-muted mt-1">Primogem x50</div>
                </div>
                <button className="px-3 py-1 bg-gold text-text-inverted text-xs font-semibold rounded hover:bg-gold/80 transition-colors whitespace-nowrap">
                  Sao chép
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
