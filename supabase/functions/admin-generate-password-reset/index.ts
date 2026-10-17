import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESET_REDIRECT_URL =
  "https://hichemdooor-dot.github.io/chariots-elevateurs/reinitialiser-mot-de-passe.html";
const PRIMARY_ADMIN_EMAIL = "hichemdooor@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const bearerToken = tokenMatch?.[1]?.trim() || "";
    if (!bearerToken) {
      return json({ error: "Session administrateur manquante." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("admin-generate-password-reset: required Supabase environment variable missing");
      return json({ error: "Configuration serveur incomplète." }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } =
      await userClient.auth.getUser(bearerToken);

    if (userError || !userData.user) {
      console.warn("admin-generate-password-reset: caller token rejected", userError?.message || "No user returned");
      return json({ error: "Session invalide. Reconnectez-vous puis réessayez." }, 401);
    }

    const callerEmail = String(userData.user.email || "").trim().toLowerCase();
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile, error: profileError } = await adminClient
      .from("sbi_user_profiles")
      .select("role,disabled")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("admin-generate-password-reset: admin profile lookup failed", profileError.message);
      return json({ error: "Impossible de vérifier les droits administrateur." }, 500);
    }

    if (profile?.disabled === true) {
      return json({ error: "Ce compte administrateur est désactivé." }, 403);
    }

    const isPrimaryAdmin = callerEmail === PRIMARY_ADMIN_EMAIL;
    const isProfileAdmin = String(profile?.role || "").toLowerCase() === "admin";
    if (!isPrimaryAdmin && !isProfileAdmin) {
      return json({ error: "Accès administrateur requis." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const requestId = String(body?.requestId || "").trim();
    const suppliedEmail = String(body?.email || "").trim().toLowerCase();
    if (!requestId || !suppliedEmail) {
      return json({ error: "Identifiant de demande et adresse email requis." }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suppliedEmail)) {
      return json({ error: "Adresse email invalide." }, 400);
    }

    const { data: requestRow, error: requestError } = await adminClient
      .from("maintenance")
      .select("id,type,travaux")
      .eq("id", requestId)
      .eq("type", "Demande changement mot de passe")
      .maybeSingle();

    if (requestError) {
      console.error("admin-generate-password-reset: password request lookup failed", requestError.message);
      return json({ error: "Impossible de vérifier cette demande." }, 500);
    }
    if (!requestRow) {
      return json({ error: "Demande introuvable ou déjà traitée." }, 404);
    }

    const emailMatch = String(requestRow.travaux || "").match(/^Email\s*:\s*([^\r\n]+)/im);
    const requestedEmail = String(emailMatch?.[1] || "").trim().toLowerCase();
    if (!requestedEmail || requestedEmail !== suppliedEmail) {
      return json({ error: "L'adresse email ne correspond pas à cette demande." }, 400);
    }

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: requestedEmail,
      options: { redirectTo: RESET_REDIRECT_URL },
    });

    if (linkError) {
      console.warn("admin-generate-password-reset: recovery link generation failed", linkError.message);
      if (/not found|no user|user.*exist/i.test(linkError.message)) {
        return json({ error: "Aucun compte Auth ne correspond à cette adresse email." }, 404);
      }
      return json({ error: "Supabase n'a pas pu générer le lien de récupération." }, 400);
    }

    const recoveryUrl = linkData?.properties?.action_link;
    if (!recoveryUrl) {
      console.error("admin-generate-password-reset: generateLink returned no action_link");
      return json({ error: "Supabase n'a pas retourné de lien de récupération." }, 500);
    }

    // Do not log or send the recovery URL. It is returned only to the authorized admin.
    return json({ ok: true, email: requestedEmail, recoveryUrl }, 200);
  } catch (error) {
    console.error(
      "admin-generate-password-reset: unexpected error",
      error instanceof Error ? error.message : "Unknown error",
    );
    return json({ error: "Erreur serveur lors de la génération du lien." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
