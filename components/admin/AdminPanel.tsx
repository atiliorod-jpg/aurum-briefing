"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ItemEditavel } from "@/lib/admin-catalog";

interface Props {
  catalogo: ItemEditavel[];
  overridesIniciais: Record<string, number>;
  supabaseOk: boolean;
}

// Representação em texto do valor inicial de um item (vazio = usando o padrão).
const inicialDe = (id: string, ov: Record<string, number>): string =>
  ov[id] != null ? String(ov[id]) : "";

export default function AdminPanel({ catalogo, overridesIniciais, supabaseOk }: Props) {
  const router = useRouter();

  const inicial = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of catalogo) m[c.id] = inicialDe(c.id, overridesIniciais);
    return m;
  }, [catalogo, overridesIniciais]);

  const [valores, setValores] = useState<Record<string, string>>(inicial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; texto: string } | null>(null);

  const grupos = useMemo(() => {
    const g = new Map<string, ItemEditavel[]>();
    for (const c of catalogo) {
      if (!g.has(c.categoria)) g.set(c.categoria, []);
      g.get(c.categoria)!.push(c);
    }
    return Array.from(g.entries());
  }, [catalogo]);

  const alterados = useMemo(
    () => catalogo.filter((c) => (valores[c.id] ?? "") !== (inicial[c.id] ?? "")),
    [catalogo, valores, inicial],
  );

  const setVal = (id: string, v: string) => setValores((s) => ({ ...s, [id]: v }));

  const salvar = async () => {
    setMsg(null);
    // Monta updates só dos alterados; vazio → remove override (volta ao padrão)
    const updates: Array<{ id: string; preco: number | null }> = [];
    for (const c of alterados) {
      const raw = (valores[c.id] ?? "").trim().replace(",", ".");
      if (raw === "") { updates.push({ id: c.id, preco: null }); continue; }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        setMsg({ kind: "err", texto: `Valor inválido em "${c.rotulo}".` });
        return;
      }
      updates.push({ id: c.id, preco: n });
    }
    if (updates.length === 0) { setMsg({ kind: "ok", texto: "Nada para salvar." }); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/precos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.ok) {
        setMsg({ kind: "ok", texto: `Salvo! ${data.salvos} alterado(s), ${data.removidos} voltou(aram) ao padrão.` });
        router.refresh();
      } else {
        setMsg({ kind: "err", texto: data.erro || "Não foi possível salvar." });
      }
    } catch {
      setMsg({ kind: "err", texto: "Falha de conexão ao salvar." });
    } finally {
      setBusy(false);
    }
  };

  const sair = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6] pb-28">
      <header className="bg-[#1B2A41] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-[#C9A24B] text-xs font-bold tracking-widest">PAINEL AURUM</p>
          <h1 className="text-lg font-bold">Preços e parâmetros</h1>
        </div>
        <button onClick={sair} className="text-sm underline text-gray-200">Sair</button>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-5">
        {!supabaseOk && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-4">
            ⚠️ O Supabase não está configurado no servidor (faltam as variáveis na Vercel ou o
            <code> SUPABASE_SERVICE_ROLE_KEY</code>). Você consegue ver os padrões, mas salvar não vai funcionar até configurar.
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Deixe um campo <strong>em branco</strong> para usar o preço padrão do sistema. Digite um
          valor para sobrescrever. As mudanças valem para os próximos orçamentos.
        </p>

        {grupos.map(([categoria, itens]) => (
          <section key={categoria} className="mb-6">
            <h2 className="text-xs font-bold text-[#9A7B2E] uppercase tracking-wider mb-2">{categoria}</h2>
            <div className="bg-white rounded-xl divide-y divide-gray-100">
              {itens.map((c) => {
                const editado = (valores[c.id] ?? "") !== (inicial[c.id] ?? "");
                return (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                    <label htmlFor={`it-${c.id}`} className="flex-1 text-sm text-[#1B2A41] leading-snug">
                      {c.rotulo}
                      <span className="block text-xs text-gray-400">padrão: {c.padrao}{c.sufixo || ""}</span>
                    </label>
                    <input
                      id={`it-${c.id}`}
                      type="text"
                      inputMode="decimal"
                      value={valores[c.id] ?? ""}
                      placeholder={String(c.padrao)}
                      onChange={(e) => setVal(c.id, e.target.value)}
                      className={`w-24 text-right border-2 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none ${
                        editado ? "border-[#C9A24B] text-[#1B2A41] font-semibold" : "border-gray-200 text-[#1B2A41]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Barra fixa de salvar */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-5 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {msg && (
            <span className={`text-xs flex-1 ${msg.kind === "ok" ? "text-green-700" : "text-red-600"}`}>{msg.texto}</span>
          )}
          {!msg && <span className="text-xs text-gray-500 flex-1">{alterados.length} alteração(ões) não salva(s)</span>}
          <button
            onClick={salvar}
            disabled={busy || alterados.length === 0}
            className="bg-[#1B2A41] text-white px-6 py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {busy ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
