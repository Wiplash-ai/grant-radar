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

Load `extension/` as an unpacked extension in Chrome, Edge, Brave, or another Chromium browser. The extension provides:

- toolbar launch into the complete `/search` web app;
- access to the same signed-in favorites and saved-search experience as the website;
- a selection context menu that searches highlighted page text;
- a configurable search-app URL for official, local, or self-hosted use;
- no host permissions, content scripts, or stored API keys.

Package it with:

```bash
npm run extension:zip
```

The ZIP is written to `artifacts/grant-grinder-extension.zip`.

## Architecture

The public project contains no crawler and no commercial API secrets. It consumes the versioned `/v1/grants` contract from the private `Wiplash-ai/grants-api` service.

The campaign hero uses an original Wiplash-generated fictional field scene rather than government or stock photography.

## Disclaimer

Grant Grinder supports discovery. It does not determine eligibility, guarantee funding, or replace the official notice. Users should verify every deadline, requirement, and application instruction at the linked government source.
