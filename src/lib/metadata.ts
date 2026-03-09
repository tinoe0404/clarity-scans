import { Metadata } from "next";
import { Locale } from "@/types";
import { getAppTranslations } from "./getTranslations";

export async function generatePageMetadata(
  locale: Locale,
  page: "home" | "modules" | "watch" | "breathhold" | "visual" | "feedback"
): Promise<Metadata> {
  const t = await getAppTranslations(locale);

  let pageTitle = "";
  switch (page) {
    case "home":
      pageTitle = t.app("name");
      break;
    case "modules":
      pageTitle = t.modules("title");
      break;
    case "breathhold":
      pageTitle = t.breathhold("title");
      break;
    case "visual":
      pageTitle = t.visual("title");
      break;
    case "feedback":
      pageTitle = t.feedback("title");
      break;
    // 'watch' is handled dynamically per video
    default:
      pageTitle = t.app("name");
  }

  const title = page === "home" || !pageTitle ? t.app("name") : `ClarityScans — ${pageTitle}`;

  const description = t.app("tagline");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: t.app("name"),
      locale,
      type: "website",
    },
    manifest: "/manifest.json",
    themeColor: "#0a0f1e",
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
      userScalable: false,
    },
  };
}
