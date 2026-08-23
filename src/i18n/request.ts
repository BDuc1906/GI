import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // "requestLocale" thay vì đọc `params.locale` trực tiếp — next-intl
  // khuyến nghị cách này vì nó tương thích cả static rendering
  // (generateStaticParams) lẫn dynamic, và tự fallback an toàn.
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
