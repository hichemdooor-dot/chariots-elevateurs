SBI v67.47 — Mot de passe oublié → demande à l’administrateur

Le bouton « Forgot Password? » de la page de connexion n’envoie plus d’email de réinitialisation.
Il enregistre une ligne « Demande changement mot de passe » dans la table Supabase public.maintenance.
L’administrateur la retrouve dans Gestion utilisateurs → Demandes de changement de mot de passe.

Activation requise pour les demandes envoyées sans session :
1. Ouvrir Supabase → SQL Editor.
2. Exécuter le fichier SUPABASE_PASSWORD_CHANGE_REQUEST_ANON_POLICY.sql inclus dans cette archive.
3. Publier les fichiers du site.

La politique SQL autorise uniquement l’insertion du type de demande dédié, sans permettre la lecture,
la modification ou la suppression anonyme des lignes. Vérifier les politiques RLS déjà présentes :
les politiques permissives PostgreSQL sont combinées par OR, donc toute ancienne politique anon
plus large doit être retirée ou resserrée par l’administrateur Supabase.

La demande contient l’adresse email saisie et le motif standard « Mot de passe oublié ».
Aucun mot de passe n’est demandé ni transmis.
