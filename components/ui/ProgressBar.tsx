"use client";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = current === 0 ? 0 : Math.min(100, (current / total) * 100);
  const label = current === 0 ? "Início" : current === total ? "Concluído" : `Passo ${current} de ${total}`;

  return (
    <header className="bg-[#1B2A41] text-white px-5 py-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div>
          <div className="text-xl font-bold tracking-[4px]">AURUM</div>
          <div className="text-[10px] text-[#C9A24B] tracking-[2px] italic">SERVIÇOS GASTRONÔMICOS</div>
        </div>
        <div className="text-xs text-white/70 tracking-wide">{label}</div>
      </div>
      <div className="mt-3 max-w-2xl mx-auto">
        <div className="h-1 bg-white/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9A24B] rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </header>
  );
}
