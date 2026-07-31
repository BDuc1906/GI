import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "LEIBO — Genshin Impact Database",
  description: "Dữ liệu Genshin Impact: nhân vật, vũ khí, thánh di vật.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="border-b border-border sticky top-0 bg-primary/80 backdrop-blur-md z-10">
            <nav className="flex items-center justify-between px-4 md:px-8 py-3 max-w-7xl mx-auto">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-display text-xl font-bold tracking-wide text-amber-500">
                  LEIBO
                </Link>
                <Link href="/characters" className="hover:text-amber-400 transition-colors">Nhân vật</Link>
                <Link href="/weapons" className="hover:text-amber-400 transition-colors">Vũ khí</Link>
                <Link href="/artifacts" className="hover:text-amber-400 transition-colors">Thánh di vật</Link>
              </div>
              <ThemeToggle />
            </nav>
          </header>
          <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}