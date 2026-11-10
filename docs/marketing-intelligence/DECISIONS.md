# Decisions — Vector Marketing Intelligence

## 2026-11-10 — Initial architecture

- n8n is the orchestration layer.
- Use official platform APIs and OAuth credentials; MCP is an agent/tool bridge, not a substitute for source API authorization.
- Start all platform integrations read-only.
- Inspect existing database/server before creating PostgreSQL or paying for hosting.
- Use separate n8n workflows per data source and a shared normalization/storage layer.
- Telegram is the reporting and approval interface.
- GitHub is the source of truth for documentation, skills, sanitized workflow exports and work history.
- Use branches and Pull Requests; do not modify production site code during discovery.
- Keep patient/health information out of marketing analytics, logs, GitHub and Telegram.
- No paid subscription, ad spend, public post or public reply without explicit owner approval.
- AI may analyze and propose tasks; it may not silently publish, spend or change production.

## Open decisions

- Confirm whether the existing server includes PostgreSQL and backups.
- Confirm whether to host the bot and database on current Pikapods or another existing server.
- Confirm Telegram bot identity/name and authorized user IDs.
- Confirm exact CRM/lead source and qualification definition.
- Confirm monthly operating budget after the inventory and API requirements are known.

## 2026-11-10 — Healthcare measurement privacy gate

- Instagram organic Insights API is in scope; Meta Pixel and Conversions API are not part of the initial implementation.
- Do not send health/treatment-related website behavior, URLs, event labels, form data or audience definitions to Meta Business Tools. Revisit only after documented legal/privacy review.
- GA4 must not receive PII or sensitive information. Review URL/title/event collection and consent before enabling tags on this healthcare website.
