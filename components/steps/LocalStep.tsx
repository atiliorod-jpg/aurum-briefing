"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

export default function LocalStep({ state, onChange }: Props) {
  const cep = state.cep;
  const [buscando, setBuscando] = useState(false);
  const [erroCep, setErroCep] = useState(false);

  const formatCep = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const buscarCep = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      setBuscando(true);
      setErroCep(false);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { setErroCep(true); return; }
      // Monta o endereço com o que veio do CEP, deixando número/apto para o cliente
      const partes = [data.logradouro, data.bairro, `${data.localidade}/${data.uf}`].filter(Boolean);
      const base = partes.join(", ");
      onChange({ endereco: base ? `${base} — nº e complemento: ` : state.endereco });
    } catch {
      setErroCep(true);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div>
      <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">LOCAL</div>
      <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Onde acontece?</h1>
      <p className="text-gray-500 text-sm mb-5">Digite o CEP para preencher o endereço automaticamente.</p>

      <div className="mb-4">
        <label htmlFor="ev-cep" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
          CEP <span className="font-normal text-gray-400">(preenche o resto sozinho)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="ev-cep"
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            value={cep}
            onChange={e => { const f = formatCep(e.target.value); onChange({ cep: f }); if (f.replace(/\D/g, "").length === 8) buscarCep(f); }}
            onBlur={() => buscarCep(cep)}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
          />
          {buscando && <span className="self-center text-sm text-gray-400">buscando…</span>}
        </div>
        {erroCep && <p className="text-xs text-red-500 mt-1">CEP não encontrado — preencha o endereço manualmente abaixo.</p>}
      </div>

      <label htmlFor="ev-endereco" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
        Endereço <span className="text-[#9A7B2E]">• obrigatório</span>
      </label>
      <textarea
        id="ev-endereco"
        rows={3}
        placeholder="Rua, número, apto/bloco, bairro, cidade."
        value={state.endereco}
        onChange={e => onChange({ endereco: e.target.value })}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B] resize-none"
      />
      <p className="text-xs text-gray-400 mt-1.5">Confira e complete com o <strong>número</strong> e o <strong>apto/bloco</strong>.</p>
    </div>
  );
}
