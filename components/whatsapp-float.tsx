"use client";

import { useState, useEffect } from "react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "212600000000";

export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    // Show after a slight delay for smooth entrance
    const timer = setTimeout(() => setVisible(true), 1500);
    // Stop pulse after 8 seconds
    const pulseTimer = setTimeout(() => setPulse(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const message = encodeURIComponent("Bonjour, je suis intéressé par vos produits !");
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      id="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      className={[
        "fixed bottom-6 right-6 z-50 flex items-center justify-center",
        "h-14 w-14 rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/30",
        "transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-[#25D366]/40",
        "active:scale-95",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        pulse ? "animate-[whatsapp-pulse_2s_ease-in-out_infinite]" : "",
      ].join(" ")}
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden>
        <path d="M16.004 2.667A13.26 13.26 0 0 0 2.72 15.892a13.16 13.16 0 0 0 1.783 6.631L2.667 29.333l7.004-1.835a13.24 13.24 0 0 0 6.333 1.61h.005A13.278 13.278 0 0 0 16.004 2.667Zm0 24.32a11.01 11.01 0 0 1-5.614-1.536l-.403-.239-4.175 1.095 1.115-4.073-.263-.418a10.96 10.96 0 0 1-1.685-5.863A11.027 11.027 0 0 1 16.004 4.93a11.027 11.027 0 0 1 0 22.057Zm6.043-8.264c-.332-.166-1.963-.968-2.268-1.079-.305-.111-.527-.166-.748.166s-.86 1.079-1.054 1.3-.388.25-.72.084a9.075 9.075 0 0 1-2.672-1.649 10.01 10.01 0 0 1-1.849-2.302c-.194-.332-.02-.512.146-.677.15-.148.332-.388.498-.583.166-.194.221-.332.332-.555.111-.222.056-.416-.028-.583-.083-.166-.748-1.803-1.025-2.468-.27-.649-.544-.561-.748-.572l-.637-.01a1.221 1.221 0 0 0-.886.416c-.305.332-1.163 1.136-1.163 2.77s1.19 3.214 1.356 3.436c.166.222 2.343 3.575 5.677 5.014.793.342 1.412.546 1.895.7.796.252 1.521.216 2.094.131.639-.095 1.963-.803 2.24-1.578.277-.775.277-1.44.194-1.578-.083-.139-.305-.222-.637-.388Z" />
      </svg>
    </a>
  );
}
