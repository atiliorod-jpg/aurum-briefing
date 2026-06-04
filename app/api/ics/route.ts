import { NextRequest } from "next/server";

// Gera um arquivo .ics (iCalendar) a partir dos parâmetros da URL.
// Stateless: não guarda nada — só formata o evento. Ao abrir no celular,
// o iPhone/Android oferece adicionar ao calendário NATIVO do aparelho.
export const runtime = "edge";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const title = p.get("title") || "Evento";
  const start = (p.get("start") || "").replace(/[^0-9T]/g, "");
  const end = (p.get("end") || "").replace(/[^0-9T]/g, "");
  const loc = p.get("loc") || "";
  const desc = p.get("desc") || "";

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@aurum`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aurum Servicos Gastronomicos//Convite//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    start ? `DTSTART:${start}` : "",
    end ? `DTEND:${end}` : "",
    `SUMMARY:${esc(title)}`,
    loc ? `LOCATION:${esc(loc)}` : "",
    desc ? `DESCRIPTION:${esc(desc)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="evento-aurum.ics"',
      "Cache-Control": "no-store",
    },
  });
}
