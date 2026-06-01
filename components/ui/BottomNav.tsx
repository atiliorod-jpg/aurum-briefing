"use client";

interface BottomNavProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canAdvance: boolean;
  isLast: boolean;
  isSkippable?: boolean;
  onSkip?: () => void;
}

export default function BottomNav({ onBack, onNext, canGoBack, canAdvance, isLast, isSkippable, onSkip }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {isSkippable && (
        <div className="text-center pt-2">
          <button onClick={onSkip} className="text-gray-400 text-sm underline">Pular este passo</button>
        </div>
      )}
      <div className="max-w-2xl mx-auto flex gap-3 px-5 py-3">
        <button
          onClick={onBack}
          className={`flex-none w-24 py-4 rounded-xl border-2 border-gray-200 text-[#1B2A41] font-semibold text-base transition-all active:scale-[0.97] ${
            canGoBack ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={`flex-1 py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
            isLast
              ? "bg-[#C9A24B] text-[#1B2A41]"
              : "bg-[#1B2A41] text-white"
          }`}
        >
          {isLast ? "Concluir" : "Próximo"}
        </button>
      </div>
    </nav>
  );
}
