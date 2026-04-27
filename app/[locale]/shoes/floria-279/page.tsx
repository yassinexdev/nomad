import image1 from "@/app/assets/floria-279/image-1.jpg";
import image2 from "@/app/assets/floria-279/image-2.jpg";
import { MetaPixelViewContent } from "@/components/analytics/meta-pixel-events";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImageCarousel } from "./image-carousel";
import { ProductFloriaClient } from "./product-client";

type Props = {
  params: Promise<{ locale: string }>;
};

const images = [image1, image2];
const hero = images[0];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductFloria279" });

  const title = t("metadataTitle");
  const description = t("metadataDescription");
  const imageAlt = t("imageAlt");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      locale: locale === "fr" ? "fr_MA" : locale === "ar" ? "ar_MA" : "en_US",
      type: "website",
      images: [
        {
          url: hero.src,
          width: hero.width,
          height: hero.height,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [hero.src],
    },
  };
}

export default async function Floria279Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProductFloria279" });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-8">
        <MetaPixelViewContent
          payload={{
            content_name: "Floria 279",
            content_type: "product",
            content_ids: ["floria-279"],
          }}
        />
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Link href="/shoes" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            {t("breadcrumbCategory")}
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="text-zinc-900 dark:text-zinc-200 font-medium" aria-current="page">
            Floria #279
          </span>
        </nav>
        <article className="grid gap-10 md:grid-cols-2 md:items-start">
          <div className="w-full">
            <ImageCarousel imageAlt={t("imageAlt")} />
          </div>
          <ProductFloriaClient />
        </article>
      </main>
    </>
  );
}
