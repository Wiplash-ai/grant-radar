# Grant Radar

Public web app and Manifest V3 browser extension for searching source-attributed U.S. government grant opportunities through the private Wiplash Grants API.

## Web app

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_GRANTS_API_URL` to the API origin. Do not embed a paid customer credential in a public web build; use a public free tier or a same-origin server proxy in production.

Search results open a dedicated Wiplash-designed opportunity briefing at `/opportunity/:id`. The page presents the official description, eligibility, funding terms, assistance listings, application route, grantor contact, documents, and source links supplied by the private API.

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

The ZIP is written to `artifacts/grant-radar-extension.zip`.

## Architecture

The public project contains no crawler and no commercial API secrets. It consumes the versioned `/v1/grants` contract from the private `Wiplash-ai/grants-api` service.

The campaign hero uses an original Wiplash-generated fictional field scene rather than government or stock photography.

## Disclaimer

Grant Radar supports discovery. It does not determine eligibility, guarantee funding, or replace the official notice. Users should verify every deadline, requirement, and application instruction at the linked government source.
