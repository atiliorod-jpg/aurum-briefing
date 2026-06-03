export default function WelcomeStep() {
  return (
    <div className="text-center py-8">
      <div className="text-5xl font-bold tracking-[8px] text-[#1B2A41]">A</div>
      <div className="w-14 h-0.5 bg-[#C9A24B] mx-auto my-4" />
      <h2 className="text-2xl font-bold text-[#1B2A41] mb-3">Briefing do seu evento</h2>
      <p className="text-gray-500 text-base leading-relaxed mb-6">
        Em alguns minutos coletamos as informações para prepararmos uma proposta personalizada para você.
      </p>

      <div className="bg-white rounded-xl p-5 text-left shadow-sm text-sm text-gray-500 leading-relaxed space-y-1.5 mb-4">
        <p>⏱ <strong className="text-[#1B2A41]">Leva cerca de 3 minutos.</strong></p>
        <p>📱 Otimizado para o celular — basta tocar nas opções.</p>
        <p>💬 Ao final, você copia o resumo e envia para a nossa equipe.</p>
      </div>

      <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-5 text-left text-sm text-gray-600 leading-relaxed space-y-2">
        <p className="font-semibold text-[#1B2A41]">🎁 Dois brindes ao final, gratuitos:</p>
        <p>
          💌 <strong className="text-[#1B2A41]">Carta-convite pronta</strong> (Word) — com o seu cardápio,
          para você personalizar e enviar aos convidados do evento.
        </p>
        <p>
          📄 <strong className="text-[#1B2A41]">Resumo em PDF</strong> — com papel timbrado, ideal para
          compartilhar com outras pessoas envolvidas no evento.
        </p>
        <p className="text-xs text-gray-500 pt-1 border-t border-[#C9A24B]/20">
          📲 <strong>No celular?</strong> Ao abrir a carta no Word, ative o
          <strong> modo de leitura / visualização de impressão</strong>. Assim ela aparece exatamente
          como ficará impressa — no modo de edição do celular o layout pode parecer desalinhado.
        </p>
      </div>
    </div>
  );
}
