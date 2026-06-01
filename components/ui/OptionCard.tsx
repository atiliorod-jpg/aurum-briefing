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
        className={`relative rounded-xl border-2 p-4 text-sm font-medium text-center min-h-[64px] flex items-center justify-center leading-snug transition-all active:scale-[0.97] ${
          selected
            ? "border-[#C9A24B] bg-[#FBF7EE] text-[#1B2A41] font-semibold shadow-md"
            : "border-gray-200 bg-white text-[#1B2A41]"
        }`}
      >
        {selected && (
          <span className="absolute top-1.5 right-2 text-[#C9A24B] text-sm font-bold">✓</span>
        )}
        <span dangerouslySetInnerHTML={{ __html: label }} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98] min-h-[56px] ${
        selected
          ? "border-[#C9A24B] bg-[#FBF7EE] shadow-md"
          : "border-gray-200 bg-white"
      }`}
    >
      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selected ? "border-[#C9A24B] bg-[#C9A24B]" : "border-gray-300"
      }`}>
        {selected && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
      </span>
      <span className="flex-1">
        <span className="block text-[#1B2A41] font-medium text-base">{label}</span>
        {description && <span className="block text-gray-500 text-sm mt-0.5">{description}</span>}
      </span>
    </button>
  );
}
