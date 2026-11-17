# SBI — Public Chariot Sharing

This function creates signed, read-only public links for individual chariot records.

## Security model

- Only a signed-in SBI administrator can create a link (the existing SBI admin email or `sbi_role=admin` metadata).
- Public readers need only the signed token; they cannot query Supabase tables directly through this page.
- Tokens are HMAC-SHA-256 signed and expire after 90 days.
- The function reads one chariot by `qr_id` using the service role and returns an explicit allowlist of detail fields, plus the commercial assignment and current delivery plan reconstructed from that chariot's existing `maintenance` records.
- No database schema, table, policy, or RLS change is required.
- Links are not individually revocable before expiry in this first version. Deleting the chariot makes the link return not found.

## One-time deployment

Generate a strong secret (at least 32 characters) and set it in the existing Supabase project:

```sh
openssl rand -hex 32
supabase secrets set SBI_SHARE_SIGNING_SECRET=<generated-secret>
supabase functions deploy sbi-share-chariot --no-verify-jwt
```

Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. Do not expose the service-role key in the browser.

The `--no-verify-jwt` flag is required because the public page must reach the function without a user session. The function itself verifies administrator identity for the `create` action and verifies the HMAC token for the `view` action.

## Validation

The branch workflow checks:
- Existing `js/app.js` syntax.
- Public page inline JavaScript syntax.
- Edge Function TypeScript via `deno check`.
- No schema, migration, or RLS file changes.

## Privacy note

Anyone holding a valid link can view the fields in `SHARE_FIELDS`, including customer name and observations. Share links only with intended recipients.
