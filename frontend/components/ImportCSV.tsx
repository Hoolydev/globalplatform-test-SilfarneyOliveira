"use client";
import { useState, useRef, useCallback } from "react";
import { analyzeCSV } from "@/lib/api";
import type { Report } from "@/lib/types";

interface Props {
  onReport: (r: Report) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

export default function ImportCSV({ onReport, loading, setLoading }: Props) {
  const [csvText, setCsvText] = useState("");
  const [status, setStatus] = useState<{ type: "info" | "success" | "error"; msg: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      setStatus({ type: "error", msg: "Por favor envie um arquivo .csv exportado do Meta Ads Manager." });
      return;
    }
    const text = await file.text();
    setCsvText(text);
    setStatus({ type: "success", msg: `✓ ${file.name} carregado (${file.size.toLocaleString()} bytes). Clique em Analisar para rodar o diagnóstico.` });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const analyze = async () => {
    if (!csvText.trim()) {
      setStatus({ type: "error", msg: "Nenhum CSV carregado. Arraste um arquivo ou clique para selecionar." });
      return;
    }
    setLoading(true);
    setStatus({ type: "info", msg: "⏳ Enviando para o n8n... o agente está analisando as campanhas." });
    try {
      const report = await analyzeCSV(csvText);
      setStatus({
        type: "success",
        msg: `✓ Diagnóstico gerado com sucesso! ${report.anomalies?.length ?? 0} anomalias encontradas. Relatório enviado também pelo WhatsApp se configurado.`,
      });
      onReport(report);
    } catch (err: any) {
      setStatus({ type: "error", msg: `Falha na análise: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.3px" }}>
            Importar campanhas
          </h1>
          <p style={{ margin: "6px 0 0", color: "var(--ink2)", fontSize: 14 }}>
            Envie o CSV exportado do Meta Ads Manager. O n8n analisa, detecta anomalias e envia o diagnóstico via WhatsApp.
          </p>
        </div>
      </div>

      {status && (
        <div
          style={{
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 14,
            lineHeight: 1.5,
            background:
              status.type === "success"
                ? "rgba(34,197,94,.08)"
                : status.type === "error"
                ? "rgba(179,25,66,.1)"
                : "rgba(56,189,248,.08)",
            border: `1px solid ${
              status.type === "success"
                ? "rgba(34,197,94,.2)"
                : status.type === "error"
                ? "rgba(179,25,66,.3)"
                : "rgba(56,189,248,.2)"
            }`,
            color:
              status.type === "success"
                ? "#86efac"
                : status.type === "error"
                ? "#fca5a5"
                : "#7dd3fc",
          }}
        >
          {status.msg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Drop zone */}
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 22,
          }}
        >
          <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Arquivo CSV</h2>

          {/* Drag & drop area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? "rgba(179,25,66,.6)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragging ? "rgba(179,25,66,.05)" : "var(--panel2)",
              transition: "all .15s",
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <div style={{ fontSize: 14, color: "var(--ink2)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--ink)" }}>Arraste o CSV aqui</strong>
              <br />
              ou clique para selecionar
            </div>
            <div style={{ fontSize: 12, color: "var(--ink3)", marginTop: 6 }}>
              Exportado do Meta Ads Manager
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <div style={{ marginBottom: 14 }}>
            <label className="label-text">Ou cole o CSV diretamente</label>
            <textarea
              className="input-field"
              style={{ height: 160, fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="campanha_id,campanha_nome,objetivo,gasto,compras,leads,conversas_iniciadas..."
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={analyze} disabled={loading}>
              {loading ? "⏳ Analisando..." : "🔍 Analisar campanhas"}
            </button>
            <button
              className="btn-ghost"
              disabled={loading}
              onClick={() => {
                setCsvText("");
                setStatus(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Flow description */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Como funciona</h2>
            {[
              { icon: "📤", text: "Você sobe o CSV do Meta Ads Manager" },
              { icon: "⚙️", text: "O n8n recebe, valida e detecta anomalias por objetivo" },
              { icon: "🤖", text: "A OpenAI gera diagnóstico executivo e recomendações" },
              { icon: "📱", text: "O relatório é enviado para o WhatsApp configurado" },
              { icon: "💬", text: "Você pode responder perguntas no WhatsApp e a IA responde com contexto" },
            ].map((step, i) => (
              <div
                key={i}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{step.icon}</span>
                <span style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* CSV format */}
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>
              Colunas reconhecidas
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
              {[
                ["campanha_id", "ID da campanha"],
                ["campanha_nome", "Nome"],
                ["objetivo", "Objetivo"],
                ["gasto", "Valor investido"],
                ["compras", "Número de compras"],
                ["valor_compras", "Receita de compras"],
                ["leads", "Leads gerados"],
                ["conversas_iniciadas", "Conversas WA"],
                ["impressoes", "Impressões"],
                ["frequencia", "Frequência"],
              ].map(([col, desc]) => (
                <div key={col} style={{ fontSize: 12, marginBottom: 2 }}>
                  <code
                    style={{
                      background: "rgba(56,189,248,.1)",
                      color: "#7dd3fc",
                      padding: "1px 5px",
                      borderRadius: 3,
                      fontSize: 11,
                    }}
                  >
                    {col}
                  </code>
                  <span style={{ color: "var(--ink3)", marginLeft: 6 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Drive */}
          <div
            style={{
              background: "rgba(56,189,248,.06)",
              border: "1px solid rgba(56,189,248,.15)",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>☁️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#7dd3fc" }}>
                  Google Drive ativo
                </div>
                <div style={{ fontSize: 13, color: "var(--ink2)", lineHeight: 1.5 }}>
                  O n8n também monitora a pasta do Drive. Basta salvar um CSV lá e a análise é
                  disparada automaticamente — sem precisar acessar o painel.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
