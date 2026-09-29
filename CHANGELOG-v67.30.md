# SBI v67.30

- Fixed smart form behavior after v67.29.
- Replaced mobile-unreliable native datalist client suggestions with a controlled dropdown.
- Live duplicate detection now blocks Save only for an exact chassis + engine + capacity duplicate and cannot be overwritten by generic button-state updates.
- Last-used configuration is no longer silently injected; it is shown as an optional “Utiliser” suggestion.
- Engine prefixes remain editable/removable and are only applied on engine selection or when starting from an empty engine-number field.
- Client/technical text fields remain normalized to uppercase.
- Previous STOCK1 workflow rule is preserved.
