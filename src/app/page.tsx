import Link from "next/link";
import { prisma } from "../lib/prisma";
import { ELEMENT_COLORS } from "../lib/theme";

export default async function Home() {
  // 1. Truy vấn đồng thời số lượng bản ghi từ cơ sở dữ liệu Supabase
  const [charCount, weaponCount, artifactCount] = await Promise.all([
    prisma.character.count(),
    prisma.weapon.count(),
    prisma.artifactSet.count(),
  ]);

  // 2. Định nghĩa cấu trúc dữ liệu cho các thẻ danh mục (Grid Cards)
  const cards = [
    { 
      href: "/characters", 
      label: "Nhân vật", 
      count: charCount, 
      desc: "Chỉ số, kỹ năng, thiên phú và cung mệnh chi tiết." 
    },
    { 
      href: "/weapons", 
      label: "Vũ khí", 
      count: weaponCount, 
      desc: "Thuộc tính nền, nội tại và chỉ số nâng cấp qua các cấp đột phá." 
    },
    { 
      href: "/artifacts", 
      label: "Thánh di vật", 
      count: artifactCount, 
      desc: "Thuộc tính kích hoạt của bộ 2 món và bộ 4 món." 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen flex flex-col justify-center bg-neutral-950 text-neutral-100">
      
      {/* Khối hiển thị vòng tròn nguyên tố phát sáng (Vũ trụ Genshin) */}
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {Object.entries(ELEMENT_COLORS).map(([name, color]) => (
          <div
            key={name}
            title={name}
            className="w-10 h-10 rounded-full border-2 transition-all duration-300 hover:scale-110 cursor-help"
            style={{ 
              borderColor: color, 
              boxShadow: `0 0 16px -2px ${color}`,
              backgroundColor: `${color}20` // Đưa về mã HEX alpha chuẩn thay vì dùng dấu xuyệt CSS thô
            }}
          />
        ))}
      </div>

      {/* Khối tiêu đề trung tâm */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-wider mb-4 uppercase text-amber-400 drop-shadow-[0_2px_8px_rgba(255,215,0,0.3)]">
          Chào mừng đến với <span className="text-amber-300">LEIBO</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Cơ sở dữ liệu Genshin Impact — hệ thống tra cứu số liệu tĩnh được đồng bộ trực tiếp từ cấu trúc dữ liệu gốc của trò chơi.
        </p>
      </div>

      {/* Khối danh mục dạng Lưới cấu trúc (Grid Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:border-amber-400 block group shadow-lg"
          >
            {/* Hiển thị số lượng bản ghi lớn */}
            <div className="text-5xl font-black text-amber-400 mb-3 transition-transform duration-300 group-hover:scale-105 origin-left">
              {c.count}
            </div>
            
            {/* Tên danh mục */}
            <div className="text-xl font-semibold text-neutral-100 mb-2 group-hover:text-amber-400 transition-colors">
              {c.label} &rarr;
            </div>
            
            {/* Mô tả chi tiết danh mục */}
            <div className="text-sm text-neutral-400 leading-relaxed-dim">
              {c.desc}
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
