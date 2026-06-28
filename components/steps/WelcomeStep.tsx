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
        Vamos montar a sua proposta. No final, você gera o resumo e envia para a gente
        pelo WhatsApp — e ainda leva uma <strong className="text-[#1B2A41]">carta-convite pronta</strong>.
      </p>

      <p className="text-[11px] text-gray-400 leading-relaxed px-4">
        🔒 Suas respostas ficam só neste aparelho e são apagadas após 7 dias. Nada é enviado sem o seu comando.
      </p>
    </div>
  );
}
