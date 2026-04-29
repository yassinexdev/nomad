"use client";

import { EU_SIZES } from "@/lib/eu-sizes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { InputWithStartIcon } from "@/components/ui/field-with-start-icon";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingBag,
  FaUser,
} from "react-icons/fa";
import { trackInitiateCheckout, trackAddToCart } from "@/components/analytics/meta-pixel-events";
import { useMemo, useRef, useState } from "react";

const PRODUCT_CODE = "Floria #279";
export const UNIT_PRICE = 249;


function digitsOnlyPhone(raw: string | undefined): string {
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

function trackEvent(action: string, params: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & {
    gtag?: (
      command: "event",
      eventName: string,
      eventParams?: Record<string, string | number | boolean>
    ) => void;
  }).gtag;

  if (!gtag) return;
  gtag("event", action, params);
}

export function OrderCta() {
  const t = useTranslations("Order");
  const router = useRouter();
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  const rtlFields = locale === "ar";

  const [size, setSize] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "error">("idle");
  const [showErrors, setShowErrors] = useState(false);
  const trackedFieldsRef = useRef<Set<string>>(new Set());
  /** Quantity UI hidden for now; always 1 until you re-enable the selector. */
  const qtyNumber = 1;
  const totalPrice = UNIT_PRICE * qtyNumber;

  const cityLine = useMemo(() => city.trim(), [city]);

  const phoneLine = useMemo(() => digitsOnlyPhone(phone), [phone]);
  const canSubmit = Boolean(size) && cityLine.length > 0 && phoneLine.length > 0;
  const sizeError = showErrors && !size;
  const cityError = showErrors && cityLine.length === 0;
  const phoneError = showErrors && phoneLine.length === 0;

  async function submitOrder() {
    trackEvent("order_button_click", {
      product: PRODUCT_CODE,
      valid_submission: canSubmit,
      locale,
      quantity: qtyNumber,
    });

    if (!canSubmit) {
      trackEvent("order_validation_error", {
        product: PRODUCT_CODE,
        locale,
      });
      setShowErrors(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: PRODUCT_CODE,
          size,
          qty: qtyNumber,
          city: cityLine,
          phone: phoneLine,
          name: name.trim(),
          locale,
          unitPrice: UNIT_PRICE,
          totalPrice,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "unknown");
        console.error("Order API error:", response.status, errorBody);
        throw new Error(`Request failed: ${response.status}`);
      }

      trackEvent("order_submitted", {
        product: PRODUCT_CODE,
        locale,
        city: cityLine || "unknown",
        quantity: qtyNumber,
        size: size || "unknown",
      });
      trackInitiateCheckout({
        content_name: PRODUCT_CODE,
        content_type: "product",
        content_ids: ["floria-279"],
        value: totalPrice,
        currency: "MAD",
        num_items: qtyNumber,
      });
      setSubmitStatus("idle");
      setShowErrors(false);
      router.push("/thank-you?from=/shoes/floria-279");
    } catch (error) {
      console.error("Order submit error:", error);
      trackEvent("order_submit_failed", {
        product: PRODUCT_CODE,
        locale,
      });
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function trackFieldFill(fieldName: string, isFilled: boolean) {
    if (!isFilled || trackedFieldsRef.current.has(fieldName)) return;
    trackedFieldsRef.current.add(fieldName);
    trackEvent("order_field_filled", {
      product: PRODUCT_CODE,
      field_name: fieldName,
      locale,
    });
  }

  return (
    <section id="order-section" className="mt-2 scroll-mt-28 space-y-6 md:scroll-mt-8">
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm ring-1 ring-zinc-900/5 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:ring-white/5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("orderButton")}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("requiredHint")}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("stickyBarLabel")}</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {totalPrice} {t("currency")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("sizeLabel")}
            </p>
            <RadioGroup
              aria-label={t("sizeLabel")}
              value={size}
              onValueChange={(value) => {
                setSize(value);
                trackFieldFill("size", Boolean(value));
                if (value) {
                  trackAddToCart({
                    content_name: PRODUCT_CODE,
                    content_type: "product",
                    content_ids: ["floria-279"],
                    value: UNIT_PRICE,
                    currency: "MAD",
                  });
                }
              }}
              aria-invalid={sizeError}
              className="grid grid-cols-4 gap-2 sm:grid-cols-7"
            >
              {EU_SIZES.map((s) => (
                <RadioGroupItem
                  key={s}
                  value={s}
                  className={[
                    "group relative cursor-pointer items-center justify-center rounded-xl py-3 px-1 transition-all duration-200",
                    "border-2 border-zinc-200 bg-white text-zinc-800 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md",
                    "data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white! data-[state=checked]:shadow-lg data-[state=checked]:shadow-emerald-200",
                    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80",
                    "dark:data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:text-white! dark:data-[state=checked]:shadow-emerald-900/40",
                    sizeError && !size && "border-red-300 ring-1 ring-red-300 dark:border-red-500/70",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="text-base font-bold leading-none">{s}</span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("nameLabel")}
            </span>
            <InputWithStartIcon
              icon={<FaUser className="size-4 shrink-0" aria-hidden />}
              rtl={rtlFields}
              type="text"
              dir={direction}
              autoComplete="name"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
                trackFieldFill("name", value.trim().length > 0);
              }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("phoneLabel")}
            </span>
            <InputWithStartIcon
              icon={<FaPhone className="size-4 shrink-0" aria-hidden />}
              rtl={rtlFields}
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("phonePlaceholder")}
              value={phone}
              aria-invalid={phoneError}
              error={phoneError}
              onChange={(e) => {
                const value = e.target.value;
                setPhone(value);
                trackFieldFill("phone", digitsOnlyPhone(value).length > 0);
              }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200 sm:col-span-2">
            <span className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("cityLabel")}
            </span>
            <InputWithStartIcon
              icon={<FaMapMarkerAlt className="size-4 shrink-0" aria-hidden />}
              rtl={rtlFields}
              type="text"
              dir={direction}
              name="order-city"
              autoComplete="off"
              placeholder={t("cityPlaceholder")}
              value={city}
              aria-invalid={cityError}
              error={cityError}
              onChange={(e) => {
                const value = e.target.value;
                setCity(value);
                trackFieldFill("city", value.trim().length > 0);
              }}
            />
          </label>
        </div>

        <div className="mt-5 space-y-2">
          {showErrors && !canSubmit ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {t("requiredHint")}
            </p>
          ) : null}
          {submitStatus === "error" ? (
            <p className="text-sm text-red-600 dark:text-red-400">{t("submitError")}</p>
          ) : null}

          <Button
            type="button"
            onClick={submitOrder}
            disabled={isSubmitting}
            variant="orderCta"
            size="lg"
            className="w-full disabled:translate-y-0 disabled:scale-100 disabled:border-zinc-300 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:opacity-100 disabled:shadow-none dark:disabled:border-zinc-600 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-400"
          >
            {isSubmitting ? (
              t("submitting")
            ) : (
              <>
                <FaShoppingBag className="size-5 shrink-0" aria-hidden />
                {t("orderButton")} - {totalPrice} {t("currency")}
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
