"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6] flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-2">Algo deu errado</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          Tivemos um problema inesperado ao carregar esta etapa. Seus dados ficam salvos
          neste dispositivo — tente novamente que você continua de onde parou.
        </p>
        <button
          onClick={reset}
          className="w-full bg-[#1B2A41] text-white py-3.5 rounded-xl font-semibold text-base active:scale-[0.98] transition-all"
        >
          Tentar novamente
        </button>
        <a
          href="https://wa.me/5581998184489"
          className="block mt-3 text-sm text-[#9A7B2E] font-medium underline"
        >
          Falar com a Aurum no WhatsApp
        </a>
      </div>
    </div>
  );
}
