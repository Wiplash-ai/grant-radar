# Grant Grinder privacy compliance notes

This is an internal launch checklist, not legal advice.

## Current data inventory

| Data | Collection | Purpose | Storage or processor | Current retention |
| --- | --- | --- | --- | --- |
| Search terms and filters | User submits a website, extension, or API query | Return grant matches; provide previous searches for signed-in users | Processed by the API and stored in the signed-in funding desk | Until removed or account deletion; cap is 25 recent searches |
| Funding-desk account | User registers | Authentication and cross-device sync | Private API account store; passwords are scrypt-hashed and sessions are HTTP-only cookies | Until account deletion and required security retention |
| Favorites and saved searches | Signed-in user deliberately saves an item | Funding watchlist and reusable search criteria | Private API account store | Until item or account deletion |
| Extension search-app URL | User changes extension settings | Open official, local, or self-hosted search app | Browser sync storage | Until changed, cleared, or extension removal |
| Selected page phrase | User explicitly invokes context-menu search | Populate one grant query | Search URL and API request | Browser history may retain the opened URL according to browser settings |
| API key and usage | Wiplash.ai or marketplace issues access | Authentication, metering, abuse prevention, billing | API configuration and marketplace systems | While active and as required for security, billing, and disputes |
| Subscriber/account identifiers | API marketplace or direct customer | Entitlement and support | Marketplace and Wiplash.ai systems | Per final marketplace and account-retention configuration |
| IP, user-agent, endpoint, timestamp, response status | Hosting and security infrastructure | Delivery, security, reliability | Hosting/reverse-proxy logs | Not yet documented as a fixed schedule |
| Support email and message | User contacts support | Respond to support and rights requests | Wiplash.ai mail systems | Until resolved and as needed for records/legal obligations |

## Legal review required before publication

- [ ] `[LEGAL REVIEW REQUIRED]` Confirm the legal entity operating Wiplash.ai/Wiplash Labs and publish its required business address.
- [ ] `[LEGAL REVIEW REQUIRED]` Confirm applicable U.S. state, GDPR/UK GDPR, and marketplace contractual obligations based on launch geography and customer mix.
- [ ] `[LEGAL REVIEW REQUIRED]` Confirm international transfer language and processor agreements.
- [ ] Name every selected hosting, CDN, error-monitoring, billing, and API marketplace provider in the final processor inventory.
- [ ] Configure and document fixed retention for reverse-proxy, application, security, customer, and billing logs.
- [ ] Implement and test an intake process for access, deletion, correction, opt-out, and appeal requests.
- [ ] Confirm no analytics, advertising SDK, or cookie is added without updating the public policy and consent behavior where required.
- [ ] Confirm API key deletion/revocation and marketplace cancellation behavior.
- [ ] Have qualified counsel review the final policy before browser-store or API-marketplace submission.

## Product checks

- [x] Website works without an account.
- [x] Extension permissions are limited to storage and context-menu behavior.
- [x] Extension does not inject content scripts.
- [x] Extension stores no API key and requests no host access.
- [x] Account sessions use HTTP-only same-site cookies and passwords are stored only as scrypt hashes.
- [x] Public policy states that Grant Grinder is not a government service.
- [x] Public policy links are present in site navigation.
- [ ] Browser store and each API marketplace listing point to the deployed `/privacy` URL.
- [ ] Add and test account deletion, password recovery, and email verification before general account availability.
