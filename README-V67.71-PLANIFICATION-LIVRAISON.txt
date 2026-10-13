SBI — Version 67.71 — Planification depuis les chariots

Nouveautés
- Ajout du bouton « Planifier la livraison » sur les cartes des chariots non livrés.
- Ajout du même accès sur la fiche détaillée du chariot.
- Le bouton ouvre la page « Planning des livraisons » avec le chariot présélectionné et le formulaire de planification ouvert.
- Si le chariot possède déjà une livraison planifiée, le bouton passe à l'état vert « Livraison planifiée » et est désactivé pour éviter un doublon.
- Les changements de planification sont actualisés via Supabase Realtime, avec une actualisation périodique de secours.
- Le planning existant, les autres étapes du workflow et le module SAV/retours sont conservés.

Notes
- La fonctionnalité réutilise la table maintenance et les règles déjà employées par le planning de livraison.
- Aucun nouveau script SQL n'est nécessaire pour cette modification.
