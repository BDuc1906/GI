"use client";

/**
 * Community Section - Góc cộng đồng & Đóng góp
 * - Thanh tiến độ đóng góp
 * - Bảng vàng đóng góp
 */

export function CommunitySection() {
  const contributions = [
    { task: "Dịch cốt truyện nhân vật mới", progress: 75 },
    { task: "Cập nhật số liệu La Hoàn", progress: 90 },
    { task: "Thêm ảnh HD cho vũ khí", progress: 40 },
  ];

  const topContributors = [
    { name: "Player123", edits: 234 },
    { name: "GenshinMaster", edits: 189 },
    { name: "WikiEditor", edits: 156 },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          👥 Cộng đồng & Đóng góp
        </h2>
        <p className="text-text-secondary">
          Gia nhập cộng đồng để xây dựng Wiki
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text-primary mb-4">📊 Thanh tiến độ đóng góp</h3>
          <div className="space-y-4">
            {contributions.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-primary">{item.task}</span>
                  <span className="text-gold-bright">{item.progress}%</span>
                </div>
                <div className="w-full bg-bg-secondary rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text-primary mb-4">🏆 Bảng vàng đóng góp</h3>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <span className="font-medium text-text-primary">{contributor.name}</span>
                </div>
                <span className="text-gold-bright font-semibold">{contributor.edits} edits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}