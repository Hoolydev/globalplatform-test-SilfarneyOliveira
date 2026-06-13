const N8N_BASE = process.env.NEXT_PUBLIC_N8N_BASE_URL || "https://n8n.growthailabs.com.br/webhook";
const ANALYZE_PATH = process.env.NEXT_PUBLIC_N8N_ANALYZE_PATH || "global-platform/analyze-csv";
const SETTINGS_PATH = process.env.NEXT_PUBLIC_N8N_SETTINGS_PATH || "global-platform/uazapi-settings";

export async function analyzeCSV(csvText: string) {
  const res = await fetch(`${N8N_BASE}/${ANALYZE_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csv_text: csvText }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Erro HTTP ${res.status}`);
  }
  const text = await res.text();
  if (!text) throw new Error("A API não retornou nenhum dado (resposta vazia).");
  return JSON.parse(text);
}

export async function saveSettings(payload: {
  whatsapp_number: string;
  min_severity: string;
  enabled: boolean;
  openai_api_key: string;
}) {
  const res = await fetch(`${N8N_BASE}/${SETTINGS_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Erro ao salvar configurações: ${res.status}`);
  const text = await res.text();
  if (!text) return { ok: true };
  return JSON.parse(text);
}
