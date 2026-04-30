import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

type Props = {
  slot: string;
  isPremium: boolean;
  format?: string;
  className?: string;
};

export function AdSlot({
  slot,
  isPremium,
  format = "auto",
  className = "",
}: Props) {
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (isPremium) return;
    if (pushedRef.current) return;
    if (typeof window === "undefined") return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch {
      // AdSense not loaded yet or blocked — silent fail
    }
  }, [isPremium]);

  if (isPremium) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1287934160117105"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
