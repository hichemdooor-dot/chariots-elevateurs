SBI Workflow v67.76 — Gestion des chauffeurs

Dans Planning des livraisons, le champ Chauffeur comporte désormais le bouton « Gérer ». Un administrateur peut ajouter un chauffeur, modifier un nom ou supprimer un chauffeur. La liste partagée est enregistrée dans Supabase via la table maintenance, en utilisant un enregistrement de configuration global (qr_id SYSTEM et type Configuration chauffeurs). Les enregistrements de configuration sont exclus de l’historique/notifications existants par leur QR ID SYSTEM.

La liste initiale reste AISSA, YOUNES, BILLAL et HAMZA. Les chauffeurs déjà enregistrés dans une livraison restent inchangés même si un nom est renommé ou supprimé. Aucun SQL supplémentaire n’est requis ; les permissions Supabase déjà utilisées par le planning doivent autoriser la lecture et l’insertion dans maintenance.
