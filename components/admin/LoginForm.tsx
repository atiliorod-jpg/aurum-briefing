"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ configurado }: { configurado: boolean }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const data = await res.json();
      if (data.ok) { router.refresh(); }
      else { setErro(data.erro || "Não foi possível entrar."); }
    } catch {
      setErro("Falha de conexão.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F3EFE6] flex items-center justify-center px-5">
      <form onSubmit={entrar} className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm">
        <div className="inline-block bg-[#C9A24B] text-[#1B2A41] text-xs font-bold tracking-widest px-3 py-1 rounded mb-3">PAINEL AURUM</div>
        <h1 className="text-xl font-bold text-[#1B2A41] mb-1">Acesso restrito</h1>
        <p className="text-gray-500 text-sm mb-5">Digite a senha para editar os preços.</p>

        {!configurado && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3 mb-4">
            ⚠️ <strong>ADMIN_PASSWORD</strong> ainda não foi definida no servidor (Vercel). O login não vai funcionar até configurá-la.
          </div>
        )}

        <label htmlFor="senha" className="block text-sm font-semibold text-[#1B2A41] mb-1.5">Senha</label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-[#1B2A41] bg-white focus:outline-none focus:border-[#C9A24B]"
        />

        {erro && <p className="text-sm text-red-500 mt-2">{erro}</p>}

        <button
          type="submit"
          disabled={busy || senha.length === 0}
          className="w-full mt-4 bg-[#1B2A41] text-white py-3.5 rounded-xl font-semibold text-base active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
