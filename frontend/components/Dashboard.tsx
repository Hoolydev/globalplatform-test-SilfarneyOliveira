"use client";
import type { Report, Anomaly } from "@/lib/types";

const money = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = (v: number) => v.toLocaleString("pt-BR");
const pct = (v: number) => `${v.toFixed(2)}%`;

interface Props {
  report: Report | null;
  onGoImport: () => void;
}

export default function Dashboard({ report, onGoImport }: Props) {
  const gm = report?.global_metrics;
  const anomalies = report?.anomalies ?? [];
  const critical = anomalies.filter((a) => a.severity === "critica").length;
  const high = anomalies.filter((a) => a.severity === "alta").length;

  return (
    <div>
      {/* Hero */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
            Agente Analista de Campanhas
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink2)", fontSize: 14, lineHeight: 1.5 }}>
            Análise de Meta Ads via IA — resultados enviados direto no WhatsApp
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {report && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(34,197,94,.08)",
                border: "1px solid rgba(34,197,94,.2)",
                borderRadius: 999,
                padding: "7px 14px",
                fontSize: 13,
                color: "#86efac",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 8px rgba(34,197,94,.5)",
                  display: "inline-block",
                }}
              />
              Diagnóstico gerado
            </div>
          )}
          <button className="btn-primary" onClick={onGoImport}>
            ⚡ Analisar campanhas
          </button>
        </div>
      </div>

      {!report && (
        <div
          style={{
            background: "rgba(56,189,248,.08)",
            border: "1px solid rgba(56,189,248,.2)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
            color: "#7dd3fc",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          📂 Nenhuma campanha analisada ainda. Clique em{" "}
          <strong>Importar campanhas</strong> para enviar um CSV e gerar o diagnóstico. O relatório
          também chegará no WhatsApp configurado.
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Investimento",
            value: gm ? money(gm.spend) : "–",
            sub: "gasto total Meta Ads",
          },
          {
            label: "Campanhas",
            value: gm ? num(gm.campaigns_count ?? report!.campaigns.length) : "–",
            sub: "analisadas",
          },
          {
            label: "Anomalias",
            value: anomalies.length > 0 ? num(anomalies.length) : "–",
            sub: critical > 0 ? `${critical} críticas · ${high} altas` : "sem anomalias",
            subColor: critical > 0 ? "#f87171" : "#86efac",
          },
          {
            label: "ROAS médio",
            value: gm ? (gm.roas > 0 ? gm.roas.toFixed(2) : "–") : "–",
            sub: "receita ÷ gasto",
          },
          {
            label: "Conversas",
            value: gm ? num(gm.conversations) : "–",
            sub: "mensagens iniciadas",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="card-glow"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "18px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--ink2)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                margin: "10px 0 4px",
                letterSpacing: "-0.5px",
              }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: 12, color: card.subColor ?? "var(--ink3)" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {report && (
        <>
          {/* AI Diagnosis + Recommendations */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Diagnosis */}
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Diagnóstico IA</h2>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background:
                      report.llm_status === "used"
                        ? "rgba(34,197,94,.15)"
                        : "rgba(245,158,11,.12)",
                    color: report.llm_status === "used" ? "#86efac" : "#fcd34d",
                    border: `1px solid ${report.llm_status === "used" ? "rgba(34,197,94,.3)" : "rgba(245,158,11,.25)"}`,
                    fontWeight: 700,
                  }}
                >
                  {report.llm_status === "used"
                    ? "✓ GPT ativo"
                    : report.llm_status === "failed_fallback_used"
                    ? "⚠ fallback"
                    : "🔧 determinístico"}
                </span>
              </div>
              <ul style={{ padding: "0 0 0 18px", margin: 0, lineHeight: 1.8, color: "var(--ink2)", fontSize: 14 }}>
                {report.executive_summary.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {report.diagnosis && (
                <p
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    background: "var(--panel2)",
                    border: "1px solid var(--border2)",
                    borderRadius: 8,
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "var(--ink)",
                  }}
                >
                  {report.diagnosis}
                </p>
              )}
            </div>

            {/* Recommendations */}
            <div
              style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 22,
              }}
            >
              <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>
                Recomendações priorizadas
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {report.recommendations.slice(0, 5).map((rec, i) => (
                  <div
                    key={i}
                    style={{
                      background: "var(--panel2)",
                      border: "1px solid var(--border2)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span
                        className={
                          rec.priority === "critica"
                            ? "sev-critica"
                            : rec.priority === "alta"
                            ? "sev-alta"
                            : rec.priority === "media"
                            ? "sev-media"
                            : "sev-baixa"
                        }
                      >
                        {rec.priority}
                      </span>
                      <strong style={{ fontSize: 13 }}>{rec.action}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--ink2)", lineHeight: 1.5 }}>
                      {rec.reason}
                    </p>
                  </div>
                ))}
                {report.recommendations.length === 0 && (
                  <div style={{ color: "var(--ink3)", fontSize: 14 }}>
                    Nenhuma recomendação gerada.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Anomalies Table */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 22,
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>
              Anomalias detectadas ({anomalies.length})
            </h2>
            {anomalies.length === 0 ? (
              <div
                style={{
                  color: "#86efac",
                  fontSize: 14,
                  padding: "12px 16px",
                  background: "rgba(34,197,94,.06)",
                  border: "1px solid rgba(34,197,94,.15)",
                  borderRadius: 8,
                }}
              >
                ✓ Nenhuma anomalia detectada. Campanhas dentro dos parâmetros normais.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {["Sev.", "Campanha", "Métrica", "Diagnóstico", "Ação recomendada"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "8px 12px",
                              borderBottom: "1px solid var(--border)",
                              color: "var(--ink2)",
                              fontWeight: 600,
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((a: Anomaly, i) => (
                      <tr key={i}>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                          <span className={`sev-${a.severity}`}>{a.severity}</span>
                        </td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                          <div style={{ fontWeight: 600 }}>{a.campaign_id}</div>
                          <div style={{ fontSize: 12, color: "var(--ink2)" }}>{a.campaign_name}</div>
                        </td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                          <code
                            style={{
                              fontSize: 11,
                              background: "rgba(56,189,248,.1)",
                              color: "#7dd3fc",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {a.metric}
                          </code>
                        </td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)", fontSize: 13, maxWidth: 220 }}>
                          {a.diagnosis}
                        </td>
                        <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)", fontSize: 13, color: "var(--ink2)", maxWidth: 220 }}>
                          {a.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Campaigns table */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 22,
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700 }}>
              KPIs por campanha
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {[
                      "Campanha",
                      "Objetivo",
                      "Gasto",
                      "ROAS",
                      "Compras",
                      "Leads",
                      "Conversas",
                      "CTR",
                      "Freq.",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--ink2)",
                          fontWeight: 600,
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.campaigns.map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{c.campaign_id}</div>
                        <div style={{ fontSize: 11, color: "var(--ink2)" }}>{c.campaign_name}</div>
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)", fontSize: 12, color: "var(--ink2)" }}>
                        {c.objective}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)", fontWeight: 600 }}>
                        {money(c.spend)}
                      </td>
                      <td
                        style={{
                          padding: "11px 12px",
                          borderBottom: "1px solid var(--border2)",
                          color:
                            c.roas >= 3
                              ? "#86efac"
                              : c.roas >= 1.5
                              ? "#fcd34d"
                              : c.roas > 0
                              ? "#f87171"
                              : "var(--ink3)",
                          fontWeight: 700,
                        }}
                      >
                        {c.roas > 0 ? c.roas.toFixed(2) : "–"}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                        {num(c.purchases)}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                        {num(c.leads)}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                        {num(c.conversations)}
                      </td>
                      <td style={{ padding: "11px 12px", borderBottom: "1px solid var(--border2)" }}>
                        {c.ctr > 0 ? pct(c.ctr) : "–"}
                      </td>
                      <td
                        style={{
                          padding: "11px 12px",
                          borderBottom: "1px solid var(--border2)",
                          color:
                            c.frequency > 4
                              ? "#f87171"
                              : c.frequency > 2.5
                              ? "#fcd34d"
                              : c.frequency > 0
                              ? "#86efac"
                              : "var(--ink3)",
                        }}
                      >
                        {c.frequency > 0 ? c.frequency.toFixed(1) : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
