# Grant Grinder browser-store listing draft

Status: prepare and save drafts only. Do not submit for review or publish until the Wiplash ad/demo video is approved.

## Product identity

- Name: `Grant Grinder`
- Version: `0.5.1`
- Language: `English (United States)`
- Chrome category: `Tools`
- Microsoft Edge category: `Productivity`
- Firefox category: `Search Tools`
- Opera category: `Productivity`
- Homepage: `https://labs.wiplash.ai/grants/`
- Support URL: `https://labs.wiplash.ai/grants/`
- Support email: `support@wiplash.ai`
- Privacy policy: `https://labs.wiplash.ai/grants/privacy/`
- Promotional video: `https://www.youtube.com/watch?v=LhmkM0y8-R8`
- Mature content: `No`
- Paid features required for the extension shown here: `No`

## Short description

Keep a draggable federal-grant search widget beside the work already in your browser.

## Full description

Grant Grinder puts the current U.S. federal funding registry beside the work already happening in your browser.

Press the toolbar button to open a compact, draggable search widget over the current page. Search current opportunities, filter by status, sort results, expand a result for a quick summary, and open the complete Wiplash-designed opportunity briefing in a new tab.

Features:

- Search current U.S. federal grant opportunities without leaving the page you are using
- Drag the fixed-size widget wherever it is useful, then hide it with the toolbar button
- Expand search results for deadlines, funding signals, applicant groups, and summaries
- Open the complete Grant Grinder search app or an individual opportunity briefing in a new tab
- Search selected page text from the browser context menu
- See similar opportunities when the widget is opened on a Grant Grinder opportunity page
- Access favorite opportunities and saved searches when already signed in to Grant Grinder
- Keep widget position, recent query, status, and sort preferences in browser storage

Grant Grinder has no ads and no extension analytics. It does not sell user data, read arbitrary browsing history, store API keys, or execute remote code. Search text and filters are sent to the first-party Grant Grinder service only to return the requested results. Selected page text is sent only after the user explicitly chooses the Grant Grinder context-menu action.

Grant Grinder supports discovery and research. It does not determine eligibility, guarantee funding, submit applications, or replace the official notice. Verify every deadline, requirement, and application instruction at the linked government source.

## Single purpose

Grant Grinder helps users discover and compare current U.S. federal grant opportunities from a draggable browser search widget.

## Permission justifications

### `storage`

Stores the configured Grant Grinder app URL, widget position, recent search query, status, and sort preference in browser storage. It can also hold a short-lived local cache of the user's Grant Grinder favorites and saved searches after those records are retrieved from an existing first-party signed-in session.

### `contextMenus`

Adds one user-triggered command for searching Grant Grinder with text the user has explicitly selected on a page.

### `activeTab`

Provides temporary access to the current ordinary webpage only after the user presses the Grant Grinder toolbar button. This lets the extension insert or toggle the widget without requesting persistent access to every website.

### `scripting`

Inserts the packaged widget into the user-activated tab. On a `labs.wiplash.ai/grants` page only, it can also make a first-party page-context request so the widget can reflect the user's existing signed-in favorites and saved searches without reading or copying the session cookie.

### `https://labs.wiplash.ai/grants/*`

Connects to the public Grant Grinder search and opportunity-detail API, opens first-party app pages, and—only when an existing Grant Grinder page is available—retrieves the signed-in user's funding-desk records through that page's normal session. The extension requests no persistent host access to arbitrary websites.

### Web-accessible widget resources

The packaged widget HTML, CSS, JavaScript, and radar mark are exposed to the active page solely so the extension can render its isolated iframe there after a toolbar click. Each widget instance uses a random message token, and webpage messages cannot invoke privileged extension operations without that token.

## Remote code

No. All executable JavaScript, HTML, CSS, and icons ship inside the extension archive. The Grant Grinder API returns structured grant records and account-library data only; no remote string is executed as code.

## Data-use declarations

- Search terms and filters: sent to the first-party Grant Grinder API when the user runs a search so matching grant records can be returned.
- Selected website text: sent as a Grant Grinder search term only after the user explicitly selects the extension's context-menu command.
- Current Grant Grinder opportunity: the opportunity identifier visible in a first-party Grant Grinder URL is used to request similar funding opportunities when the widget opens there.
- Account information: if the user is already signed in on a Grant Grinder page, the extension can retrieve the user's name or email, favorite opportunities, and saved searches for display in the widget. The extension cannot read the session cookie. A short-lived copy may be held locally for up to 15 minutes.
- Local settings: widget position, configured app URL, recent query, status, and sort are stored in browser storage.
- Advertising, analytics, profiling, credit decisions, lending, sale of data, or data brokerage: none.

## Firefox data-collection manifest

The Firefox package supports Firefox desktop 140 and later and declares these required built-in consent categories because transmitting them is necessary for the user-invoked search experience:

- `searchTerms`: search text and filters submitted to Grant Grinder.
- `websiteContent`: selected page text submitted through the explicit context-menu action.
- `browsingActivity`: the identifier of a first-party Grant Grinder opportunity page used for similar-opportunity results.

No technical or interaction telemetry is collected. Firefox uses `grant-grinder@wiplash.ai` as the fixed add-on ID.

## Reviewer steps

1. Install the extension. No account or API key is required.
2. Open an ordinary HTTPS page and press the Grant Grinder toolbar button.
3. Confirm the draggable widget appears and returns current opportunities.
4. Search for `rural health`, change Status to `Forecasted`, and change the sort order.
5. Expand a result and open its opportunity briefing in a new tab.
6. Select a phrase on the page, right-click it, and choose the Grant Grinder search command.
7. Open a Grant Grinder opportunity page and press the toolbar button to confirm similar opportunities appear.
8. Optional account test: sign in at the homepage, save a search or favorite an opportunity, then reopen the widget on a Grant Grinder page and select `My desk`.

The public search, result summaries, and opportunity briefings require no account, reviewer credential, paid subscription, or customer API key.

## Store-specific draft notes

### Chrome Web Store

- Upload `artifacts/packages/grant-grinder-chrome-v0.5.1.zip`.
- Use `icon128.png`, at least one 1280 x 800 screenshot, and `promo-small-440x280.png`.
- Complete Store listing, Privacy practices, and Distribution, then leave the item in Draft.
- Do not click `Submit for review` or any publish action.
- Use `https://www.youtube.com/watch?v=LhmkM0y8-R8` as the global promotional video.

### Microsoft Edge Add-ons

- Upload `artifacts/packages/grant-grinder-edge-v0.5.1.zip`.
- Complete Package, Properties, Privacy, and the English (United States) Store listing.
- Save the submission in `In draft`; do not click `Publish`.
- Use `https://www.youtube.com/watch?v=LhmkM0y8-R8` as the YouTube video URL.

### Firefox Add-ons

- Use `artifacts/packages/grant-grinder-firefox-v0.5.1.xpi`.
- The packaged source is readable, unminified JavaScript with no bundler output, so a separate source-code upload is not required.
- AMO accepted the upload as the resumable `grant-grinder` draft and validated it with no errors and one desktop-only compatibility warning.
- The draft's final details form has no save action before `Submit Version`, so keep the listing copy in this file and stop before that button. Do not submit the version merely to persist the product-page fields.
- AMO does not expose a video field in the initial version flow. Add `https://www.youtube.com/watch?v=LhmkM0y8-R8` to the product-page media or description after the owner authorizes `Submit Version`.

### Opera Add-ons

- Upload `artifacts/packages/grant-grinder-opera-v0.5.1.zip`.
- Opera requires the exact 64 x 64 `icon64.png`; use the three 1280 x 800 screenshots and `promo-opera-300x188.png` for the remaining media.
- Complete General, Translations, Media, and Promotional Image, then stop before `Submit changes`.
- Use `https://www.youtube.com/watch?v=LhmkM0y8-R8` as the extension video URL.

## Prepared asset inventory

- `icon64.png`
- `icon128.png`
- `icon300.png`
- `icon512.png`
- `screenshots/widget-search-results.png` — 1280 x 800
- `screenshots/widget-result-details.png` — 1280 x 800
- `screenshots/widget-similar-opportunities.png` — 1280 x 800
- `promo-small-440x280.png`
- `promo-marquee-1400x560.png`
- `promo-opera-300x188.png`

## Release gate

- Complete: approved Wiplash ad/demo video published at `https://www.youtube.com/watch?v=LhmkM0y8-R8`.
- Pending: deploy the updated extension section of the privacy policy before any store submission.
- Pending: owner review of every saved dashboard draft.
- Explicitly prohibited in this preparation pass: submit for review, publish, or release to testers.
