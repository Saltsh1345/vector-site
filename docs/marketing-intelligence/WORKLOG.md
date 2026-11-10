# Vector Marketing Intelligence — Work Log

All timestamps use Asia/Tashkent (UTC+5). Add a new dated entry for every meaningful audit, access change, workflow change, API connection, budget decision, publication or release. Never store secrets or patient information here.

## 2026-11-10 — Project initiated

**Type:** Discovery / architecture / access inventory  
**Status:** In progress

### Verified
- n8n MCP integration is reachable.
- One active workflow found: GitHub: list Saltsh1345 repos (ID bMmVVA1W3r6dBFTD; 7 nodes).
- Latest observed execution ID 6 succeeded.
- Existing GitHub scan webhook is GET and currently has no authentication; do not reuse it for sensitive operations.
- Only one n8n credential was visible: GitHub account (githubApi).
- No marketing workflows were found.
- GitHub repositories Saltsh1345/vector-site and Saltsh1345/Skill are accessible with push permission; admin permission is not available through the current integration.
- Skill library scan reported 36 skills; relevant existing skills include site-audit, platform-reach, finance, aiqyn, crm, app-engineering, proof-gate, baton and skill-pulse.
- A Vector Marketing Intelligence skill PR was opened in Saltsh1345/Skill: https://github.com/Saltsh1345/Skill/pull/2 (open, not merged).

### Not yet verified
- PostgreSQL instance and backups.
- Google Search Console, GA4, Google Business Profile.
- Yandex API access and current property configuration.
- Bing Webmaster Tools.
- Meta Business Portfolio, Instagram professional status, Developer App and Graph API permissions.
- Telegram bot and token.
- CRM and lead attribution.

### Changes made
- No production website code or active n8n workflow changed.
- Documentation foundation prepared in this repository branch.

### Next
1. Complete n8n/server inventory, including Data Tables and database availability.
2. Audit website SEO and current indexing without modifying production.
3. Verify platform account ownership and access.
4. Start GA4/Search Console and Meta onboarding checklists.
5. Agree data schema and KPI dictionary before collectors are built.

## 2026-11-10 — Privacy guardrails and setup runbook

**Type:** Architecture / implementation planning  
**Status:** Documentation prepared; no platform accounts connected.

- Added step-by-step setup instructions for Google, Meta/Instagram, Yandex, Bing, Telegram, n8n and Codex MCP/skills.
- Added a privacy gate: Instagram organic Insights first; no Meta Pixel/Conversions API on the healthcare website by default; GA4 and other tracking require review of URLs, titles, events and consent.
- Added official-platform OAuth and verification steps, with tokens stored only in n8n Credentials.
- No production site, active workflow, account permission or advertising setting changed.
