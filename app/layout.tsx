import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// URL base para gerar links absolutos (preview no WhatsApp).
// Na Vercel usa a URL do deploy automaticamente; com domínio próprio, defina NEXT_PUBLIC_SITE_URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Briefing do Evento — Aurum Serviços Gastronômicos",
  description: "Monte o briefing do seu evento em poucos minutos e receba uma proposta gastronômica personalizada da Aurum.",
  openGraph: {
    title: "Briefing do Evento — Aurum Serviços Gastronômicos",
    description: "Monte o briefing do seu evento em poucos minutos e receba uma proposta gastronômica personalizada da Aurum.",
    siteName: "Aurum Serviços Gastronômicos",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Briefing do Evento — Aurum Serviços Gastronômicos",
    description: "Monte o briefing do seu evento e receba uma proposta personalizada da Aurum.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1B2A41",
  // zoom liberado (acessibilidade) — sem maximumScale/userScalable
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
