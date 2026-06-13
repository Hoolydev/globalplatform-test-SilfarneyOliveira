# Agente Analista de Campanhas

Solução para o teste técnico da Global Platform. O agente lê métricas de Meta Ads, valida dados sujos, combina regras determinísticas com LLM opcional, gera relatório estruturado e envia um resumo por WhatsApp.

O desenho principal de automação está no n8n. O app local em Python serve como painel/preview protegido para demonstrar upload, análise, cadastro do WhatsApp e consulta do relatório.

## Como rodar

Requisito: Python 3.10+.

### Aplicação web local

```bash
python3 app.py
```

Abra:

```text
http://localhost:8899
```

Na interface, o usuário pode:

- carregar um CSV exportado do Meta Ads;
- carregar o dataset de exemplo;
- importar dados da Meta Marketing API quando `META_ACCESS_TOKEN` estiver configurado;
- escolher breakdown geográfico (`country`, `region` ou `dma`) para mostrar região quando a API retornar essa dimensão;
- rodar a análise no backend;
- ver resumo executivo, métricas, anomalias, recomendações e explicações quando algum dado não puder ser exibido;
- cadastrar o número de WhatsApp que receberá notificações do workflow n8n.

O acesso web é protegido por login. Configure:

```bash
APP_USERNAME=admin
APP_PASSWORD=uma-senha-segura
APP_PORT=8899
```

### CLI

```bash
python3 campaign_agent.py --input dados-campanhas.csv
```

Saídas geradas:

- `outputs/report.json`: relatório estruturado para integração.
- `outputs/report.md`: relatório operacional em Markdown.
- `outputs/notification_payload.json`: payload salvo quando o modo de notificação roda em `dry-run`.

Para rodar testes:

```bash
python3 -m unittest discover -s tests
```

## Entrada de informações de campanha

O CSV contém as métricas diárias. O arquivo `campaign_config.json` contém o contexto operacional que normalmente não vem no export do Meta Ads:

- nome do cliente;
- responsável pela campanha;
- KPI principal;
- orçamento diário;
- canal de notificação preferencial;
- thresholds customizados por campanha.

Exemplo:

```json
{
  "campaign_id": "CAMP-002",
  "owner": "Time Ecommerce",
  "primary_kpi": "roas",
  "daily_budget": 650,
  "notification_channel": "webhook",
  "thresholds": {
    "min_roas": 2.5,
    "max_cost_growth_pct": 80
  }
}
```

Use outro arquivo com:

```bash
python3 campaign_agent.py --input dados-campanhas.csv --campaign-config campaign_config.json
```

Para cadastrar uma nova campanha sem editar JSON na mão:

```bash
python3 campaign_agent.py add-campaign \
  --campaign-id CAMP-007 \
  --campaign-name "Nova Campanha Leads" \
  --objective Leads \
  --owner "Time Growth" \
  --primary-kpi leads \
  --daily-budget 500 \
  --notification-channel webhook \
  --threshold max_cost_growth_pct=80
```

Esse comando atualiza `campaign_config.json`. Depois disso, inclua no CSV as linhas diárias da campanha com o mesmo `campanha_id` e rode o agente novamente.

## Variáveis de ambiente

Copie `.env.example` para `.env` se quiser rodar com credenciais locais. O script carrega `.env` automaticamente quando existir.

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
META_API_VERSION=v25.0
NOTIFICATION_CHANNEL=uazapi
NOTIFICATION_MIN_SEVERITY=alta
WEBHOOK_URL=
SLACK_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
WHATSAPP_TO=
UAZAPI_SERVER_URL=https://pointerimoveis.uazapi.com
UAZAPI_INSTANCE_TOKEN=
UAZAPI_CONNECTED_NUMBER=556294805944
N8N_SETTINGS_WEBHOOK_URL=https://n8n.growthailabs.com.br/webhook/global-platform/uazapi-settings
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
EMAIL_TO=
```

Não coloque chaves no front-end. A chave da OpenAI e o token da Meta ficam somente no backend.

Se `OPENAI_API_KEY` estiver ausente, o painel mostra claramente que a IA não foi executada e usa fallback determinístico. Para a análise da LLM rodar de verdade, configure a chave no `.env` e reinicie `python3 app.py`.

As notificações de produção foram movidas para o n8n. No painel, a seção `Notificações` cadastra o número de WhatsApp e, se `N8N_SETTINGS_WEBHOOK_URL` estiver configurado, sincroniza o destino com o workflow n8n.

Workflow criado no n8n:

- `Global Platform - Agente Campanhas WhatsApp`
  - ID: `RU6Hl3CSAM8CfxK0`
  - Status: ativo.
  - Pasta monitorada: `1hTa7qbltatnIc1hS9Z1-6D1OdCVK-KM-`
  - Credencial Google Drive: `Conta Silfrancys92`.
  - Credencial Uazapi: `Uazapi Pointer Imoveis`.
  - Webhook de configuração: `https://n8n.growthailabs.com.br/webhook/global-platform/uazapi-settings`

Para o envio real via WhatsApp funcionar quando um CSV entrar no Drive, a credencial `Uazapi Pointer Imoveis` envia `POST /send/text` para `https://pointerimoveis.uazapi.com`. Configure `OPENAI_API_KEY` no ambiente do n8n para a análise LLM real; sem ela, o workflow usa fallback determinístico. O número destino pode ser sincronizado pelo painel via webhook.

O app Python não dispara WhatsApp em produção. Ao rodar análise local, ele retorna que a notificação pertence ao fluxo n8n.

Também é possível iniciar defaults pelo `.env` usando `WHATSAPP_TO`, `UAZAPI_SERVER_URL`, `UAZAPI_CONNECTED_NUMBER`, `N8N_SETTINGS_WEBHOOK_URL`, `NOTIFICATION_CHANNEL` e `NOTIFICATION_MIN_SEVERITY`.

Canais legados ainda disponíveis no CLI/local, mas fora do fluxo principal n8n:

- `dry-run`: salva o payload em `outputs/app_notification_payload.json`;
- `webhook`: envia JSON para uma URL genérica;
- `slack`: envia texto para Slack Incoming Webhook;
- `telegram`: usa Bot API com token e chat ID;
- `whatsapp`: envia para webhook legado de um provedor WhatsApp/Twilio/Z-API/etc.;
- `email`: envia via SMTP.

Canal principal do workflow n8n:

- Uazapi: `POST https://pointerimoveis.uazapi.com/send/text`, com header `token` e corpo `{ "number": "...", "text": "..." }`.

## Integração Meta Ads

Nesta sessão não havia um MCP/conector de Facebook Ads disponível. Por isso a solução implementa um conector preparado para a Meta Marketing API, usando o endpoint de Insights no backend.

Campos-base usados:

- identificação: `account_id`, `campaign_id`, `campaign_name`, `objective`, `date_start`, `date_stop`;
- entrega: `spend`, `impressions`, `reach`, `frequency`, `cpm`;
- tráfego: `clicks`, `inline_link_clicks`, `outbound_clicks`, `ctr`, `inline_link_click_ctr`, `cpc`;
- ações/conversões: `actions`, `action_values`, `cost_per_action_type`, `purchase_roas`, `website_purchase_roas`;
- vídeo: `video_play_actions`, `video_thruplay_watched_actions`, retenção 25/50/75/100%.

O backend normaliza `actions` e `action_values` para colunas internas como compras, leads, conversas, valor de compras, custo por lead e ROAS.

Região não é um campo fixo da campanha; ela aparece em relatórios de Insights quando a chamada usa breakdown geográfico. O app suporta `country`, `region` e `dma`. Se o CSV não tiver `regiao`, `pais`, `country`, `region` ou `dma`, o painel mostra uma explicação em vez de deixar a área vazia.

## LLM

O agente funciona sem chave de API. As anomalias são detectadas por regras auditáveis; o LLM recebe apenas um resumo com KPIs, qualidade de dados e anomalias já calculadas.

Quando `OPENAI_API_KEY` está configurada, o LLM retorna JSON com:

- `executive_summary`;
- `llm_diagnosis`;
- `recommendations`;
- `risks`;
- `next_steps`.

Se a API falhar ou o JSON vier inválido, o relatório é gerado com fallback determinístico.

Para forçar execução sem LLM:

```bash
python3 campaign_agent.py --input dados-campanhas.csv --no-llm
```

## Notificação

O modo padrão é `auto`.

- Se `WEBHOOK_URL` estiver configurada, o agente envia um `POST`.
- Se `WEBHOOK_URL` não existir, salva `outputs/notification_payload.json` para auditoria.
- `--notify email` envia por SMTP quando as variáveis de email estão configuradas.
- `--notify off` desliga a notificação.

Payload principal:

```json
{
  "title": "Relatorio diario de campanhas",
  "summary": "...",
  "critical_anomalies": 0,
  "high_anomalies": 0,
  "report_path": "outputs/report.md"
}
```

O webhook tem retry simples configurável em `campaign_config.json`.

## Arquitetura

1. Front-end: usuário envia CSV ou pede importação da Meta Ads API.
2. Backend `app.py`: recebe os dados, mantém tokens fora do navegador e chama o agente.
3. Ingestão: leitura do CSV com validação de schema e normalização de números em formato brasileiro.
4. Qualidade de dados: datas inválidas, números negativos, duplicidades, colunas ausentes e métricas incompatíveis com objetivo viram alertas.
5. Contexto de campanha: `campaign_config.json` adiciona dono, KPI, orçamento, canal e thresholds.
6. Regras determinísticas: detectam anomalias de negócio por objetivo.
7. LLM opcional: transforma os achados em diagnóstico executivo estruturado sem recalcular números.
8. Saída: front-end renderiza diagnóstico executivo, análise detalhada por campanha, anomalias e recomendações.
9. Notificação: dispara pelo canal configurado quando há anomalias a partir da severidade mínima.

## Principais achados no CSV fornecido

- `CAMP-002`: ROAS caiu de 18,12 para 0,74, com frequência em 4,8 e custo por compra de R$ 268,57 no último dia.
- `CAMP-003`: campanha de leads ficou quatro dias seguidos sem gerar leads, mantendo gasto de R$ 1.746,10 no período.
- `CAMP-006`: custo por conversa subiu 509,2%, enquanto conversas caíram de 52 para 9.
- `CAMP-005`: frequência subiu de 1,8 para 5,2 e CTR link caiu 86,4%, sinal de fadiga.
- Qualidade de dados: há clique de link negativo em `CAMP-001`, duplicidade em `CAMP-005` e métricas de compra ausentes em `CAMP-004`.

## Tratamento de erros e logs

O script usa `logging` padrão do Python. Ele registra início da execução, carregamento do CSV, validações, quantidade de anomalias, chamada ao LLM, geração de relatório e notificação.

Erros tratados:

- CSV sem cabeçalho ou sem linhas;
- colunas obrigatórias ausentes;
- números inválidos ou negativos;
- datas inválidas;
- falha ou JSON inválido do LLM;
- webhook sem URL, timeout ou falha HTTP;
- SMTP sem variáveis obrigatórias.

## Limitações conhecidas

- Ainda é uma CLI, não um dashboard.
- Thresholds foram calibrados para o dataset do teste; em produção seriam versionados por cliente, histórico e objetivo.
- O histórico de notificações é o próprio payload salvo em arquivo; em produção eu persistiria status em banco ou fila.
- O uso de LLM é propositalmente restrito para reduzir risco de alucinação.

## Custo diário estimado

Sem LLM, o custo de infraestrutura local é praticamente zero. Com LLM, o agente envia apenas um resumo compacto. Para este dataset, a chamada tende a ficar em poucos milhares de tokens por execução; usando um modelo pequeno, o custo diário ficaria na casa de centavos ou menos por cliente, dependendo do volume de anomalias.

## Respostas dissertativas

### Escala

Com 1 milhão de linhas por dia e 200 clientes, o primeiro gargalo seria processar tudo em memória e gerar relatórios de forma síncrona em um único script. Eu moveria a ingestão para storage, normalizaria dados em warehouse particionado por cliente/data e usaria workers assíncronos com fila, retries e dead-letter queue. A análise passaria a comparar janelas recentes contra baselines pré-computados. O LLM continuaria recebendo apenas agregações e anomalias, nunca o dataset inteiro.

### Confiabilidade

O LLM não deve ser fonte da verdade numérica. Métricas, thresholds, severidades e evidências são calculados por código determinístico e testável. O LLM recebe fatos validados e precisa devolver JSON em schema esperado; resposta inválida cai em fallback. Também manteria logs, versionamento de prompt, testes com casos conhecidos, auditoria de alertas críticos e revisão humana antes de ações automáticas sensíveis.

### Priorização

Com metade do tempo, eu cortaria email, refinamento de LLM, retries e parte dos testes, mantendo ingestão, validação, regras, relatório e fallback. Com o dobro do tempo, adicionaria histórico por cliente, dashboard simples, agendamento diário, persistência de notificações, autenticação e avaliações offline para comparar recomendações contra casos esperados.

## Estrutura

```text
campaign_agent.py
app.py
preview.html
campaign_config.json
dados-campanhas.csv
.env.example
requirements.txt
outputs/report.json
outputs/report.md
outputs/notification_payload.json
tests/test_campaign_agent.py
respostas-dissertativas.md
roteiro-video.md
```
