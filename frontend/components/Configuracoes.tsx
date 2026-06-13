"use client";
import { useState, useEffect } from "react";
import { saveSettings } from "@/lib/api";

export default function Configuracoes() {
  const [waNumber, setWaNumber] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [severity, setSeverity] = useState("alta");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const savedWaNumber = localStorage.getItem("gp_waNumber");
    const savedOpenaiKey = localStorage.getItem("gp_openaiKey");
    const savedSeverity = localStorage.getItem("gp_severity");
    const savedEnabled = localStorage.getItem("gp_enabled");

    if (savedWaNumber) setWaNumber(savedWaNumber);
    if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
    if (savedSeverity) setSeverity(savedSeverity);
    if (savedEnabled !== null) setEnabled(savedEnabled === "true");
  }, []);

  const handleSave = async () => {
    const clean = waNumber.replace(/\D/g, "");
    if (!clean || clean.length < 10) {
      setSaveStatus({ type: "error", msg: "Informe um número WhatsApp válido no formato internacional (ex: 5562999999999)." });
      return;
    }
    setSaving(true);
    setSaveStatus(null);
    try {
      await saveSettings({ whatsapp_number: clean, min_severity: severity, enabled, openai_api_key: openaiKey });
      
      localStorage.setItem("gp_waNumber", clean);
      localStorage.setItem("gp_openaiKey", openaiKey);
      localStorage.setItem("gp_severity", severity);
      localStorage.setItem("gp_enabled", String(enabled));

      setSaveStatus({ type: "success", msg: `✓ Configurações salvas! O número ${clean} receberá os diagnósticos quando houver anomalias de severidade "${severity}" ou maior.` });
    } catch (err: any) {
      setSaveStatus({ type: "error", msg: "Falha ao salvar: " + err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.3px" }}>
            Configurações
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink2)", fontSize: 14 }}>
            Configure o número WhatsApp que receberá os relatórios e o agente Q&A.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 16 }}>
        {/* WhatsApp & OpenAI Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 22,
            }}
          >
            <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700 }}>
              ⚙️ Configurações Gerais
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
              Configure os parâmetros do WhatsApp e da API da OpenAI para a análise e envio automático de relatórios.
            </p>

            {saveStatus && (
              <div
                style={{
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: 13,
                  lineHeight: 1.5,
                  background: saveStatus.type === "success" ? "rgba(34,197,94,.08)" : "rgba(179,25,66,.1)",
                  border: `1px solid ${saveStatus.type === "success" ? "rgba(34,197,94,.2)" : "rgba(179,25,66,.3)"}`,
                  color: saveStatus.type === "success" ? "#86efac" : "#fca5a5",
                }}
              >
                {saveStatus.msg}
              </div>
            )}

            {/* WhatsApp Integration Section */}
            <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 20, marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--ink1)" }}>
                📱 WhatsApp — Destino dos Relatórios
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label className="label-text" htmlFor="waNumber">
                  Número WhatsApp destino
                </label>
                <input
                  id="waNumber"
                  type="tel"
                  className="input-field"
                  placeholder="5562999999999"
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                />
                <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 6 }}>
                  Formato internacional sem espaços ou símbolos. Ex: 5562999999999 (55 = Brasil, 62 = Goiânia)
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label-text" htmlFor="severity">
                  Severidade mínima para alertas
                </label>
                <select
                  id="severity"
                  className="input-field"
                  style={{ maxWidth: 280 }}
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="critica">Apenas Crítica (mais silencioso)</option>
                  <option value="alta">Alta e Crítica (recomendado)</option>
                  <option value="media">Média, Alta e Crítica</option>
                  <option value="baixa">Todas as anomalias (mais verboso)</option>
                </select>
              </div>

              <div>
                <label className="label-text" htmlFor="enabled">
                  Notificações ativas
                </label>
                <select
                  id="enabled"
                  className="input-field"
                  style={{ maxWidth: 200 }}
                  value={String(enabled)}
                  onChange={(e) => setEnabled(e.target.value === "true")}
                >
                  <option value="true">✓ Ativado</option>
                  <option value="false">✗ Desativado</option>
                </select>
              </div>
            </div>

            {/* OpenAI API Key Section */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: "var(--ink1)" }}>
                🔑 OpenAI — Chave da API
              </h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
                Necessária para que a IA analise as campanhas e responda às suas perguntas no WhatsApp.
              </p>

              <div style={{ marginBottom: 6 }}>
                <label className="label-text" htmlFor="openaiKey">
                  Chave da API (sk-...)
                </label>
                <input
                  id="openaiKey"
                  type="password"
                  className="input-field"
                  placeholder="sk-proj-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
              </div>
              <div style={{ fontSize: 12, color: "var(--ink3)" }}>
                A chave será enviada e persistida com segurança em seu ambiente n8n.
              </div>
            </div>

            {/* Unified Save Button */}
            <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: "100%", justifyContent: "center" }}>
              {saving ? "⏳ Salvando..." : "💾 Salvar configurações"}
            </button>
          </div>
        </div>

        {/* Right column - Info + Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Uazapi status */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 22,
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>
              Status do sistema
            </h2>

            {[
              {
                icon: "✅",
                label: "Uazapi (WhatsApp)",
                status: "Conectada via n8n",
                color: "#86efac",
                bg: "rgba(34,197,94,.06)",
                border: "rgba(34,197,94,.15)",
              },
              {
                icon: "✅",
                label: "n8n Workflow",
                status: "Ativo em growthailabs.com.br",
                color: "#86efac",
                bg: "rgba(34,197,94,.06)",
                border: "rgba(34,197,94,.15)",
              },
              {
                icon: "✅",
                label: "Google Drive",
                status: "Monitorando pasta automaticamente",
                color: "#86efac",
                bg: "rgba(34,197,94,.06)",
                border: "rgba(34,197,94,.15)",
              },
              {
                icon: "🤖",
                label: "Agente Q&A WhatsApp",
                status: "Responde dúvidas sobre campanhas",
                color: "#7dd3fc",
                bg: "rgba(56,189,248,.06)",
                border: "rgba(56,189,248,.15)",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: item.color }}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Q&A agent info */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 22,
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
              🤖 Como usar o agente Q&A
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "O agente Q&A é ativado via WhatsApp",
                'Configure o número acima e analise um CSV',
                'Após receber o relatório, responda com sua pergunta',
                'O agente usa o contexto do último relatório para responder',
              ].map((step, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(179,25,66,.2)",
                      color: "#f87171",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "var(--ink2)", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "var(--panel2)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--ink3)",
              }}
            >
              <strong style={{ color: "var(--ink2)", display: "block", marginBottom: 6 }}>
                Exemplos de perguntas:
              </strong>
              {[
                "Por que o ROAS da campanha X caiu?",
                "Qual campanha devo pausar primeiro?",
                "Como melhorar meu CPL de leads?",
                "Quando devo escalar o orçamento?",
              ].map((q) => (
                <div key={q} style={{ marginBottom: 4 }}>
                  💬 {q}
                </div>
              ))}
            </div>
          </div>

          {/* n8n webhook URL info */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--ink2)" }}>
              Webhook do Agente Q&A (Uazapi)
            </h2>
            <p style={{ fontSize: 12, color: "var(--ink3)", margin: "0 0 10px", lineHeight: 1.5 }}>
              Configure este webhook no Uazapi como destino de mensagens recebidas:
            </p>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                background: "var(--panel2)",
                border: "1px solid var(--border2)",
                borderRadius: 6,
                padding: "8px 12px",
                color: "#7dd3fc",
                wordBreak: "break-all",
              }}
            >
              https://n8n.growthailabs.com.br/webhook/global-platform/whatsapp-qa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
