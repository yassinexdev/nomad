import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import type { Metadata } from "next";
import image1 from "@/app/assets/floria-279/image-1.jpg";
import novaImage1 from "@/app/assets/nova-101/image-1.png";
import { UNIT_PRICE as FLORIA_PRICE } from "./floria-279/order-cta";
import { UNIT_PRICE as NOVA_PRICE } from "./nova-101/order-cta";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ShoesCategory" });

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
    openGraph: {
      title: t("metadataTitle"),
      description: t("metadataDescription"),
      locale: locale === "fr" ? "fr_MA" : locale === "ar" ? "ar_MA" : "en_US",
      type: "website",
    },
  };
}

export default async function ShoesCategoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ShoesCategory" });
  const tHome = await getTranslations({ locale, namespace: "Home" });

  const products = [
    {
      id: "floria-279",
      name: "Floria #279",
      price: FLORIA_PRICE,
      image: image1,
      href: "/shoes/floria-279" as const,
      badge: tHome("newBadge"),
      tag: t("tagLeather"),
    },
    {
      id: "nova-101",
      name: "Nova #101",
      price: NOVA_PRICE,
      image: novaImage1,
      href: "/shoes/nova-101" as const,
      badge: tHome("newBadge"),
      tag: t("tagLeather"),
    },
  ];

  return (
    <>
      <SiteHeader />

      {/* Announcement Banner */}
      <div className="bg-zinc-900 text-white text-center text-sm py-2.5 px-4 font-medium dark:bg-zinc-800">
        <p>{tHome("bannerText")}</p>
      </div>

      <main>
        {/* ── Hero / Category Header ── */}
        <section className="relative overflow-hidden border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-emerald-100/50 blur-[90px] dark:bg-emerald-900/20" />
            <div className="absolute -bottom-16 left-0 h-[320px] w-[320px] rounded-full bg-amber-100/30 blur-[70px] dark:bg-amber-900/10" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            {/* Breadcrumb */}
            <nav
              className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
              >
                {t("breadcrumbHome")}
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span
                className="font-medium text-zinc-900 dark:text-zinc-200"
                aria-current="page"
              >
                {t("breadcrumbCategory")}
              </span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                {/* Category pill */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {tHome("categoryShoes")}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
                  {t("heroTitle")}{" "}
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
                    {t("heroTitleAccent")}
                  </span>
                </h1>
                <p className="mt-3 max-w-xl text-base text-zinc-500 dark:text-zinc-400">
                  {t("heroSubtitle")}
                </p>
              </div>

              {/* Count badge */}
              <div className="shrink-0 rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {products.length}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("productCount")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust Badges ── */}
        <section className="border-b border-zinc-100 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span>{tHome("feature1Title")}</span>
              </div>
              <div className="hidden h-4 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
                <span>{tHome("feature2Title")}</span>
              </div>
              <div className="hidden h-4 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                <span>{tHome("feature3Title")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product Grid ── */}
        <section id="products" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            {/* Section heading */}
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
                  {t("collectionTitle")}
                </h2>
                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {t("collectionSubtitle")}
                </p>
              </div>
              <span className="rounded-full border border-zinc-900 bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-white dark:border-zinc-200 dark:bg-white dark:text-zinc-900">
                {tHome("categoryShoes")}
              </span>
            </div>

            {/* Cards */}
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  id={`product-card-${product.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:shadow-black/30"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* New badge */}
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {product.badge}
                    </span>
                    {/* Leather tag */}
                    <span className="absolute right-3 top-3 rounded-full border border-white/40 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                      {product.tag}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="shrink-0 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {product.price}{" "}
                        <span className="text-sm font-medium">DH</span>
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors duration-200 group-hover:bg-emerald-600 dark:bg-zinc-800 dark:group-hover:bg-emerald-600">
                        {tHome("shopNow")}
                        <svg
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA Banner ── */}
        <section className="border-t border-zinc-100 bg-zinc-900 text-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {tHome("trustTitle")}
            </h2>
            <p className="mt-3 text-sm text-zinc-400 max-w-md mx-auto">
              {tHome("trustSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              {[tHome("feature1Title"), tHome("feature2Title"), tHome("feature3Title")].map(
                (feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-zinc-300">
                    <svg
                      className="h-4 w-4 shrink-0 text-emerald-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {feat}
                  </div>
                )
              )}
            </div>
            <div className="mt-10">
              <a
                href="#products"
                id="shoes-category-bottom-cta"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500 active:scale-[0.98]"
              >
                {tHome("heroCta")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
