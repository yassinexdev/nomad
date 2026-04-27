import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SalesPolicy" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function SalesPolicyPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { from } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "SalesPolicy" });

  const points = t.raw("points") as string[];
  const backToProduct = typeof from === "string" && from.startsWith("/shoes/") ? from : null;
  const ArrowIcon = locale === "ar" ? FaArrowRight : FaArrowLeft;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      {backToProduct ? (
        <Link
          href={backToProduct}
          className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 hover:underline dark:text-zinc-300"
        >
          <ArrowIcon className="size-3.5 shrink-0" aria-hidden />
          {t("backToProduct")}
        </Link>
      ) : null}
      <article className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{t("title")}</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{t("intro")}</p>
        <ul className="mt-6 list-disc space-y-2 ps-5 text-sm text-zinc-700 dark:text-zinc-200">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>
    </main>
  );
}
