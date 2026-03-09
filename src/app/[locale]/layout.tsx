import { NextIntlClientProvider } from "next-intl";
import { getMessages, unstable_setRequestLocale } from "next-intl/server";
import { Locale, LOCALES } from "@/types";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: any;
  try {
    const localeModule = await import(`../../messages/${locale}.json`);
    messages = localeModule.default || localeModule;
  } catch {
    const fallbackModule = await import(`../../messages/en.json`);
    messages = fallbackModule.default || fallbackModule;
  }

  return {
    title: `ClarityScans ${messages.app?.name ? `— ${messages.app.name}` : ""}`,
    description: messages.app?.tagline || "Understanding your CT Scan",
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!LOCALES.includes(locale as Locale)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
