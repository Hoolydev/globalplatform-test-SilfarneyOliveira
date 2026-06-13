# Agente Analista de Campanhas & Q&A — Global Platform

Esta é a solução moderna e escalável em produção para a análise de campanhas de Meta Ads da Global Platform. A arquitetura foi estruturada dividindo responsabilidades entre uma interface de gerenciamento moderna em Next.js e um backend de automação orquestrado via n8n com agentes de inteligência artificial nativos.

---

## 🏗️ Arquitetura do Sistema

```
                         [ Fluxo 1: Upload & Análise ]
  [ Painel Next.js ] ──(Upload CSV)──> [ Webhook n8n ] ──> [ Processamento & Regras ]
          ▲                                                           │
          └───────────(Retorna JSON Relatório)◄───────────────────────┼──> [ LLM (GPT-4o-Mini) ]
                                                                      │            │
                                                                      ▼            ▼
                                                              [ Envia Relatório WhatsApp ]
                                                                           │
                                                                           ▼
                                                             [ Usuário (WhatsApp / Uazapi) ]
                                                                           │
                         [ Fluxo 2: Agente Q&A ]                           │
  [ Usuário (WhatsApp) ] ──(Pergunta / Qual gancho?)───────────────────────┘
          │
          ▼
  [ Webhook Uazapi ] ──> [ Prepare Input ] ──> [ Agente LangChain n8n ]
                                                      ├── Memória Postgres (Conversas)
                                                      └── OpenAI Chat Model (gpt-4o-mini)
                                                              │
                                                              ▼
                                                 [ Responde via Uazapi (Text) ]
```

---

## 🛠️ Stack Tecnológica

1. **Frontend (Dashboard)**: Next.js (TypeScript, React, TailwindCSS e Vanilla CSS) construído para rodar localmente ou via Vercel.
2. **Backend de Automação & IA**: n8n (instância auto-hospedada em `n8n.growthailabs.com.br`).
3. **Mensageria & WhatsApp**: API do Uazapi (instância `pointerimoveis`) para disparos automatizados e recepção de webhooks de mensagens.
4. **Base de Memória**: Banco de dados PostgreSQL configurado nativamente no n8n para histórico de chats.

---

## 🚀 Como Executar

### 1. Frontend (Next.js)

O painel fornece a visualização de KPIs, anomalias detectadas, histórico de relatórios gerados por IA, upload interativo de planilhas de campanha e configurações unificadas.

**Pré-requisitos**: Node.js 18 ou superior.

```bash
# Entrar no diretório do frontend
cd frontend

# Instalar dependências
npm install

# Rodar o servidor de desenvolvimento
npm run dev -- --port 3001
```

O painel estará disponível em [http://localhost:3001](http://localhost:3001).

Para gerar uma build estática de produção:
```bash
npm run build
```

#### Variáveis de Ambiente do Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_N8N_BASE_URL=https://n8n.growthailabs.com.br/webhook
NEXT_PUBLIC_N8N_ANALYZE_PATH=global-platform/analyze-csv
NEXT_PUBLIC_N8N_SETTINGS_PATH=global-platform/uazapi-settings
```

---

### 2. Backend & Automação (n8n)

Os modelos de fluxos estão na pasta [n8n-workflows/](file:///Users/holydev/Documents/Teste-%20Global%20plataform/n8n-workflows). O arquivo principal de produção é o [global-platform-updated.json](file:///Users/holydev/Documents/Teste-%20Global%20plataform/n8n-workflows/global-platform-updated.json).

#### Como Importar o Fluxo
1. Acesse o painel do seu n8n.
2. Crie um novo workflow vazio.
3. No menu superior direito (três pontos), clique em **Import from file** e escolha o arquivo `n8n-workflows/global-platform-updated.json`.
4. Ative o workflow.

#### Configurações de Credenciais Necessárias no n8n
* **Google Drive**: Vincule a credencial `Conta Silfrancys92` (no trigger de novo arquivo).
* **Uazapi (Disparo)**: Vincule a credencial `Uazapi Pointer Imoveis` (header `token`) nos nós HTTP Request.
* **OpenAI (Modelos IA)**: Vincule suas credenciais do OpenAI (`openAiApi`) no nó **OpenAI Chat Model**.
* **PostgreSQL (Memória)**: Vincule a credencial do seu banco de dados PostgreSQL no nó **Postgres Chat Memory**. A tabela utilizada é a `n8n_historico_mensagens`.

---

## 📱 Integração com Uazapi (WhatsApp)

Para que o agente especialista de Q&A do WhatsApp responda a dúvidas sobre as campanhas (ex: *"Qual gancho sugere?"*):

1. Acesse o painel do seu Uazapi.
2. Nas configurações de webhook da instância, defina a URL de destino de mensagens recebidas para:
   ```text
   https://n8n.growthailabs.com.br/webhook/global-platform/whatsapp-qa
   ```
3. O fluxo n8n possui tratamentos de segurança para ignorar mensagens do próprio número (fromMe) e evitar loops infinitos de resposta.

---

## 📊 Regras de Negócio & Parsing de Dados

* **Investimento Correto**: O arquivo de exemplo [dados-campanhas.csv](file:///Users/holydev/Documents/Teste-%20Global%20plataform/dados-campanhas.csv) soma um investimento real total de **R$ 28.857,80**.
* **Tratamento de Números (toNumber)**: O parser no n8n e Next.js limpa e identifica pontuações brasileiras (`1.272,60`) e americanas (`1,272.60`) de forma flexível sem desconfigurar ou inflar as métricas de frequência, ROAS ou gastos das campanhas.
* **Identificação**: Cada ação de otimização disparada nos relatórios de WhatsApp é prefixada com o ID da campanha (ex: `*[CAMP-003]*`), ajudando a identificar a campanha de destino imediatamente no celular.

---

## 📂 Estrutura de Pastas do Repositório

```text
globalplatform-test-SilfarneyOliveira/
├── assets/
│   └── global-platform-logo.svg                      # Logo oficial do painel
├── frontend/                                         # Projeto Next.js (TypeScript)
│   ├── app/                                          # Roteamento e layouts
│   ├── components/                                   # Componentes de UI (Dashboard, Config, Import)
│   ├── lib/                                          # Chamadas de API e tipos typescript
│   └── public/                                       # Recursos estáticos do frontend
├── n8n-workflows/                                    # Workflows estruturados para n8n
│   ├── global-platform-updated.json                  # Workflow atualizado de produção
│   ├── global-platform-agent-campaigns-whatsapp.json # Template sincronizado
│   └── README.md                                     # Documentação rápida do workflow
├── dados-campanhas.csv                               # Dataset real de teste
├── .env.example                                      # Exemplo de envs do repositório
├── .gitignore                                        # Configurações de ignorar do Git
└── README.md                                         # Esta documentação do sistema
```
