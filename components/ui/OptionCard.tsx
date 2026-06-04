"use client";

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  variant?: "single" | "multi";
}

export default function OptionCard({ label, description, selected, onClick, variant = "single" }: OptionCardProps) {
  if (variant === "multi") {
    return (
      <button
        onClick={onClick}
        role="checkbox"
        aria-checked={selected}
        className={`relative rounded-xl border-2 px-3 py-3 text-sm text-left min-h-[64px] flex flex-col justify-center transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:ring-offset-1 ${
          selected
            ? "border-[#C9A24B] bg-[#FBF7EE] font-semibold shadow-sm"
            : "border-gray-200 bg-white"
        }`}
      >
        {selected && (
          <span className="absolute top-2 right-2.5 text-[#C9A24B] text-xs font-bold">✓</span>
        )}
        <span className="block font-medium text-[#1B2A41] leading-snug pr-4">{label}</span>
        {description && (
          <span className="block text-xs text-gray-500 mt-1 leading-snug font-normal">{description}</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      className={`w-full flex items-start gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A24B] focus-visible:ring-offset-1 ${
        selected
          ? "border-[#C9A24B] bg-[#FBF7EE] shadow-sm"
          : "border-gray-200 bg-white"
      }`}
    >
      <span className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-[#C9A24B] bg-[#C9A24B]" : "border-gray-300"
      }`}>
        {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
      </span>
      <span className="flex-1">
        <span className="block text-[#1B2A41] font-medium text-base leading-snug">{label}</span>
        {description && <span className="block text-gray-500 text-sm mt-0.5 leading-snug">{description}</span>}
      </span>
    </button>
  );
}
