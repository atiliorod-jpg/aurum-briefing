import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const maxDuration = 30;

interface SendPayload {
  to: string;          // e-mail Aurum (destino principal)
  cc?: string;         // e-mail do cliente em cópia
  clientName: string;
  subject: string;
  bodyText: string;    // resumo em texto
  pdfBase64?: string;  // PDF anexo (sem o prefixo data:)
  pdfFileName?: string;
  docxBase64?: string; // carta Word anexo (opcional)
  docxFileName?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || "Aurum Briefing <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json(
      { error: "EMAIL_NOT_CONFIGURED", message: "Configure RESEND_API_KEY nas variáveis de ambiente." },
      { status: 503 },
    );
  }

  let payload: SendPayload;
  try {
    payload = (await req.json()) as SendPayload;
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }

  const { to, cc, clientName, subject, bodyText, pdfBase64, pdfFileName, docxBase64, docxFileName } = payload;
  if (!to || !subject || !bodyText) {
    return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
  }

  const attachments: Array<{ filename: string; content: string }> = [];
  if (pdfBase64 && pdfFileName) attachments.push({ filename: pdfFileName, content: pdfBase64 });
  if (docxBase64 && docxFileName) attachments.push({ filename: docxFileName, content: docxBase64 });

  // HTML simples baseado no texto, com identidade Aurum
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#F3EFE6;padding:32px 16px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(27,42,65,.1);">
        <div style="background:#1B2A41;color:#fff;text-align:center;padding:24px;">
          <div style="font-size:24px;font-weight:700;letter-spacing:6px;">AURUM</div>
          <div style="font-size:11px;color:#C9A24B;letter-spacing:2px;font-style:italic;margin-top:4px;">SERVIÇOS GASTRONÔMICOS</div>
        </div>
        <div style="padding:28px 28px 32px;color:#1B2A41;">
          <h2 style="margin:0 0 6px;font-size:18px;color:#1B2A41;">Novo briefing recebido</h2>
          <p style="margin:0 0 18px;color:#6b7280;font-size:14px;">Cliente: <strong>${clientName}</strong></p>
          <pre style="white-space:pre-wrap;font-family:'Courier New',monospace;font-size:13px;color:#1B2A41;background:#FBF7EE;border-left:3px solid #C9A24B;padding:14px 16px;border-radius:6px;line-height:1.55;">${bodyText.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre>
          <p style="color:#6b7280;font-size:12px;margin-top:20px;font-style:italic;">PDF do briefing e carta convite seguem em anexo.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [to],
      cc: cc ? [cc] : undefined,
      replyTo: cc || undefined,
      subject,
      text: bodyText,
      html,
      attachments,
    });

    if (result.error) {
      return NextResponse.json({ error: "RESEND_ERROR", details: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "SEND_FAILED", message }, { status: 500 });
  }
}
