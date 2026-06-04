"use client";
import { useState } from "react";

export default function WelcomeStep() {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <div className="text-center py-8">
      <div className="mb-5">
        {logoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo-aurum.png"
            alt="Aurum Serviços Gastronômicos"
            onError={() => setLogoOk(false)}
            className="mx-auto w-40 h-auto rounded-2xl shadow-lg"
          />
        ) : (
          <div className="py-2">
            <div style={{ fontFamily: "Cardo, Georgia, serif" }} className="text-5xl font-bold text-[#C9A24B] leading-none">
              Aurum
            </div>
            <div className="w-16 h-px bg-[#C9A24B] mx-auto my-2.5" />
            <div className="text-[10px] tracking-[3px] text-[#C9A24B] font-medium">SERVIÇOS GASTRONÔMICOS</div>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-[#1B2A41] mb-3">Briefing do seu evento</h2>
      <p className="text-gray-500 text-base leading-relaxed mb-6">
        Em alguns minutos coletamos as informações para prepararmos uma proposta personalizada para você.
      </p>

      <div className="bg-white rounded-xl p-5 text-left shadow-sm text-sm text-gray-500 leading-relaxed space-y-1.5 mb-4">
        <p>⏱ <strong className="text-[#1B2A41]">Leva cerca de 7 minutos.</strong></p>
        <p>📱 Otimizado para o celular — basta tocar nas opções.</p>
        <p>💬 Ao final, você gera o resumo em PDF e nos envia pelo WhatsApp.</p>
      </div>

      <div className="bg-white rounded-xl p-5 text-left shadow-sm text-sm text-gray-500 leading-relaxed space-y-1.5 mb-4">
        <p className="font-semibold text-[#1B2A41]">📄 Ao final, gere o resumo em PDF</p>
        <p>
          Com papel timbrado e a estimativa parcial. <strong className="text-[#1B2A41]">Envie-o para a
          nossa equipe pelo WhatsApp</strong> para recebermos seu briefing e prepararmos a proposta.
        </p>
      </div>

      <div className="bg-[#FBF7EE] border border-[#C9A24B]/40 rounded-xl p-5 text-left text-sm text-gray-600 leading-relaxed space-y-2">
        <p className="font-semibold text-[#1B2A41]">🎁 Brinde ao final, gratuito:</p>
        <p>
          💌 <strong className="text-[#1B2A41]">Carta-convite pronta</strong> (PDF ou Word) — com o seu
          cardápio, para você personalizar e enviar aos convidados do evento.
        </p>
        <p className="text-xs text-gray-500 pt-1 border-t border-[#C9A24B]/20">
          📲 <strong>No celular?</strong> Ao abrir a carta no Word, ative o
          <strong> modo de leitura / visualização de impressão</strong>. Assim ela aparece exatamente
          como ficará impressa — no modo de edição do celular o layout pode parecer desalinhado.
        </p>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed mt-4 px-2">
        🔒 Suas respostas ficam salvas apenas neste aparelho (para você continuar de onde parou) e são
        apagadas automaticamente após 7 dias. Nada é enviado sem o seu comando.
      </p>
    </div>
  );
}
