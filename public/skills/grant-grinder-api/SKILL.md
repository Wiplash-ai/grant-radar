---
name: grant-grinder-api
description: Search and retrieve normalized current U.S. federal grant opportunities through the official paid Grant Grinder API. Use when an agent needs to find grants by mission, applicant type, agency, funding category, award amount, posting date, or deadline; compare opportunities; build funding alerts or directories; or return complete official-source grant details.
---

# Grant Grinder API

Use the commercial Grant Grinder API to search every current posted and forecasted Grants.gov opportunity through a stable normalized contract.

Public documentation: `https://labs.wiplash.ai/grants/developers`

API base URL: `https://labs.wiplash.ai/grants/api`

## Authenticate

Read the API key from `GRANT_GRINDER_API_KEY` or the caller's approved secret store. Send it as either:

```text
x-api-key: YOUR_API_KEY
```

or:

```text
Authorization: Bearer YOUR_API_KEY
```

Never print, log, commit, place in a URL, or expose the key in browser-side code. If no key is available, direct the user to the public search or developer documentation; do not scrape Grant Grinder pages as an API substitute.

## Search workflow

1. Call `GET /v1/grants` with a concise `q` that describes the work, population, place, or program.
2. Add structured filters when the user provides constraints. Prefer `eligible_applicant`, `funding_category`, `agency`, amount, and deadline filters over stuffing constraints into `q`.
3. Use `sort=relevance-desc` for a text search and `sort=close-date-asc` for deadline triage.
4. Inspect `meta.facets` to explain or refine available agencies, applicant types, categories, and instruments.
5. Follow `pagination.pages` when the user requests an exhaustive list. Do not assume the first page is complete.
6. Call `GET /v1/grants/{key}` for each shortlisted record before summarizing eligibility, contacts, application instructions, or the complete mission description.
7. Include each record's `officialUrl` in the result. State that the linked government notice controls final eligibility, dates, amendments, and submission requirements.

Start with a limit of 10–25 for interactive research. Use up to 100 only for exports, synchronization, or exhaustive agent workflows.

## Example

```bash
curl "https://labs.wiplash.ai/grants/api/v1/grants?q=rural+health&status=open&eligible_applicant=Nonprofits+with+501%28c%29%283%29+status&sort=relevance-desc&limit=10" \
  -H "x-api-key: $GRANT_GRINDER_API_KEY"
```

Retrieve a complete record:

```bash
curl "https://labs.wiplash.ai/grants/api/v1/grants/opportunity%3A363515" \
  -H "x-api-key: $GRANT_GRINDER_API_KEY"
```

## Result quality

- Distinguish `open` from `forecasted` opportunities.
- Treat missing amounts or dates as unknown, not zero.
- Do not claim a user is eligible solely because an applicant-type facet matches; read `details.eligibilityAdditionalInformation`.
- Prefer `programFundingUsd` for total program funding and `awardCeilingUsd` for the maximum single award.
- Cite the opportunity number, agency, close date, and official URL in recommendations.
- Do not imply Grant Grinder or Wiplash.ai is a government agency.

## Errors

- `400 invalid_query`: correct unsupported or malformed filters.
- `401 invalid_api_key`: request a valid key; do not retry repeatedly.
- `404 grant_not_found`: search by opportunity number, then retry the detail endpoint with the returned key.
- `429`: honor `Retry-After` when present and reduce request frequency.
- `5xx`: retry once with backoff, then report the service interruption.

Read [references/api.md](references/api.md) for the complete parameter, sorting, response, and pagination reference.
