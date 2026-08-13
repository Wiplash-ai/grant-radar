# Grant Grinder browser-store draft status

Checked August 13, 2026. No review, moderation, publishing, or tester-release action was taken.

| Store | Draft identifier | Verified state | Remaining release action |
| --- | --- | --- | --- |
| Chrome Web Store | `jhmfjjpjdkenblmpnnmngeojddmgipbo` | `Draft`; package, listing, privacy, test instructions, distribution, and promotional video saved | Owner review, then click `Submit for review` only with explicit approval |
| Microsoft Edge Add-ons | `99ebf5a4-1f40-406f-8117-2b0bcad8b075` | `In draft`; all submission sections and YouTube video URL complete | Owner review, then click `Publish` only with explicit approval |
| Firefox Add-ons | `grant-grinder` | Resumable initial-version draft; AMO validation completed with no errors and one desktop-only warning | Re-enter the prepared final details, add the approved video to the product page after version creation, then click `Submit Version` only with owner approval |
| Opera Add-ons | package `306062`, extension `jfchjaebnaggnohcbninekegcgnbnpdl` | Dashboard says `there are changes not submitted for the moderators review`; package, category, metadata, icon, screenshots, promo, and video URL saved | Owner review, then click `Submit changes` only with explicit approval |

## Firefox note

AMO creates a resumable draft after package upload, but its initial details screen offers only `Submit Version` or `Cancel and Disable Version`. There is no separate save-draft control for the final product-page fields and no video field in this initial flow. The complete field copy and approved video URL remain in `LISTING.md` so they can be restored at release time without crossing the submission boundary.

## Release gate

- Complete: approved public Wiplash ad/demo video at `https://www.youtube.com/watch?v=LhmkM0y8-R8`.
- Deploy the updated extension section of the Grant Grinder privacy policy; the current public page still describes the earlier launcher-only build.
- Owner review of all four dashboard records.
- Explicit authorization to submit each store record for review.
