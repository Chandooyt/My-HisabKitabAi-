import { useEffect, useRef } from "react";

type Props = {
  placement: "top" | "bottom";
};

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as
  | string
  | undefined;
const ADSENSE_SLOT_TOP = import.meta.env.VITE_ADSENSE_SLOT_TOP as
  | string
  | undefined;
const ADSENSE_SLOT_BOTTOM = import.meta.env.VITE_ADSENSE_SLOT_BOTTOM as
  | string
  | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptInjected = false;

const ensureAdsenseScript = (client: string) => {
  if (scriptInjected) return;
  if (typeof document === "undefined") return;
  const existing = document.querySelector(
    'script[data-hk-adsense="1"]',
  ) as HTMLScriptElement | null;
  if (existing) {
    scriptInjected = true;
    return;
  }
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
    client,
  )}`;
  s.setAttribute("data-hk-adsense", "1");
  document.head.appendChild(s);
  scriptInjected = true;
};

export function AdBanner({ placement }: Props) {
  const insRef = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  const slot = placement === "top" ? ADSENSE_SLOT_TOP : ADSENSE_SLOT_BOTTOM;
  const enabled = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!enabled || !ADSENSE_CLIENT) return;
    ensureAdsenseScript(ADSENSE_CLIENT);
    if (pushed.current) return;
    if (!insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not ready yet; will retry on next render
    }
  }, [enabled, slot]);

  if (!enabled) {
    const label = placement === "top" ? "Top banner ad" : "Bottom banner ad";
    return (
      <div
        className="w-full flex items-center justify-center my-3"
        data-testid={`ad-${placement}`}
      >
        <div
          className="w-full max-w-3xl h-[90px] rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-emerald-700/70 flex items-center justify-center text-sm"
          aria-label={label}
        >
          <span>Ad space ({placement})</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full flex items-center justify-center my-3"
      data-testid={`ad-${placement}`}
    >
      <div className="w-full max-w-3xl">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 90 }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
