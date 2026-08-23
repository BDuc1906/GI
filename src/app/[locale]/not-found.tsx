import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-6xl font-bold text-[color:var(--gold-bright)] mb-4">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-wide text-neutral-100 uppercase mb-3">
        {t("title")}
      </h1>
      <p className="text-sm text-[color:var(--parchment-dim)] max-w-md mb-8">
        {t("description")}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="rounded-lg border border-[color:var(--gold)]/40 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-[color:var(--gold-bright)] hover:border-[color:var(--gold-bright)] transition-colors"
        >
          {t("home")}
        </Link>
        <Link
          href="/characters"
          className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-neutral-300 hover:text-[color:var(--gold-bright)] hover:border-[color:var(--gold)]/40 transition-colors"
        >
          {t("viewCharacters")}
        </Link>
      </div>
    </div>
  );
}
