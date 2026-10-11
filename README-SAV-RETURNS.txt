SBI — Partie SAV & retours clients

Cette version ajoute une section autonome accessible depuis le menu « SAV & retours ».

Fonctions :
- Recherche d'un chariot par châssis, QR ID, moteur, client, capacité, emplacement ou statut.
- Sélection du chariot avec préremplissage du client connu.
- Dossier de retour : date, problème, état à réception, diagnostic, réparation, pièces, technicien, décision, restitution et observations.
- Recherche des dossiers par texte, statut et période.
- Mise à jour d'un dossier et historique de chaque création/modification.
- Ajout de plusieurs photos (10 Mo maximum par photo), aperçu avant enregistrement et affichage ultérieur via liens signés privés.
- Les dossiers SAV sont stockés dans une table dédiée `sbi_sav_returns` ; les données de chariots, les livraisons et l'historique habituel restent inchangés.

Installation obligatoire pour activer l'enregistrement et les photos :
1. Ouvrir le projet dans Supabase.
2. Aller dans SQL Editor.
3. Ouvrir/coller `SUPABASE_SAV_RETURNS_SETUP.sql` et exécuter une fois avec un compte administrateur du projet.
4. Déployer les fichiers de ce ZIP sur GitHub et actualiser le site.
5. Ouvrir « SAV & retours » > « Pannes & retours clients ».

Le script crée la table dédiée avec RLS activée, et un bucket privé pour les photos. Il ne désactive pas RLS et ne modifie pas la table `maintenance` ni les règles existantes.
