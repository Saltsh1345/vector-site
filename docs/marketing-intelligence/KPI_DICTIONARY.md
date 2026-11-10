# KPI Dictionary — Vector Marketing Intelligence

Every metric must carry: source, API/property, period, timezone, unit, formula, fetch timestamp, completeness and caveat. Compare like-for-like periods.

| KPI | Definition | Formula / notes | Source |
|---|---|---|---|
| Search impressions | Search result appearances | Platform definition; do not sum platforms without labeling | GSC / Yandex / Bing |
| Search clicks | Clicks from search results | Keep each engine separate | GSC / Yandex / Bing |
| Search CTR | Click-through rate | clicks / impressions | Search tools |
| Average position | Mean reported search position | Keep engine and query scope explicit | Search tools |
| Organic sessions | Website sessions attributed to organic search | GA4 channel/source definition | GA4 |
| Engaged sessions | Sessions meeting GA4 engagement criteria | Use GA4's definition for current property | GA4 |
| Enquiry conversion rate | Enquiry events / eligible sessions | Define event and denominator before reporting | GA4 |
| Profile actions | Calls, website clicks, direction requests | Only report fields actually returned by platform | Business profiles |
| Instagram reach | Unique accounts reached | Do not confuse with impressions | Meta Insights |
| Instagram impressions/views | Content/account exposure as defined by API version | Store metric name and API version | Meta Insights |
| Engagement rate | Interactions / defined reach or impressions | State denominator; do not compare different formulas | Meta Insights |
| Leads | Distinct enquiries received | Deduplicate by approved internal lead ID | CRM / forms |
| Qualified leads | Enquiries meeting agreed qualification criteria | Criteria must be agreed; no patient clinical details in analytics | CRM |
| CPL | Cost per qualified lead | channel spend / qualified leads attributed to channel | Ads + CRM |
| CAC | Acquisition cost per new customer | attributable acquisition spend / new customers | Finance + CRM |
| ROI | Return on marketing investment | define revenue and cost attribution before use | Finance + CRM |

Never label a click, message start or form submission as a qualified lead unless the agreed CRM rule confirms it. Keep organic, paid, referral and direct sources separate.
