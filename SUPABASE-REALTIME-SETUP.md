# Activer la synchronisation Supabase Realtime

La version v67.15 écoute les tables `public.chariots` et `public.maintenance`. Pour recevoir les changements instantanément, les deux tables doivent appartenir à la publication `supabase_realtime`.

Dans Supabase : **SQL Editor → New query**, puis exécuter :

```sql
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION 'La publication supabase_realtime n’existe pas dans ce projet.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chariots'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chariots;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'maintenance'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance;
  END IF;
END $$;
```

Vérifier aussi que les comptes connectés ont le droit `SELECT` requis par les politiques RLS sur les lignes qu’ils doivent voir. Realtime respecte les règles d’accès : un utilisateur ne reçoit pas les changements des lignes qu’il ne peut pas lire. Ne désactivez pas RLS pour régler ce problème.

Après déploiement, ouvrir deux navigateurs connectés au site. Modifier un chariot dans le premier : l’autre doit se mettre à jour en quelques secondes. Si la publication Realtime n’est pas active, le contrôle périodique intégré vérifie les données toutes les 20 secondes.
