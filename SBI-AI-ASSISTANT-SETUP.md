# SBI Assistant IA — configuration Groq

L'assistant IA est disponible via le bouton flottant « Assistant IA » sur les pages qui chargent `js/shell.js`. La fonction Edge `sbi-ai-assistant` est authentifiée et fonctionne avec Groq.

## Activation requise

1. Dans le tableau de bord Supabase, ouvrez **Edge Functions → Secrets**.
2. Ajoutez le secret `GROQ_API_KEY` avec votre clé API depuis le tableau de bord Groq: https://console.groq.com/keys
3. Vérifiez que les variables `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont disponibles pour la fonction.
4. Déployez la fonction `supabase/functions/sbi-ai-assistant/index.ts` sous le nom `sbi-ai-assistant`. Vous pouvez le faire depuis le dossier du projet avec la Supabase CLI:
   ```bash
   supabase functions deploy sbi-ai-assistant
   ```
5. Ouvrez le site, connectez-vous, puis testez l'assistant avec une question comme « Combien de chariots sont en stock ? ».

## Ce que l'assistant peut faire

- Répondre aux questions sur le parc, le stock, les chariots livrés, les clients et les interventions.
- Aider à analyser les ventes par commercial (IDRIS, MOHAMED, DJOUDI) lorsque le champ commercial est renseigné dans les données.
- Aider à comprendre le planning des livraisons et l'utilisation du site.
- Répondre en français, en arabe ou en anglais selon la langue de la question.

## Sécurité et limites

- L'assistant est en lecture seule: il ne modifie aucun chariot ni aucune livraison.
- Les lectures de `chariots` et `maintenance` utilisent la session de l'utilisateur connecté; les politiques RLS Supabase continuent de s'appliquer.
- Les réponses utilisent au maximum les 500 chariots et 300 interventions les plus récents. L'assistant doit signaler quand les données sont incomplètes.
- Aucun changement de schéma Supabase n'est nécessaire.
- Ne placez jamais la clé Groq dans le HTML, le JavaScript du navigateur ou dans GitHub. Gardez-la dans les secrets Supabase.
- L'utilisation de l'API Groq est soumise aux limites et conditions de votre compte Groq.
