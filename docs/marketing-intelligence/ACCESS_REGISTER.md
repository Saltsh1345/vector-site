# Access Register — Vector Marketing Intelligence

This is a non-secret inventory. Never put passwords, API keys, OAuth refresh tokens, bot tokens, client secrets or recovery codes in this file.

| System | Account/property | Access status | Evidence / next check |
|---|---|---|---|
| Website | vectorecovery.uz | Exists | Audit DNS, Vercel, redirects and analytics tags |
| GitHub | Saltsh1345/vector-site | Read/write through current integration; no admin permission visible | Use branch + PR; do not assume admin controls |
| GitHub skills | Saltsh1345/Skill | Read/write through current integration; no admin permission visible | Vector skill PR #2 is open |
| n8n | resourceful-oarfish.pikapod.net | Connected via n8n MCP | Inventory workflows, credentials, Data Tables and instance details |
| n8n GitHub credential | GitHub account / githubApi | Present | Never export secret; reuse only where appropriate |
| PostgreSQL | Unknown | Not verified | Check host/service and n8n credentials; no duplicate DB before inspection |
| Google Search Console | Unknown | Not verified | Confirm Google account and property owner |
| GA4 | Unknown | Not verified | Confirm property and measurement ID |
| Google Business Profile | Unknown | Not verified | Confirm business owner/manager access |
| Yandex Webmaster | User reports some existing work | Not verified | Check property, ownership and API |
| Yandex Metrica | User reports some existing work | Not verified | Check counter, goals and API |
| Yandex Business | Unknown | Not verified | Confirm organization listing |
| Bing Webmaster Tools | Unknown | Not verified | Add and verify site |
| Meta Business Portfolio | Unknown | Not verified | Confirm business ownership and admin |
| Facebook Page | Unknown | Not verified | Confirm correct Page |
| Instagram | Account exists per owner | API/account type not verified | Confirm Professional Business/Creator and Page link |
| Meta Developer App | Unknown | Not verified | Create/select app after account ownership check |
| Telegram Bot | Unknown | Not verified | Create via BotFather; store token only in n8n Credentials |
| CRM | Unknown | Not verified | Identify source of lead records and consent model |

Status vocabulary: Present / Verified / Partial / Not verified / Blocked. Update only with evidence and date.
