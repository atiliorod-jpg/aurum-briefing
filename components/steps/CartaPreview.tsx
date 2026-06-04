"use client";
import { FormState } from "@/lib/types";
import { resolveInvitation } from "@/lib/invitation";

// Realça os campos ainda em branco ([ ... ]) em dourado
function Texto({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[[^\]]+\]$/.test(p)
          ? <span key={i} className="text-[#C9A24B] font-semibold not-italic">{p}</span>
          : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default function CartaPreview({ state }: { state: FormState }) {
  const c = resolveInvitation(state);
  const navy = "#1B2A41";

  return (
    <div
      className="rounded-lg p-5 text-center"
      style={{
        background: "#FBF8F0",
        border: "3px double #1B2A41",
        boxShadow: "0 4px 14px rgba(27,42,65,0.12)",
        fontFamily: "Cardo, Georgia, serif",
        color: navy,
      }}
    >
      <div style={{ fontFamily: "Cardo, serif", fontWeight: 700, color: "#B8923C", fontSize: 20, letterSpacing: 1 }}>
        Convite Especial
      </div>
      <div style={{ color: "#B8923C", fontSize: 11, margin: "2px 0 8px" }}>◆</div>

      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 26, color: navy, lineHeight: 1.1, marginBottom: 8 }}>
        Queridos convidados,
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "0 0 10px" }}>
        Com grande alegria, convidamos vocês para celebrar conosco{" "}
        <em><Texto>{`${c.tipoFrase}${c.conector}${c.nome}`}</Texto></em>. Será um encontro preparado com
        todo cuidado para reunir as pessoas que amamos e tornar esta data inesquecível.
      </p>

      <div style={{ fontSize: 13, lineHeight: 1.7, margin: "8px 0" }}>
        <div><strong style={{ color: "#B8923C", letterSpacing: 1 }}>DATA</strong> <Texto>{c.data}</Texto></div>
        <div><strong style={{ color: "#B8923C", letterSpacing: 1 }}>HORÁRIO</strong> a partir das <Texto>{c.horario}</Texto></div>
        <div><strong style={{ color: "#B8923C", letterSpacing: 1 }}>LOCAL</strong> <Texto>{c.local}</Texto></div>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "8px 0" }}>
        Para este momento, preparamos uma seleção cuidadosa — <em><Texto>{c.cardapio}</Texto></em> — assinada
        pela Aurum Serviços Gastronômicos, para oferecer uma experiência elegante e acolhedora.
      </p>

      <p style={{ fontSize: 13, lineHeight: 1.5, margin: "8px 0" }}>
        Pedimos, por gentileza, a confirmação de presença até <em><Texto>{c.dataLimite}</Texto></em>, pelo
        contato <Texto>{c.contato}</Texto>.
      </p>

      <div style={{ fontFamily: "'Great Vibes', cursive", fontSize: 20, color: navy, marginTop: 6 }}>
        Com carinho,
      </div>
      <div style={{ fontFamily: "Cardo, serif", fontWeight: 700, fontSize: 15, marginTop: 2 }}>
        <Texto>{c.assinatura}</Texto>
      </div>
    </div>
  );
}
