# Grant Grinder

Public web app and Manifest V3 browser extension for searching source-attributed U.S. government grant opportunities through the private Grant Grinder API.

## Web app

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_GRANTS_API_URL` to the API origin. Do not embed a paid customer credential in a public web build; use a public free tier or a same-origin server proxy in production.

The home page introduces the product and includes an embedded search desk. `/search` is the dedicated filtering and results workspace. Search results open a Wiplash-designed opportunity briefing at `/opportunity/:id`, presenting the official description, eligibility, funding terms, assistance listings, application route, grantor contact, documents, and source links supplied by the private API.

The build pre-renders the search workspace, every actionable opportunity route, the developer documentation, and the privacy policy. Refresh the checked-in SEO catalog from a running API before a release:

```bash
npm run seo:sync
npm run check
```

Public integration resources are available at `/search`, `/developers`, `/skills/grant-grinder-api/SKILL.md`, `/llms.txt`, and `/sitemap.xml`.

## Browser extension

Load `extension/` as an unpacked extension in Chrome, Edge, Brave, or another Chromium browser. The extension provides:

- popup grant search;
- open/forecasted filtering;
- official-notice links;
- a selection context menu that searches highlighted page text;
- configurable API origin and key storage.

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
