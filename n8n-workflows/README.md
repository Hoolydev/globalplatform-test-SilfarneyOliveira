# Workflow n8n

Workflows criados na instância:

- `Global Platform - Agente Campanhas WhatsApp`
  - ID: `RU6Hl3CSAM8CfxK0`
  - Status: ativo.
  - Pasta monitorada: `1hTa7qbltatnIc1hS9Z1-6D1OdCVK-KM-`
  - Credencial Google Drive: `Conta Silfrancys92`.
  - Credencial Uazapi: `Uazapi Pointer Imoveis`.
  - Webhook de configuração: `https://n8n.growthailabs.com.br/webhook/global-platform/uazapi-settings`

## Fluxo

### Configuração WhatsApp

1. `Webhook - configurar Uazapi`
   - Recebe `POST /webhook/global-platform/uazapi-settings`.
   - Body esperado:

```json
{
  "whatsapp_number": "5511999999999",
  "min_severity": "alta",
  "enabled": true,
  "uazapi_server_url": "https://pointerimoveis.uazapi.com",
  "uazapi_connected_number": "556294805944"
}
```

### Agente de campanhas

1. `Google Drive - novo CSV`
   - Monitora a pasta configurada em `GP_DRIVE_FOLDER_ID`.
   - Quando um CSV novo entra, baixa o arquivo e converte para JSON.

2. `Regras por objetivo`
   - Valida linhas e agrupa por campanha.
   - Calcula gasto, compras, leads, conversas, CTR, ROAS, CPL, CPA e frequência.
   - Detecta anomalias por objetivo antes de chamar LLM.

3. `LLM + preparar WhatsApp`
   - Usa LLM apenas para diagnóstico textual e recomendações.
   - Se `OPENAI_API_KEY` falhar ou estiver ausente, usa fallback determinístico.

4. `Enviar via Uazapi`
   - Envia o resumo para `POST https://pointerimoveis.uazapi.com/send/text`.
   - Usa credential segura `Uazapi Pointer Imoveis`, que injeta o header `token`.

## Variáveis no n8n

```bash
GP_DRIVE_FOLDER_ID=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
WHATSAPP_TO=
UAZAPI_SERVER_URL=https://pointerimoveis.uazapi.com
UAZAPI_CONNECTED_NUMBER=556294805944
NOTIFICATION_MIN_SEVERITY=alta
```

Na instância atual, `GP_DRIVE_FOLDER_ID` já está configurado diretamente no nó `Google Drive - novo CSV`.

## Escalabilidade

Para 1 milhão de linhas por dia e 200 clientes, o primeiro gargalo seria memória/tempo se o CSV fosse processado inteiro em uma execução. A evolução correta é processar em lotes por cliente/data/campanha, usar fila para fan-out, persistir agregados intermediários e chamar o LLM somente em cima das anomalias resumidas, nunca sobre linhas brutas.

## Confiabilidade

O LLM não decide sozinho. As regras fixas calculam métricas e severidade primeiro. O prompt recebe somente resumo, campanhas agregadas e anomalias já validadas. Se a OpenAI falhar, retornar JSON inválido ou inventar formato, o workflow mantém o diagnóstico determinístico e ainda pode notificar.

## Priorização

Com metade do tempo, o corte correto é manter ingestão, validação, regras e relatório básico, deixando dashboard histórico e refinamentos de LLM fora. Com o dobro do tempo, adicionaria testes robustos para CSVs malformados, agendamento automático, histórico por cliente, reprocessamento idempotente e painel de auditoria das notificações.
