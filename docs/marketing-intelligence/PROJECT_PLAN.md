# VECTOR MARKETING INTELLIGENCE — Project Plan

**Project:** Vector Recovery Center, Samarkand  
**Website:** https://www.vectorecovery.uz/  
**Repository:** Saltsh1345/vector-site  
**Plan date:** 2026-11-10  
**Status:** Discovery / foundation; integrations not yet commissioned.

## 1. Goal

Build a reliable marketing intelligence system that connects website analytics, search engines, local business listings, Meta/Instagram, lead attribution and marketing finance into one reporting and decision loop. n8n orchestrates collection and actions; a database preserves history; AI explains changes and proposes work; Telegram is the operator interface; GitHub is the versioned source of truth for code, workflows, documentation and the work journal.

The system must measure qualified enquiries, not vanity metrics alone.

## 2. Starting assumptions and verified inventory

User-provided starting point: website exists; some indexing and Yandex work exists; Instagram exists. Everything else should be treated as not configured until independently verified.

Verified on 2026-11-10:
- n8n instance is reachable through the connected n8n MCP integration.
- One active workflow was found: “GitHub: list Saltsh1345 repos”, ID bMmVVA1W3r6dBFTD, 7 nodes, active.
- Its production GET webhook is currently unauthenticated. Do not reuse it for sensitive actions; review hardening separately without breaking the existing workflow.
- The workflow’s latest observed execution ID 6 succeeded.
- One n8n credential was visible: “GitHub account” (githubApi). No Google, Meta, Telegram or database credentials were visible in the accessible credential list.
- No marketing workflows were found.
- GitHub repository Saltsh1345/vector-site is accessible with push permission; current integration does not show admin permission.
- GitHub repository Saltsh1345/Skill contains 36 skill folders with SKILL.md files. Existing relevant skills include site-audit, platform-reach, finance, aiqyn, crm, app-engineering, proof-gate, baton and skill-pulse.
- An initial Vector-specific skill was submitted in a separate PR to Saltsh1345/Skill; it is not merged yet.

Unverified: PostgreSQL/server availability, Google accounts and property ownership, Meta Business Portfolio and app status, Yandex API access, Bing property, Telegram bot token, CRM and actual Instagram professional-account status.

## 3. Architecture

1. Sources: website, Google Search Console, GA4, Google Business Profile, Yandex Webmaster, Yandex Metrica, Yandex Business, Bing Webmaster Tools, Meta Graph API (Instagram/Facebook), Ads and CRM.
2. Integration: official APIs, OAuth and n8n credentials; MCP only for supported agent tools and controlled access.
3. Orchestration: separate n8n workflows for each source, normalization, persistence, analysis, approval and reporting.
4. Storage: first inspect existing PostgreSQL or other database. Reuse it if healthy and suitable; otherwise recommend a minimal PostgreSQL instance. No second database before inventory.
5. AI: SEO, social, web analytics, content, technical and finance roles; one orchestrator creates the combined action plan.
6. Interface: Telegram bot for commands, alerts, weekly/monthly reports and approvals.
7. Governance: GitHub branches and PRs; no secrets or patient data in GitHub.

## 4. Phases and exit criteria

### Phase 0 — Inventory and safety
- Confirm server, n8n version, projects, workflows, credentials, Data Tables, storage and MCP.
- Inspect website and repository structure without modifying production.
- Check access/ownership of each platform.
- Establish backup/export process and journal.
- Exit: inventory has evidence and statuses; no unknown production changes.

### Phase 1 — Website measurement foundation
- Audit sitemap, robots, canonical, redirects, language alternates, metadata, structured data, mobile rendering, speed, forms and CTAs.
- Set up GA4 and events for calls, Telegram/WhatsApp clicks, forms and consultation requests.
- Verify Search Console ownership and sitemap.
- Verify Yandex Webmaster and Metrica goals.
- Verify Bing Webmaster and sitemap; evaluate IndexNow.
- Exit: test events appear in source dashboards and baseline is saved.

### Phase 2 — Local SEO and listings
- Verify/create Google Business Profile, Yandex Business and 2GIS listing; verify Bing Places availability.
- Standardize name, address, phone, categories, opening hours, service descriptions and website URLs.
- Add authentic approved photos, services and languages.
- Establish review-response workflow; no automated public replies without approval.
- Exit: ownership and profile completeness documented.

### Phase 3 — Meta / Instagram
- Verify Instagram account is Professional (Business or Creator).
- Confirm connection to the correct Facebook Page and Meta Business Portfolio.
- Create or select Meta Developer App; configure use case, app roles, OAuth redirect URIs and required permissions.
- Use Instagram Graph API / Meta Graph API read-only first for account and media insights. Confirm required permissions, app review and advanced access from current official docs.
- Add Facebook Page insights where useful. Add Marketing API/ad spend only after separate approval.
- Exit: n8n can retrieve a small, reproducible Insights sample and the figures match Meta UI.

### Phase 4 — Data platform and n8n
- Confirm PostgreSQL exists and can be safely reused; otherwise select a minimal hosted/self-hosted option and document backups.
- Define normalized schema and KPI dictionary before creating collectors.
- Build separate workflows: health monitor; Google collector; Yandex collector; Bing collector; Meta collector; website analytics; normalizer/storage; anomaly monitor; AI analyst; Telegram reporter.
- Use idempotent upserts, retries, pagination, rate-limit handling and failure notifications.
- Exit: two consecutive scheduled runs complete without duplicates and match source dashboards.

### Phase 5 — AI and Telegram
- Create Telegram bot via BotFather and store token only in n8n Credentials.
- Build commands: /report, /weekly, /monthly, /seo, /instagram, /leads, /budget, /tasks, /help.
- Generate weekly report with actual-vs-previous-period comparisons, source links, caveats, findings, hypotheses, priorities and approvals.
- Add AI task proposals with impact, effort, confidence, owner, due date and expected metric.
- Exit: reports are delivered, numbers are reproducible, approval gates work.

### Phase 6 — Operations and optimization
- Monthly strategy review; review organic search, local discovery, Instagram, leads and costs.
- Maintain content calendar in RU and UZ; use qualified review for healthcare claims.
- Run controlled experiments; annotate every change and compare before/after.
- Review credentials, API scopes, access and backups quarterly.
- Exit: operating rhythm and ownership are documented.

## 5. Proposed KPI set

SEO: impressions, clicks, CTR, average position, indexed URLs, branded/non-branded queries.  
Website: sessions, engaged sessions, landing pages, source/medium, device, events and enquiry conversions.  
Local: profile views, searches, calls, website actions, direction requests, reviews where available.  
Instagram: reach, impressions, profile visits, engagement, link clicks, follows, video views and watch time where API supports them.  
Leads: enquiries, qualified enquiries, consultations booked, source attribution and response time.  
Finance: spend by channel, CPL, CAC, attributed revenue and ROI only where source attribution is defensible.

Do not equate reach with leads or leads with admissions. Define each metric and denominator in KPI_DICTIONARY.md.

## 6. Operating rules

- Read-only access first; write permissions only when needed.
- No advertising spend, paid subscription or public posting without owner approval.
- No patient health details or identifiable patient data in marketing analytics.
- Do not expose unauthenticated production webhooks for write operations.
- Do not put secrets in GitHub, workflow JSON, code nodes, logs or Telegram.
- Report unknown data as unknown. Never manufacture baselines or claim API integration from a credential existing.
- Each change has a worklog entry, evidence and rollback path.
