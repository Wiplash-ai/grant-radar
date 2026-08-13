# Grant Grinder API reference

## Endpoints

### `GET /v1/grants`

Search, filter, facet, sort, and paginate current opportunity records.

| Parameter | Values or format | Notes |
| --- | --- | --- |
| `q` | Text, max 200 characters | Searches title, agency, description, eligibility, categories, instruments, and Assistance Listings. Query terms use AND matching. |
| `status` | `open`, `forecasted` | Omit for both. |
| `agency` | Exact facet value | Use `meta.facets.agencies`. |
| `funding_category` | Exact facet value | Examples: `Agriculture`, `Arts`, `Education`, `Health`, `Housing`. |
| `funding_instrument` | Exact facet value | Common values: `Grant`, `Cooperative Agreement`, `Other`, `Procurement Contract`. |
| `eligible_applicant` | Exact facet value | Matches official classifications and concrete applicant groups extracted from eligibility language. Use `meta.facets.eligibleApplicants`. |
| `assistance_listing` | `NN.XXX` | Formerly CFDA number. |
| `min_award` | Non-negative USD number | Keeps records whose maximum award or program funding meets the minimum. |
| `max_award` | Non-negative USD number | Keeps records whose minimum known award does not exceed the maximum. |
| `closes_after` | ISO date or timestamp | Inclusive deadline lower bound. |
| `closes_before` | ISO date or timestamp | Inclusive deadline upper bound. |
| `posted_after` | ISO date or timestamp | Inclusive posting-date lower bound. |
| `posted_before` | ISO date or timestamp | Inclusive posting-date upper bound. |
| `has_funding_amount` | `true`, `false` | Require a published award or program amount. |
| `include_expired` | `true`, `false` | Defaults to `false`. Use only for historical or source-parity research. |
| `sort` | See below | Defaults to `relevance-desc`. |
| `page` | Integer, minimum 1 | Defaults to 1. |
| `limit` | Integer, 1–100 | Defaults to 25. |

Sort values:

- `relevance-desc`
- `close-date-asc`
- `close-date-desc`
- `posted-date-desc`
- `posted-date-asc`
- `award-max-desc`
- `award-min-asc`
- `fit-desc` for record completeness
- `agency-asc`
- `title-asc`

Response envelope:

```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "limit": 25,
    "pages": 1
  },
  "meta": {
    "generated_at": "2026-08-10T16:59:33.631Z",
    "last_refresh_at": "2026-08-10T16:59:33.631Z",
    "facets": {
      "statuses": [],
      "agencies": [],
      "fundingCategories": [],
      "fundingInstruments": [],
      "eligibleApplicants": []
    }
  }
}
```

List records include identifiers, source links, status, dates, awards, a compact description, eligibility, funding categories, instruments, Assistance Listing numbers, and a record-completeness signal.

### `GET /v1/grants/{key}`

Retrieve one complete record. `{key}` can be the returned `key`, its numeric Grants.gov ID, or the opportunity number.

The detail response adds:

- normalized official `description` and derived CommonMark `descriptionMarkdown`;
- official `eligibleApplicants`, extracted `eligibilityHighlights`, and complete additional eligibility terms;
- total program funding and award terms;
- grantor contact, email, and normalized phone actions in `grantorContactPhones`;
- Assistance Listings;
- funding instruments and activity categories;
- application instructions;
- official documents and additional program links when available;
- Grants.gov source URL and verification timestamp.

### `POST /v1/matches`

Rank current opportunities against a reusable organization profile. The JSON body accepts `keywords`, `applicant_types`, `funding_categories`, `agencies`, `min_award`, `max_days_to_close`, and `limit` (1–50). Each result includes the normalized grant, a 0–100 `matchScore`, `matchReasons`, and `cautions`. Scores organize source data; they do not determine eligibility.

### `GET /v1/changes`

Read additions, material field updates, and removals observed during the daily refresh. Use `since` with an ISO timestamp, optionally filter comma-separated `type=added,updated,removed`, and follow `pagination.next_cursor`. Events are retained for 90 days.

### `GET /v1/grants/{key}/checklist`

Generate a source-linked readiness checklist covering the official notice, applicant eligibility, deadline, registrations, forms, budget, cost sharing, and linked source documents. Treat every item as a preparation aid and verify it against the controlling notice.

### `GET /v1/meta`

Retrieve catalog counts, source coverage, daily refresh metadata, and public source health. Use this endpoint for monitoring or to report catalog freshness.

### `GET /openapi.json`

Retrieve the OpenAPI 3.1 contract for code generation and marketplace import.

## Attribution and safety

Grant Grinder normalizes public U.S. government data. It does not award grants, accept applications, determine eligibility, or guarantee funding. Preserve and present `officialUrl`; the official notice controls.

Privacy policy: `https://labs.wiplash.ai/grants/privacy`
