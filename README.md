<p align="center">
  <img src="public/radar-mark.svg" alt="Grant Grinder radar logo" width="132">
</p>

# Grant Grinder

Public web app and Manifest V3 browser extension for searching source-attributed U.S. government grant opportunities through the private Grant Grinder API.

## Web app

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_GRANTS_API_URL` to the API origin. Do not embed a paid customer credential in a public web build; use a public free tier or a same-origin server proxy in production.

The home page introduces the product and includes an embedded search desk. `/search` is the dedicated filtering and results workspace. `/account` provides registration, secure sessions, favorites, saved searches, and previous searches. Search results open a Wiplash-designed opportunity briefing at `/opportunity/:id`, presenting a derived Markdown reader view alongside the official text, extracted applicant groups, clarified funding terms, dial-ready contacts, documents, and source links supplied by the private API.

The build pre-renders the search workspace, every actionable opportunity route, the developer documentation, and the privacy policy. Refresh the checked-in SEO catalog from a running API before a release:

```bash
npm run seo:sync
npm run check
```

Public integration resources are available at `/search`, `/developers`, `/skills/grant-grinder-api/SKILL.md`, `/llms.txt`, and `/sitemap.xml`.

## Browser extension

Load `extension/` as an unpacked extension in Chrome, Edge, Brave, Opera, or another Chromium browser. Store packaging also produces a Firefox-specific Manifest V3 bundle. The extension provides:

- a draggable, fixed-size grant-search widget on the page already being viewed;
- one-click access to the full `/search` app in a new tab;
- signed-in favorites and saved searches when a Grant Grinder web-app session is available;
- similar-opportunity suggestions when opened over a Grant Grinder opportunity page;
- a selection context menu that searches highlighted page text;
- a configurable search-app URL for official, local, or self-hosted use;
- no stored API keys, analytics, ads, remote executable code, or access to arbitrary browsing history.

The extension requests temporary `activeTab` access only after a toolbar click so it can insert the widget into that tab. Its sole persistent host permission is the first-party `https://labs.wiplash.ai/grants/*` origin used by the public registry and, on Grant Grinder pages, the user's existing signed-in funding desk.

Create review-ready Chrome, Edge, Opera, and Firefox archives with:

```bash
npm run extension:stores
```

The versioned archives and SHA-256 checksums are written to `artifacts/packages/`. `npm run extension:zip` remains available for the generic Chromium development ZIP.

Store listing copy, permission explanations, reviewer instructions, and asset requirements are recorded in `store-assets/LISTING.md`.

## Architecture

The public project contains no crawler and no commercial API secrets. It consumes the versioned `/v1/grants` contract from the private `Wiplash-ai/grants-api` service.

The campaign hero uses an original Wiplash-generated fictional field scene rather than government or stock photography.

## Disclaimer

Grant Grinder supports discovery. It does not determine eligibility, guarantee funding, or replace the official notice. Users should verify every deadline, requirement, and application instruction at the linked government source.
