# Setup Runbook — Vector Marketing Intelligence

**Last reviewed:** 2026-11-10  
**Timezone:** Asia/Tashkent  
**Rule:** complete each step in order. Do not share passwords, tokens, recovery codes or patient information in chat or GitHub.

## Before starting

1. Use one owner-controlled Google account for Vector properties.
2. Use an owner/admin-controlled Meta Business Portfolio and Instagram account.
3. Confirm the person doing setup has owner/admin access, not merely analyst access.
4. Keep a password manager for account access. Store API secrets only in n8n Credentials.
5. Do not buy subscriptions or start advertising without approval.
6. Keep production site changes in a separate GitHub branch and deploy only after review.

## Step 1 — Confirm the n8n and server foundation

1. Open the existing n8n URL: https://resourceful-oarfish.pikapod.net/
2. Sign in using the owner account.
3. Open Workflows and confirm the existing workflow “GitHub: list Saltsh1345 repos” remains active.
4. Open Settings and inspect the instance version, timezone, users, projects and security options.
5. Open Credentials. Record names and types only; never export or screenshot secrets.
6. Check whether a PostgreSQL service already exists on the Pikapod/server. If it exists, record version, database name, backup status and network reachability. Do not create a second database until this check is complete.
7. Check whether a PostgreSQL credential exists in n8n. It was not visible in the initial credential inventory.
8. Check Settings → MCP Access (if available in this n8n version) and verify the MCP server's enabled tools and access scope.
9. Run or review n8n's security audit if the instance owner can access it. The existing GitHub scan webhook is unauthenticated; do not reuse it for sensitive or write operations.
10. Add findings to ACCESS_REGISTER.md and WORKLOG.md.

**Pass condition:** server, database and MCP state are documented with evidence.

## Step 2 — Google Search Console

1. Open https://search.google.com/search-console/
2. Sign in with the owner-controlled Google account.
3. Check whether the property https://www.vectorecovery.uz/ already exists.
4. If it exists, open it and check Settings → Ownership verification and Users and permissions.
5. If it does not exist, choose Add property.
6. Prefer Domain property if DNS access is available. Copy the TXT record Google gives you and add it in the domain DNS control panel. Do not replace existing DNS records.
7. If DNS access is unavailable, choose URL prefix and use the HTML meta-tag verification method. The current site source already contains a Google verification meta tag; verify whether it matches the property rather than creating a duplicate.
8. Open Sitemaps and submit https://www.vectorecovery.uz/sitemap.xml.
9. Open Pages / Indexing and export the current report.
10. Open Performance → Search results. Set the longest useful period and export queries, pages, countries and devices as the baseline.
11. Record the property URL, owner status, sitemap status and baseline date. Do not store verification tokens in the work log.

## Step 3 — Google Analytics 4 (privacy gate first)

Do not add a GA4 tag to the website until the privacy review confirms what data may be collected on a healthcare/recovery website.

If approved for a limited, privacy-safe implementation:

1. Open https://analytics.google.com/
2. Select Admin → Create → Account/Property (or use the existing Vector property).
3. Set reporting timezone to Asia/Tashkent and currency to UZS.
4. Open Data Streams → Web → Add stream.
5. Enter https://www.vectorecovery.uz/ and a clear stream name.
6. Copy the Measurement ID. Store it in the approved project configuration, not in a public issue or chat.
7. In Google Cloud Console, create/select a project and enable Google Analytics Data API.
8. Grant the service account or OAuth user read access to the GA4 property.
9. Configure n8n's Google OAuth2 credential or service-account credential using the current n8n credential form. Use the redirect URI displayed by n8n when creating OAuth credentials.
10. Test a read-only report with a short date range and compare the result with the GA4 UI.
11. Do not send names, phone numbers, email addresses, diagnoses, form contents or treatment details. Review page URL/title collection and event naming with a privacy specialist.
12. Keep advertising personalization and remarketing off unless separately approved and legally reviewed.

## Step 4 — Google Cloud OAuth for Search Console and Analytics

1. Open https://console.cloud.google.com/
2. Create a project named “Vector Marketing Intelligence” or select an existing Vector-owned project.
3. Open APIs & Services → Library.
4. Enable Google Search Console API and Google Analytics Data API.
5. Open Google Auth Platform / OAuth consent screen and complete the app information using a Vector-controlled contact email.
6. Open APIs & Services → Credentials → Create Credentials → OAuth client ID.
7. Choose Web application if using n8n's OAuth callback.
8. In n8n, open Credentials → Add Credential and select the Google OAuth2 credential type required by the relevant node or HTTP Request.
9. Copy the exact OAuth Redirect URL shown by n8n.
10. Add that exact URL to Authorized redirect URIs in Google Cloud.
11. Copy Client ID and Client Secret from Google Cloud into n8n Credentials and click Connect / Sign in with Google.
12. Grant only read scopes needed for the first reports.
13. Test one Search Console query and one GA4 report. Compare both with their dashboards.

Do not publish Client ID/Secret or tokens in GitHub. The client secret is always private.

## Step 5 — Google Business Profile

1. Open https://business.google.com/
2. Sign in with the Google account that should own the business profile.
3. Search for “Vector Recovery” and the existing Samarkand address before creating anything. Avoid duplicate listings.
4. If a profile exists, request or confirm owner access. If not, select Add business.
5. Use the exact real-world business name, address, phone and website. Keep the same spelling and contact details across platforms.
6. Select the most accurate available primary category and relevant secondary categories.
7. Add opening hours, service descriptions, website, phone and authentic approved photos.
8. Complete Google's verification process using the method offered to the business.
9. Open the profile and confirm that the public listing is visible and correct.
10. Do not ask for or publish patient reviews or identifiable patient stories.
11. For API reporting, first create/select a Google Cloud project, then request Business Profile API access using the owner account and a valid business website. API access is separately approved and is not guaranteed by simply creating a profile.
12. After approval, enable the relevant Business Profile APIs and create OAuth credentials. Begin with read-only Performance API metrics.

## Step 6 — Meta Business and Instagram

### 6A. Verify account ownership and account type

1. Open Instagram and sign in to the Vector account.
2. Open Profile → menu → Settings and activity → Account type and tools.
3. Confirm the account is Professional. If not, choose Switch to professional account and select Business (or Creator if that is the genuine account type).
4. Open Edit profile and check whether the correct Facebook Page is connected.
5. Open https://business.facebook.com/
6. Open Business settings / Settings → Business assets.
7. Confirm the correct Business Portfolio owns or has admin access to the Facebook Page and Instagram account.
8. Confirm the current owner has full control and two-factor authentication enabled.
9. Do not create a duplicate Facebook Page or Business Portfolio if an existing correct one is available.

### 6B. Create/select Meta Developer App

1. Open https://developers.facebook.com/apps/
2. Sign in with a person who has admin access to the Vector Business Portfolio.
3. Select My Apps → Create App.
4. Choose the app type/use case that supports Instagram API and Insights for a business.
5. Name it “Vector Marketing Intelligence” and associate the correct Business Portfolio if the UI asks.
6. Add/configure the Instagram API product or use case offered in the current developer dashboard.
7. Select the login path that matches the account:
   - Instagram Login may be suitable for Professional accounts without relying on a Facebook Page.
   - Facebook Login requires the Instagram Professional account to be linked to a Facebook Page.
8. Configure the OAuth redirect URI using the exact callback shown by n8n.
9. Start with read-only account/media Insights permissions only. Do not request publishing, comment-management or ad-management permissions unless a later approved workflow requires them.
10. Check current Meta documentation for permission names, app review and Advanced Access requirements. Do not rely on old permission-name lists.
11. Add the owner/admin as an app role and complete the OAuth authorization.
12. Store the app secret and access tokens only in n8n Credentials.

### 6C. Test Instagram Insights

1. Use the Meta API test tool or a read-only n8n HTTP Request to retrieve the connected professional account.
2. Retrieve a small sample of account-level and media-level Insights supported by the account and current API version.
3. Compare sample values with Instagram Insights in the app / Meta Business Suite.
4. Save metric names, API version, period, timezone, fetch time and any missing-data caveat.
5. Do not assume a missing API value is zero.
6. Do not connect Meta Pixel or Conversions API to the Vector website during initial setup. Healthcare-related URLs, event names and form interactions can reveal sensitive treatment interest. Revisit only after documented legal/privacy review.

## Step 7 — Yandex

### 7A. Yandex Webmaster

1. Open https://webmaster.yandex.ru/
2. Sign in with the account that owns the Vector site.
3. Check whether https://www.vectorecovery.uz/ already exists.
4. If it exists, check verification and access. The current site source contains a Yandex verification meta tag; verify that it matches the existing property.
5. If it does not exist, add the site and complete the offered verification method.
6. Open Indexing → Pages / Sitemap and confirm the sitemap is processed.
7. Review search queries, indexing and diagnostics; export the baseline.
8. For API access, register an OAuth application in Yandex OAuth, configure the callback URL and request the minimum required scope. The Webmaster API requires an authorized application and user context.
9. Store the token in n8n Credentials and test read-only calls.

### 7B. Yandex Metrica

1. Open https://metrika.yandex.ru/
2. Check whether a Vector counter already exists.
3. If it exists, confirm owner access, counter ID, goals and current tag installation.
4. If not, create a counter for https://www.vectorecovery.uz/ and set timezone to Asia/Tashkent.
5. Before installing the tag, perform the same privacy review as for GA4. Do not capture form text, phone numbers, names or treatment details.
6. Configure only approved, minimal goals. Avoid goal names that disclose a health condition.
7. For API access, create an OAuth application and request the required Metrica scope. Store the token in n8n Credentials.
8. Test a read-only report and compare it with the Metrica interface.

### 7C. Yandex Business and Maps

1. Open https://business.yandex.ru/
2. Search for the existing Vector Recovery listing before creating anything.
3. Confirm ownership or request access.
4. Correct name, address, phone, category, hours, services and website.
5. Add authentic approved photos.
6. Review map pin placement and public contact details.
7. Document whether API access is available for the required operations; do not assume all profile statistics are exposed by API.

## Step 8 — Bing Webmaster Tools and IndexNow

1. Open https://www.bing.com/webmasters/
2. Sign in with a Microsoft account controlled by Vector.
3. Choose Import from Google Search Console if the correct GSC property is accessible, otherwise Add site manually.
4. Complete verification. The current site source contains a Bing msvalidate verification meta tag; check if it matches the property.
5. Open Sitemaps and submit https://www.vectorecovery.uz/sitemap.xml.
6. Review Search Performance and URL Inspection.
7. Open IndexNow / URL submission and check whether the site already submits changes.
8. If not, generate an IndexNow key in Bing Webmaster Tools, place the exact UTF-8 key file at the approved site path and verify it is publicly reachable.
9. Configure the deployment process to notify IndexNow only when a page is added, updated or deleted.
10. Do not assume submission guarantees indexing; verify crawl and indexing status.

## Step 9 — Telegram bot

1. Open Telegram and search for @BotFather.
2. Open the verified BotFather account and send /newbot.
3. Choose display name “Vector Growth AI”.
4. Choose a unique username ending in “bot”.
5. Copy the token directly into a secure password manager; do not paste it into GitHub or public chat.
6. In n8n, open Credentials → Add Credential → Telegram API.
7. Paste the token into the Access Token field and save.
8. Create a test workflow with Telegram Trigger or a manual trigger and Telegram Send Message.
9. Send a test message only to the owner's chat ID.
10. Restrict commands and approval actions to explicitly authorized Telegram user IDs.
11. Add /report, /weekly, /monthly, /seo, /instagram, /leads, /budget, /tasks and /help after the reporting workflows are tested.

## Step 10 — Codex MCP and skill synchronization

The n8n MCP endpoint already works in the connected ChatGPT environment. A second MCP server is not needed for ChatGPT. To expose the same n8n server to Codex on the user's PC:

1. Install/update Codex using the official installer for the user's OS. Do not download unofficial builds.
2. Open PowerShell or Terminal and run: codex --version
3. Check whether the n8n endpoint requires authentication before adding it to Codex.
4. If the endpoint supports the required remote HTTP transport and the current user has authorized access, run:
   codex mcp add n8n --url https://resourceful-oarfish.pikapod.net/mcp-server/http
5. Run codex mcp list and confirm n8n appears.
6. Start Codex and inspect the available MCP tools. Test with a read-only workflow search only.
7. If authentication is required, configure it through Codex's supported secure authentication flow. Do not put bearer tokens or passwords in Git or a shared config file.
8. Do not grant write permissions to Codex until the read-only connection is verified and access scope is understood.

To install the Vector skill after its GitHub PR is merged:

1. Open PowerShell.
2. Clone or update the private Skill repository using the authenticated GitHub CLI or an existing authenticated Git clone.
3. Confirm the new folder exists at skills/vector-marketing-intelligence.
4. Copy that skill folder to the Codex user skills directory: %USERPROFILE%\.agents\skills\vector-marketing-intelligence
5. Restart Codex or start a fresh session so it discovers the skill.
6. Ask Codex to read and summarize the skill to confirm installation.
7. Keep the GitHub Skill repository as the source of truth. Do not maintain a divergent manual copy.

Official Codex documentation currently identifies ~/.agents/skills/ for user-wide skills and .agents/skills/ for project-local skills. Exact commands and paths should be checked against the installed Codex version.

## Step 11 — n8n workflow implementation order

Only after platform credentials and database status are verified:

1. Read n8n project preferences and workflow best practices.
2. Export and back up the existing workflow before any changes.
3. Create a new folder or consistent workflow prefix VECTOR.
4. Build Health Monitor first.
5. Build read-only Search Console, Yandex Webmaster and Bing collectors.
6. Build Meta Instagram Insights collector.
7. Build approved web analytics collector only after privacy review.
8. Normalize data and persist it with idempotent upserts.
9. Build KPI/anomaly analysis.
10. Build AI analyst with source citations, confidence and unknowns.
11. Build Telegram reporter and approval flow.
12. Test with a short date range, then run two consecutive scheduled cycles.
13. Publish to production only after review and explicit approval.

## Step 12 — Definition of done

- All properties are owned/managed by the correct Vector account.
- API credentials are stored only in n8n Credentials.
- Every source returns fresh, non-empty, reproducible data.
- Metrics match platform dashboards on a control sample.
- Database writes are idempotent and backed up.
- Telegram commands are access-controlled.
- AI reports distinguish facts, hypotheses and unknowns.
- No patient data, health information or secrets enter the marketing data pipeline.
- Workflows, documentation and worklog are versioned in GitHub.
- Every production change has approval, evidence and rollback instructions.
