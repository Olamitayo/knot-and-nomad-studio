# Multi-garment custom orders

The four-step journey uses controlled `OrderBrief.items` state. Stable garment IDs keep design fields, uploaded references and size quantities isolated. One to five distinct types are allowed. All selected garments must be configured; each design requires a concept, decoration method and position. Each selected size needs an integer quantity from 1–100,000. Totals are derived again on the server. Custom measurements and an Other colour description are required when selected.

## Database and API

Apply `supabase/migrations/20261104000000_custom_order_items.sql` before releasing this frontend. The migration has not been applied to a remote database. It adds canonical JSONB `items` plus consultation fields to `custom_orders`. It does not rewrite existing orders. Older orders retain `items = []` and their original scalar fields.

`submitCustomOrder` accepts the new camelCase brief and the previous snake_case single-garment payload. For new submissions, legacy design fields mirror the first item, `clothing_type` lists the garment types, and `quantity` is the overall total. Consumers should prefer `items` whenever nonempty.

Consultations are stored on the same order record; no separate consultation reference is needed. Status values are Requested, Assigned, In progress and Completed. New requests start as Requested. Preferred times are interpreted in Africa/Lagos (UTC+1) and must be in the future. Scheduling is a request, not a confirmed appointment. Consultation never confirms production: quotation and deposit approval remain required. No staff assignment UI is included.

## Notifications and configuration

The existing Resend notification pipeline now labels each garment separately, including colour, size quantities, measurements, design, references and total. Consultation preferences and the production disclaimer are included. Multiline values retain line breaks. This repository has no separate Zoho API or SMTP integration; notifications go to the existing studio recipients through Resend, including if those mailboxes are hosted by Zoho.

Existing configuration remains required:

- Server: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Browser uploads: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (server fallback uses `SUPABASE_PUBLISHABLE_KEY`).
- Email: `RESEND_API_KEY`; optionally `RESEND_FROM_EMAIL` for a verified sender. Without an API key the existing mail helper skips notifications while saving the brief.
- Supabase `design-uploads` bucket and upload permissions from the existing migration. This bucket remains public; the form explains this before upload. Removing a reference detaches it from the brief; it does not delete the storage object.

No new credentials or mailbox secrets are added to client code. WhatsApp uses the existing number in `src/lib/site.ts` and URL-encodes the summary; tests do not open WhatsApp links.

## Verification

- `npm test`: eight model/validation/payload tests using Node 22's type stripping.
- `npm run test:e2e`: six Playwright tests across 1280px desktop and 375px mobile. Requires installed Google Chrome. A local Vite fixture aliases submission and storage modules to in-memory mocks; no real orders, uploads or messages are sent.
- `npm run lint` and `npm run build`.
- `node_modules/.bin/tsc --noEmit`: repository-wide type checking currently reports pre-existing errors in the auth email preview, auth email webhook and Paystack webhook; no errors in this change's files.

Browser coverage includes keyboard garment selection, the five-item limit, independent design uploads, removal, navigation retention, size totals, review content, consultation choices, scheduling validation, WhatsApp encoding, submission payloads, the absence of premature errors, and correction/retry after a mocked failure.
