SBI — Version 67.72 — Correction « Passer en stock »

Correctif
- Le bouton « Passer en stock » sur la fiche du chariot effectue maintenant directement la transition, avec une seule confirmation.
- Après confirmation, le statut passe de « En fabrication » à « En stock » et l’emplacement devient « Stock 1 » (STOCK1).
- En cas d’erreur Supabase, le message d’erreur est affiché et le statut ne sera pas présenté comme modifié.
- Le bouton « Modifier » reste disponible pour modifier les informations ou changer l’emplacement de stock par la suite.
- Version du script mise à jour dans les pages HTML pour éviter le chargement d’un ancien fichier depuis le cache.

Aucune modification de schéma Supabase ni de script SQL requise.
