# SBI v67.18 — Live search suggestions

- Added a shared live type-ahead suggestion panel to operational search fields throughout the site.
- Suggestions update as the user types and match chassis, QR ID, serial number, engine/type/number, client, capacity, mast, fork, status, stock location, and color.
- Exact chassis/QR matches and prefix matches are prioritized. Up to eight suggestions are shown.
- Selecting a suggestion opens the matching chariot record; stock, preparation, and planned-delivery pages preserve their return context.
- Added keyboard support (Arrow Up/Down, Enter, Escape), accessible listbox/option semantics, outside-click dismissal, and responsive positioning.
- Kept the dashboard's existing global-search suggestions, the global-search results page, and the delivery modal's dedicated selector intact.
- Added local CSS only; no external icon or autocomplete dependency.
- Updated cache-busting query strings to v67.18.
