"use client";

import image1 from "@/app/assets/floria-279/image-1.jpg";
import image2 from "@/app/assets/floria-279/image-2.jpg";
import image3 from "@/app/assets/floria-279/image-3.jpg";
import image4 from "@/app/assets/floria-279/image-4.jpg";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";

const media = [
  { type: "image" as const, src: image1 },
  { type: "image" as const, src: image2 },
  { type: "image" as const, src: image3 },
  { type: "image" as const, src: image4 },
  { type: "video" as const, src: "/videos/floria-279/video-2.mp4" },
];

type ImageCarouselProps = {
  imageAlt: string;
};

export function ImageCarousel({ imageAlt }: ImageCarouselProps) {
  const t = useTranslations("ProductFloria279");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const sync = () => setSelected(api.selectedScrollSnap());
    api.on("select", sync);
    api.on("reInit", sync);
    queueMicrotask(sync);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
    };
  }, [api]);

  return (
    <div className="w-full space-y-3">
      <Carousel
        className="w-full"
        opts={{ direction: isRtl ? "rtl" : "ltr" }}
        dir={isRtl ? "rtl" : "ltr"}
        setApi={setApi}
      >
        <CarouselContent className="ml-0">
          {media.map((item, index) => (
            <CarouselItem key={`${item.type}-${index}`} className="pl-0">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                    aria-label={imageAlt}
                  >
                    <source src={item.src} type="video/mp4" />
                  </video>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="default"
          className={`${
            isRtl ? "left-auto! right-3" : "left-3 right-auto!"
          } h-8 w-8 border border-zinc-200 bg-white/90 text-zinc-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200`}
        />
        <CarouselNext
          variant="default"
          className={`${
            isRtl ? "left-3 right-auto!" : "left-auto! right-3"
          } h-8 w-8 border border-zinc-200 bg-white/90 text-zinc-700 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200`}
        />
      </Carousel>

      <div
        className="flex gap-2 overflow-x-auto px-1 py-1"
        role="tablist"
        aria-label={t("galleryThumbnailsLabel")}
      >
        {media.map((item, index) => (
          <button
            key={`thumb-${item.type}-${index}`}
            type="button"
            role="tab"
            aria-selected={selected === index}
            aria-label={t("gallerySlideGoTo", { number: index + 1 })}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "relative size-14 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-white transition sm:size-16 dark:ring-offset-zinc-950",
              selected === index
                ? "ring-emerald-600"
                : "ring-transparent hover:ring-zinc-300 dark:hover:ring-zinc-600"
            )}
          >
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt=""
                width={64}
                height={64}
                className="size-full object-cover"
                sizes="(max-width: 640px) 56px, 64px"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-zinc-800 text-white">
                <FaPlay className="size-4 opacity-90" aria-hidden />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
