import createMiddleware from "next-intl/middleware";
import { LOCALES, DEFAULT_LOCALE } from "@/types";

export default createMiddleware({
  // A list of all locales that are supported
  locales: LOCALES,

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Always prefix routing (e.g. /en/modules, /sn/modules)
  localePrefix: "always",

  // Automatically detect locale from Accept-Language header
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    // - … the admin routes (`/admin/**`)
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
    // However, match all root `/` pages to allow redirecting to default locale
    "/",
    "/(sn|nd|en)/:path*",
  ],
};
