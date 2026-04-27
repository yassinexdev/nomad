"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { FR, MA } from "country-flag-icons/react/3x2";
import { useLocale, useTranslations } from "next-intl";

const localeOptions = {
  fr: { Flag: FR, label: "Francais" },
  ar: { Flag: MA, label: "Arabic" },
} as const;

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("LocaleSwitcher");

  return (
    <div className="text-sm" role="group" aria-label={t("label")}>
      <Select
        value={locale}
        onValueChange={(nextLocale) => {
          router.replace(pathname, { locale: nextLocale });
        }}
      >
        <SelectTrigger
          className="h-9 w-auto min-w-0 justify-start gap-1 border-0 bg-transparent px-0 py-1 text-base shadow-none focus:ring-0 dark:bg-transparent [&>svg]:size-3"
          aria-label={t("label")}
        >
          <SelectValue aria-label={localeOptions[locale as keyof typeof localeOptions].label}>
            {(() => {
              const CurrentFlag = localeOptions[locale as keyof typeof localeOptions].Flag;
              return <CurrentFlag aria-hidden className="h-4 w-5 rounded-[2px]" />;
            })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {routing.locales.map((code) => {
            const option = localeOptions[code as keyof typeof localeOptions];
            const Flag = option.Flag;

            return (
              <SelectItem key={code} value={code}>
                <span className="inline-flex items-center gap-2">
                  <Flag aria-hidden className="h-4 w-5 rounded-[2px]" />
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
