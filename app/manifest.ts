import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aurum — Briefing de Evento",
    short_name: "Aurum Briefing",
    description: "Monte o briefing do seu evento e receba uma proposta personalizada da Aurum.",
    start_url: "/briefing",
    display: "standalone",
    background_color: "#F3EFE6",
    theme_color: "#1B2A41",
    icons: [
      { src: "/logo-aurum.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo-aurum.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
