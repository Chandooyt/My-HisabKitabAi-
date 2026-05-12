const logoUrl = "/logo.png";

type Props = {
  className?: string;
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function Logo({ className = "", variant = "full", size = "md" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoUrl}
        alt="HisabKitab AI"
        className={`${sizeMap[size]} rounded-full object-cover ring-1 ring-emerald-100 shadow-sm bg-white`}
      />
      {variant === "full" && (
        <div className="leading-tight">
          <div className="text-base sm:text-lg font-extrabold text-gray-900">
            Hisab<span className="text-emerald-600">Kitab</span>{" "}
            <span className="inline-block bg-emerald-600 text-white text-[10px] font-bold rounded-md px-1.5 py-0.5 align-middle ml-0.5">
              AI
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
