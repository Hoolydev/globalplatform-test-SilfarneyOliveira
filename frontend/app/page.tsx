"use client";
import { useState, useCallback, useRef } from "react";
import Dashboard from "@/components/Dashboard";
import ImportCSV from "@/components/ImportCSV";
import Configuracoes from "@/components/Configuracoes";
import type { Report } from "@/lib/types";

type View = "dashboard" | "import" | "config";

export default function HomePage() {
  const [view, setView] = useState<View>("dashboard");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReport = useCallback((r: Report) => {
    setReport(r);
    setView("dashboard");
  }, []);

  const navItems: { id: View; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "import", label: "Importar campanhas", icon: "📤" },
    { id: "config", label: "Configurações", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* ── SIDEBAR ── */}
      <aside
        className="flex flex-col sticky top-0 h-screen"
        style={{
          width: 240,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--border2)",
          padding: "20px 12px",
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #0A3161 0%, #1a3a8f 50%, #b31942 100%)",
              display: "grid",
              placeItems: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🎯
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>
              Global Platform
            </div>
            <div style={{ fontSize: 11, color: "var(--ink3)" }}>Meta Ads Analyst</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--ink3)",
              padding: "8px 12px 4px",
            }}
          >
            Menu
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: view === item.id ? "1px solid rgba(179,25,66,.3)" : "1px solid transparent",
                background:
                  view === item.id
                    ? "linear-gradient(135deg, rgba(179,25,66,.18), rgba(179,25,66,.06))"
                    : "transparent",
                color: view === item.id ? "var(--ink)" : "var(--ink2)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                textAlign: "left",
                transition: "all .15s",
                width: "100%",
              }}
            >
              <span style={{ width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* WhatsApp QA info */}
          <div
            style={{
              margin: "16px 4px 0",
              padding: "12px",
              background: "rgba(34,197,94,.06)",
              border: "1px solid rgba(34,197,94,.15)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--ink2)",
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: "#86efac", fontWeight: 700, marginBottom: 4 }}>
              🤖 Chat IA ativo
            </div>
            Envie sua dúvida sobre campanhas diretamente pelo WhatsApp para o número configurado. O agente especialista responde automaticamente.
          </div>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid var(--border2)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0A3161, #b31942)",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Admin</div>
              <div style={{ fontSize: 11, color: "var(--ink3)" }}>Campaign Ops</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 min-w-0 overflow-hidden" style={{ padding: "28px 32px 56px" }}>
        {view === "dashboard" && (
          <Dashboard report={report} onGoImport={() => setView("import")} />
        )}
        {view === "import" && (
          <ImportCSV onReport={handleReport} loading={loading} setLoading={setLoading} />
        )}
        {view === "config" && <Configuracoes />}
      </main>
    </div>
  );
}
