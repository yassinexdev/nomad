import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import Image from "next/image";
import image1 from "@/app/assets/floria-279/image-1.jpg";
import novaImage1 from "@/app/assets/nova-101/image-1.png";
import { UNIT_PRICE } from "./shoes/floria-279/order-cta";
import { UNIT_PRICE as NOVA_UNIT_PRICE } from "./shoes/nova-101/order-cta";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const products = [
    {
      name: "Floria #279",
      price: UNIT_PRICE,
      image: image1,
      href: "/shoes/floria-279" as const,
      isNew: true,
    },
    {
      name: "Nova #101",
      price: NOVA_UNIT_PRICE,
      image: novaImage1,
      href: "/shoes/nova-101" as const,
      isNew: true,
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      title: t("feature1Title"),
      desc: t("feature1Desc"),
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      title: t("feature2Title"),
      desc: t("feature2Desc"),
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      ),
      title: t("feature3Title"),
      desc: t("feature3Desc"),
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const tickerItems = [
    "🔥 Livraison gratuite partout au Maroc",
    "✦ Paiement à la livraison",
    "✦ Commandez maintenant",
    "🔥 Livraison gratuite partout au Maroc",
    "✦ Paiement à la livraison",
    "✦ Commandez maintenant",
  ];

  return (
    <>
      {/* ── Announcement ticker ── */}
      <div className="overflow-hidden bg-zinc-900 dark:bg-zinc-800 py-2.5 select-none">
        <div className="animate-ticker gap-10 text-xs font-semibold tracking-wide text-white/90">
          {tickerItems.map((item, i) => (
            <span key={i} className="mr-10">{item}</span>
          ))}
        </div>
      </div>

      <SiteHeader />

      <main>
        {/* ── Hero Section ── */}
        <section className="relative overflow-hidden bg-white dark:bg-zinc-950">
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-emerald-100/50 blur-[120px] dark:bg-emerald-900/20" />
            <div className="absolute -bottom-24 left-0 h-[500px] w-[500px] rounded-full bg-amber-100/40 blur-[100px] dark:bg-amber-900/10" />
            <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-violet-100/20 blur-[80px] dark:bg-violet-900/10" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-22 lg:py-28">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              {/* Text */}
              <div className="animate-fade-up max-w-xl">
                {/* Category pill */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t("categoryShoes")} — Maroc
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white leading-[1.1]">
                  {t("heroTitle")}{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 bg-clip-text text-transparent">
                      {t("heroTitleAccent")}
                    </span>
                    {/* Underline accent */}
                    <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-60" />
                  </span>
                </h1>

                <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t("heroSubtitle")}
                </p>

                {/* Trust indicators */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { icon: "🚚", label: "Livraison gratuite" },
                    { icon: "💳", label: "Paiement à la livraison" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#products"
                    id="hero-cta-btn"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/25 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    {t("heroCta")}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Hero image */}
              <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 -z-10" />

                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-zinc-100 shadow-2xl shadow-zinc-300/40 dark:bg-zinc-900 dark:shadow-black/40 ring-1 ring-zinc-200/60 dark:ring-zinc-700/60">
                  <Image
                    src={image1}
                    alt={t("ariaLogo")}
                    fill
                    className="object-cover"
                    preload
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Floating price badge */}
                <div className="absolute -bottom-5 -left-5 rounded-2xl border border-zinc-200 bg-white px-5 py-3.5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">À partir de</p>
                  <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{UNIT_PRICE} <span className="text-sm font-semibold text-zinc-500">DH</span></p>
                </div>

                {/* Floating delivery badge */}
                <div className="absolute -top-4 -right-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-xl dark:border-emerald-800 dark:bg-emerald-950">
                  <span className="text-lg">🚚</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Livraison</p>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">Gratuite</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section className="border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
            <div className="text-center mb-10">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Nos engagements
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                {t("featuresTitle")}
              </h2>
              <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                {t("trustSubtitle")}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Hover gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.06] dark:group-hover:opacity-[0.12]`} />

                  <div className={`mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} p-3 text-white shadow-lg`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Products Section ── */}
        <section id="products" className="scroll-mt-20 border-t border-zinc-100 dark:border-zinc-800">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-22">
            {/* Section header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Collection
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                  {t("productsTitle")}
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {t("productsSubtitle")}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full border border-zinc-900 bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white dark:border-zinc-200 dark:bg-white dark:text-zinc-900">
                  {t("categoryShoes")}
                </span>
              </div>
            </div>

            {/* Product grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.name}
                  href={product.href}
                  id={`product-card-${product.name.replace(/\s+/g, "-").toLowerCase()}`}
                  className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:hover:shadow-black/30"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    {/* Badges */}
                    {product.isNew && (
                      <span className="absolute top-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        {t("newBadge")}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {product.price} DH
                      </p>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white transition group-hover:bg-zinc-800 dark:bg-zinc-800 dark:group-hover:bg-zinc-700 sm:w-auto">
                        {t("shopNow")}
                        <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

        {/* ── Bottom CTA ── */}
        <section className="relative overflow-hidden border-t border-zinc-100 dark:border-zinc-800">
          {/* Rich gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 dark:from-zinc-950 dark:to-emerald-950" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            {/* Features row */}
            <div className="grid gap-6 sm:grid-cols-3 mb-14">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 text-white shadow-lg`}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{f.title}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA block */}
            <div className="text-center border-t border-white/10 pt-14">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {t("trustTitle")}
              </h2>
              <p className="mt-4 text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                {t("trustSubtitle")}
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="#products"
                  id="footer-cta-btn"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-900/40 transition-all hover:bg-emerald-400 hover:shadow-2xl hover:shadow-emerald-900/50 active:scale-[0.98]"
                >
                  {t("heroCta")}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
