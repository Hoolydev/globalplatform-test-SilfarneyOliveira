export interface GlobalMetrics {
  spend: number;
  purchase_value: number;
  purchases: number;
  leads: number;
  conversations: number;
  roas: number;
  campaigns_count?: number;
}

export interface Campaign {
  campaign_id: string;
  campaign_name: string;
  objective: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  inline_link_clicks: number;
  purchases: number;
  purchase_value: number;
  leads: number;
  conversations: number;
  frequency: number;
  ctr: number;
  roas: number;
  cpa: number | null;
  cpl: number | null;
  costPerConversation: number | null;
  rows: number;
}

export interface Anomaly {
  severity: "critica" | "alta" | "media" | "baixa";
  campaign_id: string;
  campaign_name: string;
  objective: string;
  metric: string;
  diagnosis: string;
  recommendation: string;
}

export interface Report {
  generated_at: string;
  source: string;
  global_metrics: GlobalMetrics;
  campaigns: Campaign[];
  anomalies: Anomaly[];
  diagnosis: string;
  recommendations: { priority: string; action: string; reason: string }[];
  llm_status: string;
  executive_summary: string[];
}
