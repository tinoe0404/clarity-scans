import createMiddleware from "next-intl/middleware";
import { LOCALES, DEFAULT_LOCALE } from "@/types";

export default createMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "as-needed",
});

export const config = {
  matcher: ["/((?!api|_next|admin|.*\\..*).*)"],
};
