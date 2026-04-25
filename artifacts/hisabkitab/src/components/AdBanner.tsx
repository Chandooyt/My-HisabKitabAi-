type Props = {
  placement: "top" | "bottom";
};

export function AdBanner({ placement }: Props) {
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
        {/*
          Replace the markup below with a real AdSense unit when ready, e.g.:

          <ins className="adsbygoogle"
               style={{ display: "block", width: "100%", height: 90 }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="1234567890"
               data-ad-format="auto"
               data-full-width-responsive="true" />
        */}
        <span>Ad space ({placement})</span>
      </div>
    </div>
  );
}
