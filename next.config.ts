import type { NextConfig } from "next";

// Cabeçalhos de segurança aplicados a todas as respostas. Protegem contra
// clickjacking, sniffing de MIME, vazamento de referrer e forçam HTTPS.
// A Content-Security-Policy completa (com nonce) entra junto da camada de
// admin/middleware, onde é possível testá-la sem quebrar a hidratação.
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
