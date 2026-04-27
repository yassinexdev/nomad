"use client";

import { useEffect } from "react";

type MetaPixelEventPayload = Record<string, string | number | boolean | string[]>;

type ViewContentPayload = {
  content_name: string;
  content_type: "product";
  content_ids?: string[];
  value?: number;
  currency?: string;
};

declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      eventName: string,
      payload?: MetaPixelEventPayload,
    ) => void;
  }
}

function trackMetaPixelEvent(
  eventName: string,
  payload?: MetaPixelEventPayload,
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq("track", eventName, payload);
}

export function trackPageView(): void {
  trackMetaPixelEvent("PageView");
}

export function trackViewContent(payload: ViewContentPayload): void {
  trackMetaPixelEvent("ViewContent", payload);
}

type AddToCartPayload = {
  content_name: string;
  content_type: "product";
  content_ids?: string[];
  value?: number;
  currency?: string;
};

export function trackAddToCart(payload: AddToCartPayload): void {
  trackMetaPixelEvent("AddToCart", payload);
}

type InitiateCheckoutPayload = {
  content_name: string;
  content_type: "product";
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
};

export function trackInitiateCheckout(payload: InitiateCheckoutPayload): void {
  trackMetaPixelEvent("InitiateCheckout", payload);
}

type LeadPayload = {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
};

/** Meta: use after order is confirmed (e.g. thank-you page) — COD / lead-gen flows */
export function trackLead(payload?: LeadPayload): void {
  trackMetaPixelEvent("Lead", payload);
}

type PurchasePayload = {
  value: number;
  currency: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  num_items?: number;
};

/** Meta: completed order value (optional; pair with Lead if you optimize for both) */
export function trackPurchase(payload: PurchasePayload): void {
  trackMetaPixelEvent("Purchase", payload);
}

type GtagFn = (
  command: "event",
  eventName: string,
  eventParams?: Record<string, string | number | boolean | string[] | undefined>,
) => void;

function trackGtagEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | string[] | undefined>,
): void {
  if (typeof window === "undefined") return;
  const gtag = (window as typeof window & { gtag?: GtagFn }).gtag;
  if (!gtag) return;
  gtag("event", eventName, params);
}

export type ThankYouConversionParams = {
  contentName: string;
  value: number;
  currency: string;
  contentIds: string[];
  numItems?: number;
};

/** Thank-you page: Meta Lead + Purchase (value) + GA4 `generate_lead` + `purchase` */
export function trackThankYouConversions(p: ThankYouConversionParams): void {
  trackLead({
    content_name: p.contentName,
    content_category: "shoes",
    content_ids: p.contentIds,
  });
  trackPurchase({
    value: p.value,
    currency: p.currency,
    content_ids: p.contentIds,
    content_name: p.contentName,
    content_type: "product",
    num_items: p.numItems ?? 1,
  });
  trackGtagEvent("generate_lead", {
    currency: p.currency,
    value: p.value,
    item_id: p.contentIds[0],
    item_name: p.contentName,
  });
  trackGtagEvent("purchase", {
    transaction_id: `zk_${Date.now()}`,
    currency: p.currency,
    value: p.value,
    item_id: p.contentIds[0],
    item_name: p.contentName,
  });
}

type MetaPixelViewContentProps = {
  payload: ViewContentPayload;
};

export function MetaPixelViewContent({ payload }: MetaPixelViewContentProps) {
  useEffect(() => {
    trackViewContent(payload);
  }, [payload]);

  return null;
}
