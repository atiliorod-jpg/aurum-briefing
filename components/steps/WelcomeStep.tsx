export default function WelcomeStep() {
  return (
    <div className="text-center py-10">
      <div className="text-5xl font-bold tracking-[8px] text-[#1B2A41]">A</div>
      <div className="w-14 h-0.5 bg-[#C9A24B] mx-auto my-4" />
      <h2 className="text-2xl font-bold text-[#1B2A41] mb-3">Briefing do seu evento</h2>
      <p className="text-gray-500 text-base leading-relaxed mb-8">
        Em alguns minutos coletamos as informações para prepararmos uma proposta personalizada para você.
      </p>
      <div className="bg-white rounded-xl p-5 text-left shadow-sm text-sm text-gray-500 leading-relaxed space-y-1">
        <p>⏱ <strong className="text-[#1B2A41]">Leva cerca de 3 minutos.</strong></p>
        <p>📱 Otimizado para o celular — basta tocar nas opções.</p>
        <p>💬 Ao final, você envia o resumo pelo WhatsApp.</p>
      </div>
    </div>
  );
}
