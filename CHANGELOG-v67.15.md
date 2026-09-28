# SBI Workflow v67.15 — Live synchronization fix

- Start the global Supabase Realtime listener from the shared authenticated page initializer, so it is active on every authenticated page.
- Mark page-local Realtime events as handled only after the page callback completes, preventing premature suppression of the global fallback.
- Add a 20-second database snapshot fallback for `chariots` and recent `maintenance` records when Realtime is unavailable or not configured.
- Defer automatic reload while a user is typing or submitting a form, then apply the pending refresh when safe.
- Bump HTML asset cache versions to v67.15 so browsers load the corrected JavaScript.
