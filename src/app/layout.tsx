import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "LEIBO — Genshin Impact Database",
  description: "Dữ liệu Genshin Impact: nhân vật, vũ khí, thánh di vật.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 sticky top-0 bg-neutral-950/90 backdrop-blur z-10">
          <nav className="max-w-6xl mx-auto flex items-center gap-6 px-4 py-3">
            <Link href="/" className="font-bold text-xl tracking-wide text-amber-400">
              LEIBO
            </Link>
            <Link href="/characters" className="hover:text-amber-300">Nhân vật</Link>
            <Link href="/weapons" className="hover:text-amber-300">Vũ khí</Link>
            <Link href="/artifacts" className="hover:text-amber-300">Thánh di vật</Link>
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
