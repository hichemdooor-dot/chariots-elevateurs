# SBI OpenAI handwriting recognition — deployment

This feature calls OpenAI from a Supabase Edge Function. The OpenAI key is never sent to the browser or committed to GitHub.

## Required one-time setup

1. Create an OpenAI API key in your OpenAI Platform project.
2. In the Supabase project used by SBI, set the server-side secrets (never put these in JavaScript or GitHub):

```bash
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY SBI_ADMIN_EMAIL=HICHEMDOOOR@GMAIL.COM --project-ref hkakedonludcqjgjzkei
```

Supabase supplies `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Edge Functions in the project runtime.

3. Deploy the function from this repository branch:

```bash
supabase functions deploy recognize-handwriting --project-ref hkakedonludcqjgjzkei
```

The function uses the caller's Supabase JWT, verifies the user, and permits the configured administrator email (or an admin role in user/app metadata). Keep the Edge Function JWT verification enabled.

## How to use

1. Open **Nouveau chariot → Importation groupée → Ajouter depuis la caméra**.
2. Take a clear, straight photo with good light.
3. Tap **Analyser l’écriture manuscrite**.
4. Review every extracted value. Yellow rows and low confidence values need special attention.
5. Correct missing/uncertain chassis or engine fields. Existing chassis + engine duplicates are skipped.
6. Confirm the import. Nothing is inserted before this explicit confirmation.

## Important

- The OpenAI API request uses the Responses API with image input and strict Structured Outputs.
- Confidence values are model estimates, not calibrated probabilities. They are review hints, not proof of correctness.
- The Edge Function currently accepts JPEG, PNG and WebP images up to 8 MB.
- The browser compresses camera photos before upload.
- The OpenAI API key must be stored as a Supabase secret. Never expose it in frontend code.
- OpenAI usage is billed to the API project. Configure usage limits/billing in the OpenAI Platform.
- Test with sample photos before using it for operational stock entry.
