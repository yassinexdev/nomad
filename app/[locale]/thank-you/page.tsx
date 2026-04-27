import { ThankYouConversionEvent } from "@/components/analytics/thank-you-conversion";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaCheckCircle } from "react-icons/fa";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ThankYou" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function ThankYouPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ThankYou" });

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <ThankYouConversionEvent />
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        aria-hidden
      >
        <FaCheckCircle className="size-9" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t("subtitle")}
      </p>
      <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/shoes/floria-279"
          className={cn(
            buttonVariants({ variant: "orderCta", size: "lg" }),
            "w-full sm:w-auto sm:min-w-[10rem] motion-safe:animate-none"
          )}
        >
          {t("ctaProduct")}
        </Link>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "w-full sm:w-auto sm:min-w-[10rem]"
          )}
        >
          {t("ctaHome")}
        </Link>
      </div>
    </main>
  );
}
