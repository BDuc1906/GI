import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createLocalizedMetadata({
    locale,
    pathname: "admin",
    title: "Admin Dashboard — LEIBO",
    robots: { index: false, follow: false },
  });
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
