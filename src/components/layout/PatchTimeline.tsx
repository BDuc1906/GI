"use client";

import { useState } from "react";

/**
 * Patch Timeline - Lịch sử cập nhật
 * - Timeline các phiên bản
 * - Click để xem thông tin lịch sử
 */

export function PatchTimeline() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const versions = [
    { version: "5.0", date: "2024-08", region: "Natlan" },
    { version: "4.7", date: "2024-06", region: "Fontaine" },
    { version: "4.6", date: "2024-04", region: "Fontaine" },
    { version: "4.5", date: "2024-03", region: "Fontaine" },
    { version: "4.4", date: "2024-01", region: "Fontaine" },
    { version: "4.3", date: "2023-12", region: "Fontaine" },
    { version: "4.2", date: "2023-11", region: "Fontaine" },
    { version: "4.1", date: "2023-09", region: "Fontaine" },
    { version: "4.0", date: "2023-08", region: "Fontaine" },
    { version: "3.8", date: "2023-07", region: "Sumeru" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          📜 Lịch sử cập nhật
        </h2>
        <p className="text-text-secondary">
          Timeline các phiên bản game
        </p>
      </div>

      <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex overflow-x-auto gap-4 pb-4">
          {versions.map((item) => (
            <button
              key={item.version}
              onClick={() => setSelectedVersion(item.version)}
              className={`flex-shrink-0 px-6 py-3 rounded-xl border-2 transition-all ${
                selectedVersion === item.version
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : "border-border hover:border-gold/50 text-text-primary"
              }`}
            >
              <div className="font-bold">{item.version}</div>
              <div className="text-xs text-text-muted">{item.date}</div>
            </button>
          ))}
        </div>

        {selectedVersion && (
          <div className="mt-6 p-4 bg-bg-secondary rounded-xl">
            <div className="font-semibold text-text-primary mb-2">
              Phiên bản {selectedVersion}
            </div>
            <div className="text-sm text-text-muted">
              {versions.find((v) => v.version === selectedVersion)?.region} - {versions.find((v) => v.version === selectedVersion)?.date}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}