"use client";

import { trackThankYouConversions } from "@/components/analytics/meta-pixel-events";
import { useEffect, useRef } from "react";

const THANK_META = {
  contentName: "Floria #279",
  value: 249,
  currency: "MAD",
  contentIds: ["floria-279"] as string[],
  numItems: 1,
};

/** Fire once per full page load (refresh fires again — acceptable for thank-you). */
export function ThankYouConversionEvent() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    trackThankYouConversions(THANK_META);
  }, []);

  return null;
}
