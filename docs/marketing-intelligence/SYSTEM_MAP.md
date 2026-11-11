# System Map — Vector Marketing Intelligence

## Logical flow

Website + Google + Yandex + Bing + Meta/Instagram + CRM/Ads  
→ official APIs / OAuth credentials  
→ n8n source collectors  
→ validation + normalization  
→ PostgreSQL (historical metrics, source metadata, tasks, audit log)  
→ AI analysis and prioritization  
→ Telegram reports and approval prompts  
→ approved tasks  
→ website/content/marketing execution  
→ measurement of impact  
→ GitHub documentation and work journal.

## Components

| Component | Responsibility | Initial state |
|---|---|---|
| vectorecovery.uz | Website, landing pages, forms, CTAs | Exists; audit pending |
| Google Search Console | Organic search and indexing | Not verified |
| GA4 | Sessions, events, conversions | Not verified |
| Google Business Profile | Local discovery and actions | Not verified |
| Yandex Webmaster | Search/indexing | User reports some work; audit pending |
| Yandex Metrica | Visits and goals | User reports some work; audit pending |
| Yandex Business | Local listing | Not verified |
| Bing Webmaster | Search/indexing | Not verified |
| Meta Graph API | Instagram/Facebook organic insights | Instagram exists; API not verified |
| Meta Marketing API | Ads insights and spend | Not verified; later phase |
| n8n | Automation/orchestration | Existing instance; only one active GitHub scan workflow observed |
| PostgreSQL | Historical data store | Existence and access not verified |
| Telegram Bot API | Reporting and approvals | Not verified |
| GitHub | Versioned docs, code, workflows and journal | Repositories accessible |
| MCP | Tool access for agent and n8n | n8n MCP integration available; other MCP servers not verified |

## Workflow naming convention

Use prefix VECTOR and descriptive domain names:
- VECTOR | 00 | Health Monitor
- VECTOR | 10 | Google Search Console Collector
- VECTOR | 11 | GA4 Collector
- VECTOR | 12 | Google Business Profile Collector
- VECTOR | 20 | Yandex Collector
- VECTOR | 30 | Bing Collector
- VECTOR | 40 | Meta Instagram Insights Collector
- VECTOR | 50 | Normalize and Persist
- VECTOR | 60 | KPI and Anomaly Analysis
- VECTOR | 70 | AI Marketing Analyst
- VECTOR | 80 | Telegram Reports and Approvals

Do not create these workflows until inventory, n8n preferences and workflow best practices have been checked.
