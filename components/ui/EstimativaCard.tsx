"use client";
import { FormState } from "@/lib/types";
import { estimar, formatBRL, precoDe, pessoasDoTacho } from "@/lib/orcamento";

export default function EstimativaCard({ state, colapsavel = false }: { state: FormState; colapsavel?: boolean }) {
  const e = estimar(state);
  if (e.foodTotal <= 0 && e.custoOperacional <= 0 && e.custoLogistica <= 0 && e.custoBebidas <= 0) return null;
  if (e.pessoas <= 0) return null;

  const cardapioTotal = e.porPessoa * e.pessoasFaturaveis;
  const ajuste = Math.round(e.foodTotal * e.multiplicador) - e.foodTotal;

  const tachoLinhas = state.tacho.length === 2
    ? state.tacho.map((v) => {
        const preco = precoDe(v) ?? 0;
        const n = pessoasDoTacho(state, v);
        return { nome: v, preco, pessoas: n, subtotal: preco * n };
      }).filter((l) => l.subtotal > 0)
    : [];

  // Nomes dos itens agrupados por categoria
  const EXCL = new Set(["Sem entradas", "Sugestão do chef", "Sem sobremesa", "Sem tacho",
    "Sem entradas buffet", "Sugestão do chef buffet", "Sem sobremesa buffet"]);
  const nomesFiltrados = (lista: string[]) => lista.filter((v) => !EXCL.has(v));

  // Itens de cardápio selecionados (para exibir abaixo da linha de preço)
  const itensCardapio = e.itens.filter((i) => i.nome !== "Louças e talheres (básico)");

  const linhas = (
    <>
      {/* Entradas distribuídas (multi-entrada empratado) */}
      {e.entradasSubtotal > 0 && (() => {
        const EXCL_E = new Set(["Sem entradas", "Sugestão do chef"]);
        const entradasReais = state.entradas.filter((v) => !EXCL_E.has(v));
        return (
          <>
            {entradasReais.map((v) => {
              const p = precoDe(v) ?? 0;
              const n = Number(state.entradasPessoas?.[v]) || 0;
              if (!p || !n) return null;
              return (
                <p key={v} className="text-sm text-[#1B2A41] leading-relaxed">
                  <strong>Entrada ({v.length > 28 ? v.slice(0, 28) + "…" : v}):</strong>{" "}
                  {formatBRL(p)} × {n} = <strong>{formatBRL(p * n)}</strong>
                </p>
              );
            })}
          </>
        );
      })()}

      {/* Cardápio geral (por pessoa) */}
      {cardapioTotal > 0 && (
        <>
          <p className="text-sm text-[#1B2A41] leading-relaxed">
            <strong>Cardápio:</strong> {formatBRL(e.porPessoa)} × {e.pessoasFaturaveis} ={" "}
            <strong>{formatBRL(cardapioTotal)}</strong>
          </p>
          {itensCardapio.length > 0 && (
            <p className="text-xs text-gray-500 leading-relaxed -mt-0.5">
              ↳ {itensCardapio.map((i) => i.nome).join(" • ")}
            </p>
          )}
        </>
      )}

      {/* Faturamento mínimo (grupos pequenos) */}
      {e.aplicouMinimo && (
        <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
          Grupo de <strong>{e.pessoas}</strong> convidados: o cardápio é calculado pelo
          mínimo de <strong>{e.pessoasFaturaveis} pessoas</strong> (custos fixos da
          operação). O valor por convidado fica mais alto em eventos menores.
        </p>
      )}

      {tachoLinhas.map((l) => (
        <p key={l.nome} className="text-sm text-[#1B2A41] leading-relaxed">
          <strong>Tacho ({l.nome.length > 20 ? l.nome.slice(0, 20) + "…" : l.nome}):</strong>{" "}
          {formatBRL(l.preco)} × {l.pessoas} = <strong>{formatBRL(l.subtotal)}</strong>
        </p>
      ))}

      {/* Subtotal antes do multiplicador */}
      {e.foodTotal > 0 && e.multiplicador !== 1 && (
        <p className="text-sm text-[#1B2A41] mt-1">
          <strong>Subtotal cardápio:</strong> {formatBRL(e.foodTotal)}
        </p>
      )}

      {/* Desconto para grupos grandes */}
      {e.multiplicador < 1 && e.foodTotal > 0 && (
        <p className="text-sm leading-relaxed text-green-700">
          <strong>Desconto grupo grande:</strong> −{formatBRL(Math.abs(ajuste))}
        </p>
      )}

      {/* Bebidas (separado do cardápio) */}
      {e.custoBebidas > 0 && (
        <>
          <p className="text-sm text-[#1B2A41] leading-relaxed">
            <strong>Bebidas:</strong> {formatBRL(e.custoBebidas / e.pessoasFaturaveis)}/pessoa × {e.pessoasFaturaveis} ={" "}
            <strong>{formatBRL(e.custoBebidas)}</strong>
          </p>
          {e.itensBebidas.length > 0 && (
            <p className="text-xs text-gray-500 leading-relaxed -mt-0.5">
              ↳ {e.itensBebidas.map((i) => i.nome).join(" • ")}
            </p>
          )}
        </>
      )}

      {/* Apoio de produção */}
      {e.custoOperacional > 0 && (
        <p className="text-sm text-[#1B2A41] leading-relaxed">
          <strong>Apoio de produção:</strong> {formatBRL(e.custoOperacional)}
        </p>
      )}

      {/* Logística */}
      {e.custoLogistica > 0 && state.distanciaKm != null && (
        <p className="text-sm text-[#1B2A41] leading-relaxed">
          <strong>Logística:</strong> {formatBRL(e.custoLogistica)}
        </p>
      )}

      {/* Louças */}
      {e.incluiLoucas && (
        <p className="text-xs text-gray-500 leading-relaxed">
          Inclui <strong>louças e talheres</strong> (a partir de R$ 10/pessoa).
        </p>
      )}

      <p className="text-base text-[#1B2A41] mt-2 pt-2 border-t border-[#C9A24B]/30">
        <strong>Total estimado:</strong>{" "}
        <strong className="text-lg">{formatBRL(e.total)}</strong>
      </p>

      {e.temItemSemPreco && (
        <p className="text-xs text-gray-500 mt-1.5">
          Há itens sem valor cadastrado — o total pode aumentar.
        </p>
      )}
      <p className="text-[11px] text-gray-400 mt-1 italic">
        Valor de referência. Não é a proposta final — a Aurum confirma o orçamento.
      </p>
    </>
  );

  if (colapsavel) {
    return (
      <details className="bg-[#FBF7EE] border border-[#C9A24B]/50 rounded-xl text-left group">
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#9A7B2E] uppercase tracking-wider">Estimativa parcial</span>
          <span className="text-sm font-bold text-[#1B2A41] flex items-center gap-1.5">
            {formatBRL(e.total)}
            <span className="text-[10px] font-semibold text-[#9A7B2E] group-open:hidden">ver ▸</span>
            <span className="text-[10px] font-semibold text-[#9A7B2E] hidden group-open:inline">fechar ▾</span>
          </span>
        </summary>
        <div className="px-4 pb-4">{linhas}</div>
      </details>
    );
  }

  return (
    <div className="bg-[#FBF7EE] border border-[#C9A24B]/50 rounded-xl p-4 text-left">
      <p className="text-xs font-bold text-[#9A7B2E] uppercase tracking-wider mb-2">Estimativa parcial</p>
      {linhas}
    </div>
  );
}
