import { SiteFooter } from "@/components/site-footer";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? "font-arabic" : "font-sans";

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div
        lang={locale}
        dir={dir}
        className={`flex min-h-full flex-1 flex-col ${fontClass}`}
        suppressHydrationWarning
      >
        {children}
        <SiteFooter />
      </div>
    </NextIntlClientProvider>
  );
}
