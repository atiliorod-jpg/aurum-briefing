"use client";
import { useState } from "react";
import { FormState } from "@/lib/types";
import { AURUM_LAT, AURUM_LNG } from "@/lib/config";

interface Props { state: FormState; onChange: (patch: Partial<FormState>) => void; }

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchCoordenadas(cep: string, cidade?: string, uf?: string): Promise<{ lat: number; lng: number } | null> {
  const HEADERS = { "User-Agent": "AurumBriefingForm/1.0 aurumbuffet.eventos@gmail.com" };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${cep}&country=Brazil&format=json&limit=1`,
      { headers: HEADERS },
    );
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };

    // Fallback: busca pela cidade — mais confiável que CEP no Nominatim
    if (cidade && uf) {
      const q = encodeURIComponent(`${cidade}, ${uf}, Brasil`);
      const res2 = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: HEADERS },
      );
      const data2 = await res2.json();
      if (data2[0]) return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

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

      // 1. ViaCEP primeiro (para endereço + cidade como fallback do Nominatim)
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${digits}/json/`).then((r) => r.json());
      let cidade: string | undefined;
      let uf: string | undefined;

      if (viaCepRes.erro) {
        setErroCep(true);
      } else {
        cidade = viaCepRes.localidade;
        uf = viaCepRes.uf;
        const partes = [viaCepRes.logradouro, viaCepRes.bairro, `${viaCepRes.localidade}/${viaCepRes.uf}`].filter(Boolean);
        const base = partes.join(", ");
        onChange({ endereco: base ? `${base}, ` : state.endereco });
      }

      // 2. Coordenadas: tenta CEP, se não achar usa a cidade (muito mais confiável)
      const coords = await fetchCoordenadas(digits, cidade, uf);
      if (coords) {
        const dist = haversineKm(AURUM_LAT, AURUM_LNG, coords.lat, coords.lng);
        onChange({ distanciaKm: Math.round(dist * 10) / 10 });
      }
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
      <p className="text-gray-500 text-sm mb-5">
        Digite o CEP para preencher o endereço automaticamente. Ele também define o
        <strong> custo de deslocamento</strong> da equipe até o local.
      </p>

      <div className="mb-4">
        <label htmlFor="ev-cep" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">
          CEP <span className="text-[#9A7B2E]">• obrigatório</span>
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

        <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.cepDesconhecido}
            onChange={e => onChange({ cepDesconhecido: e.target.checked })}
            className="w-4 h-4 accent-[#C9A24B]"
          />
          <span className="text-xs text-gray-600">
            Não sei o CEP — vou preencher só o endereço
            <span className="block text-gray-400">O custo de deslocamento será confirmado pela Aurum.</span>
          </span>
        </label>
        {state.distanciaKm != null && state.distanciaKm >= 5 && (
          <p className="text-xs text-[#9A7B2E] mt-1">
            Local a ~{state.distanciaKm} km da base da Aurum — isso entra na estimativa como
            custo de deslocamento da equipe.
          </p>
        )}
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
