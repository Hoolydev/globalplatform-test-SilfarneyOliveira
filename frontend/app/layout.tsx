import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Platform — Agente Analista de Campanhas",
  description:
    "Plataforma de análise inteligente de campanhas Facebook/Meta Ads com IA, detecção de anomalias e alertas automáticos via WhatsApp.",
  keywords: ["Facebook Ads", "Meta Ads", "análise de campanhas", "ROAS", "performance marketing"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen" style={{ background: "var(--app)", color: "var(--ink)" }}>
        {children}
      </body>
    </html>
  );
}
