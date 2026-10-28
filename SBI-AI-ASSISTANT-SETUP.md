# SBI Assistant IA — configuration

La branche ajoute un bouton flottant « Assistant IA » aux pages qui chargent `js/shell.js` et une fonction Supabase Edge authentifiée.

## Activation requise
1. Déployez `supabase/functions/sbi-ai-assistant/index.ts` comme fonction `sbi-ai-assistant` dans Supabase.
2. Dans les secrets des Edge Functions, ajoutez `OPENAI_API_KEY` avec votre clé API OpenAI. Ne mettez jamais cette clé dans le HTML, le JavaScript du navigateur ou GitHub.
3. Vérifiez que `SUPABASE_URL` et `SUPABASE_ANON_KEY` sont disponibles pour la fonction.
4. Testez sur une preview avant toute fusion vers `main`.

## Limites
- L'assistant est en lecture seule et ne modifie aucun chariot.
- Les enregistrements fournis sont limités aux données déjà chargées côté navigateur; le contexte peut être incomplet et ne représente pas une requête directe à toute la base Supabase.
- Aucun changement de schéma Supabase.
- L'API OpenAI est facturée séparément de l'abonnement ChatGPT.
