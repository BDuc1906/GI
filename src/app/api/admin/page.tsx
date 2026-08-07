'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PipelineRun {
  id: string;
  name: string;
  status: 'started' | 'success' | 'failed';
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  error: string | null;
  details: Record<string, any> | null;
}

interface PipelineStats {
  [name: string]: {
    started: number;
    success: number;
    failed: number;
  };
}

interface LatestStatus {
  [name: string]: {
    status: string;
    startedAt: string;
    id: string;
  };
}

const STATUS_COLORS = {
  started: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS = {
  started: '⏳ Đang chạy',
  success: '✅ Thành công',
  failed: '❌ Thất bại',
};

const PIPELINE_LABELS = {
  crawl: 'Crawl dữ liệu',
  seed: 'Seed database',
  mirror: 'Mirror ảnh',
  'update-data': 'Cập nhật dữ liệu',
};

export default function AdminPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [stats, setStats] = useState<PipelineStats>({});
  const [latestStatus, setLatestStatus] = useState<LatestStatus>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pipeline-status?limit=50');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (!body.success) throw new Error(body.error?.message || 'Unknown error');
      setRuns(body.data.runs || []);
      setStats(body.data.stats || {});
      setLatestStatus(body.data.latestStatus || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh mỗi 30s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', { hour12: false });
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-[#f0ece4] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 w-64 bg-[#1e1e22] rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-[#1e1e22] rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-[#1e1e22] rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] text-[#f0ece4] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg">⚠️ Lỗi tải dữ liệu</p>
            <p className="text-sm text-[#a8a4a0]">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-[#1e1e22] border border-[#2a2a2e] rounded-lg hover:border-[#F4D03F] transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pipelineNames = Object.keys(latestStatus);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f0ece4] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#F4D03F]">📊 Pipeline Dashboard</h1>
            <p className="text-sm text-[#a8a4a0] mt-1">Giám sát trạng thái các pipeline tự động</p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#1e1e22] border border-[#2a2a2e] rounded-lg hover:border-[#F4D03F] transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Pipeline Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {pipelineNames.map((name) => {
            const status = latestStatus[name]?.status || 'unknown';
            const color = status === 'success' ? 'border-green-500/30' :
                          status === 'failed' ? 'border-red-500/30' :
                          status === 'started' ? 'border-yellow-500/30' :
                          'border-[#2a2a2e]';
            const label = PIPELINE_LABELS[name as keyof typeof PIPELINE_LABELS] || name;
            return (
              <div
                key={name}
                className={`bg-[#1e1e22] border rounded-xl p-4 ${color}`}
              >
                <div className="text-xs text-[#a8a4a0] uppercase tracking-wider">{label}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-lg font-semibold ${
                    status === 'success' ? 'text-green-400' :
                    status === 'failed' ? 'text-red-400' :
                    status === 'started' ? 'text-yellow-400' :
                    'text-[#6b6865]'
                  }`}>
                    {STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}
                  </span>
                  {status === 'started' && (
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-[#6b6865] mt-1">
                  {latestStatus[name]?.startedAt ? formatTime(latestStatus[name].startedAt) : '—'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="bg-[#1e1e22] border border-[#2a2a2e] rounded-xl p-4 mb-8">
          <h2 className="text-sm font-semibold text-[#a8a4a0] uppercase tracking-wider mb-3">📈 Thống kê</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats).map(([name, data]) => (
              <div key={name} className="flex items-center gap-3 text-sm">
                <span className="text-[#a8a4a0]">{PIPELINE_LABELS[name as keyof typeof PIPELINE_LABELS] || name}:</span>
                <span className="text-green-400">{data.success} ✅</span>
                <span className="text-red-400">{data.failed} ❌</span>
                <span className="text-yellow-400">{data.started} ⏳</span>
              </div>
            ))}
          </div>
        </div>

        {/* Run History */}
        <div className="bg-[#1e1e22] border border-[#2a2a2e] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a2e] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#a8a4a0] uppercase tracking-wider">
              📋 Lịch sử chạy ({runs.length} gần nhất)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161618]">
                <tr>
                  <th className="px-4 py-2 text-left text-[#a8a4a0] font-medium">Pipeline</th>
                  <th className="px-4 py-2 text-left text-[#a8a4a0] font-medium">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-[#a8a4a0] font-medium">Bắt đầu</th>
                  <th className="px-4 py-2 text-left text-[#a8a4a0] font-medium">Thời gian</th>
                  <th className="px-4 py-2 text-left text-[#a8a4a0] font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-[#2a2a2e] hover:bg-[#161618] transition-colors">
                    <td className="px-4 py-2">
                      {PIPELINE_LABELS[run.name as keyof typeof PIPELINE_LABELS] || run.name}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[run.status as keyof typeof STATUS_COLORS] || 'bg-[#1e1e22] text-[#6b6865] border-[#2a2a2e]'}`}>
                        {STATUS_LABELS[run.status as keyof typeof STATUS_LABELS] || run.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[#a8a4a0]">{formatTime(run.startedAt)}</td>
                    <td className="px-4 py-2 text-[#a8a4a0]">{formatDuration(run.durationMs)}</td>
                    <td className="px-4 py-2">
                      {run.error ? (
                        <span className="text-red-400 cursor-help" title={run.error}>
                          ⚠️ Lỗi
                        </span>
                      ) : run.details ? (
                        <span className="text-[#a8a4a0]">
                          {run.details.rowsAffected !== undefined && `${run.details.rowsAffected} rows`}
                          {run.details.downloaded !== undefined && `📥 ${run.details.downloaded}`}
                          {run.details.failed !== undefined && run.details.failed > 0 && ` ❌ ${run.details.failed}`}
                        </span>
                      ) : (
                        <span className="text-[#6b6865]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[#6b6865]">
                      Chưa có pipeline nào chạy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-xs text-[#6b6865] text-center">
          Tự động refresh mỗi 30 giây · Dữ liệu lưu trong database
        </div>
      </div>
    </div>
  );
}