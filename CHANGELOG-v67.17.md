SBI v67.17 — Site-wide inline SVG button icons

- Added a local SVG icon layer for action buttons across all HTML pages.
- Added icons for common actions including ready/deliver, edit, QR, export, print, save, reset, refresh, search, filter, user administration, and navigation.
- Added mutation observation so icons are applied to buttons created or refreshed dynamically.
- Kept existing event handlers and action logic unchanged.
- Added shared icon sizing/alignment rules to both global stylesheets, including the separate notifications stylesheet.
- Bumped stylesheet cache keys and loaded the local icon script on every HTML page.
