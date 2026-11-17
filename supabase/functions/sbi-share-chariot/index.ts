import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SHARE_FIELDS = "qr_id,chassis,serial_number,client,engine,engine_number,capacity,lifting_height,mast_type,fork_dimension,tire_type,color,status,stock,created_at,delivery_date,observations";
const ADMIN_EMAIL = "HICHEMDOOOR@GMAIL.COM";
const TOKEN_LIFETIME_SECONDS = 90 * 24 * 60 * 60;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromBase64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
async function createShareToken(qrId: string, secret: string) {
  const payload = base64url(new TextEncoder().encode(JSON.stringify({
    qr_id: qrId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
  })));
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret), new TextEncoder().encode(payload));
  return payload + "." + base64url(new Uint8Array(signature));
}
async function readShareToken(token: string, secret: string) {
  if (token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  let valid = false;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      fromBase64url(parts[1]),
      new TextEncoder().encode(parts[0]),
    );
  } catch {
    return null;
  }
  if (!valid) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64url(parts[0])));
    if (typeof payload.qr_id !== "string" || !payload.qr_id || !Number.isInteger(payload.exp)) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return { qr_id: payload.qr_id as string };
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const secret = Deno.env.get("SBI_SHARE_SIGNING_SECRET");
    if (!supabaseUrl || !anonKey || !serviceKey || !secret || secret.length < 32) {
      return json({ error: "Le service de partage n'est pas encore configuré par SBI." }, 503);
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (action === "create") {
      const accessToken = (req.headers.get("Authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
      if (!accessToken) return json({ error: "Connexion administrateur requise." }, 401);
      const authClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: "Bearer " + accessToken } },
      });
      const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
      const user = userData?.user;
      let role = String(user?.app_metadata?.sbi_role || user?.user_metadata?.sbi_role || "").toLowerCase();
      let disabled = false;
      if (user) {
        try {
          const { data: sbiStatus, error: statusError } = await authClient.rpc("get_my_sbi_status");
          if (!statusError && sbiStatus) {
            role = String(sbiStatus.role || role).toLowerCase();
            disabled = !!sbiStatus.disabled;
          }
        } catch {
          // Fall back to trusted auth metadata when the role RPC is unavailable.
        }
      }
      const isAdmin = !!user && !disabled && (String(user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase() || role === "admin");
      if (userError || !isAdmin) return json({ error: "Seul un administrateur SBI peut créer un lien public." }, 403);

      const qrId = String(body?.qr_id || "").trim();
      if (!qrId || qrId.length > 100) return json({ error: "Identifiant du chariot invalide." }, 400);
      const { data: chariot, error } = await adminClient.from("chariots")
        .select("qr_id").eq("qr_id", qrId).maybeSingle();
      if (error) {
        console.error("sbi-share-chariot create lookup failed", error.message);
        return json({ error: "Impossible de vérifier ce chariot." }, 500);
      }
      if (!chariot) return json({ error: "Chariot introuvable." }, 404);
      return json({ token: await createShareToken(qrId, secret), expires_in: TOKEN_LIFETIME_SECONDS });
    }

    if (action === "view") {
      const token = String(body?.token || "");
      const payload = await readShareToken(token, secret);
      if (!payload) return json({ error: "Ce lien est invalide ou a expiré." }, 401);
      const { data, error } = await adminClient.from("chariots")
        .select(SHARE_FIELDS).eq("qr_id", payload.qr_id).maybeSingle();
      if (error) {
        console.error("sbi-share-chariot public read failed", error.message);
        return json({ error: "Impossible de charger cette fiche pour le moment." }, 500);
      }
      if (!data) return json({ error: "Ce chariot n'existe plus ou n'est plus disponible." }, 404);

      // Rebuild only the commercial assignment and delivery plan shown on the private fiche.
      const { data: relatedRows, error: relatedError } = await adminClient.from("maintenance")
        .select("id,date,type,travaux,created_at")
        .eq("qr_id", payload.qr_id)
        .in("type", ["Commercial responsable", "Planification livraison", "Annulation planification livraison"])
        .order("created_at", { ascending: true })
        .limit(1000);
      if (relatedError) {
        console.error("sbi-share-chariot related details failed", relatedError.message);
        return json({ error: "Impossible de charger les détails associés à cette fiche." }, 500);
      }
      let commercialName = "";
      const commercialRows = (relatedRows || []).filter((row: Record<string, unknown>) => row.type === "Commercial responsable");
      if (commercialRows.length) {
        try {
          const latest = commercialRows[commercialRows.length - 1] as Record<string, unknown>;
          commercialName = String((JSON.parse(String(latest.travaux || "{}")) || {}).commercial || "");
        } catch {
          commercialName = "";
        }
      }
      const plans = new Map<string, Record<string, unknown>>();
      for (const row of relatedRows || []) {
        if (row.type !== "Planification livraison" && row.type !== "Annulation planification livraison") continue;
        try {
          const item = JSON.parse(String(row.travaux || "{}"));
          if (!item?.qr) continue;
          const id = String(item.id || row.id);
          if (row.type === "Annulation planification livraison") plans.delete(id);
          else plans.set(id, {
            date: String(item.date || row.date || ""),
            time: String(item.time || ""),
            driver: String(item.driver || ""),
            destination: String(item.destination || ""),
          });
        } catch {
          // Ignore malformed historical planning entries, as the private fiche does.
        }
      }
      const plannedDelivery = [...plans.values()].filter((item) => item.date).at(-1) || null;
      return json({ chariot: { ...data, commercial_name: commercialName, planned_delivery: plannedDelivery } });
    }

    return json({ error: "Action non reconnue." }, 400);
  } catch (error) {
    console.error("sbi-share-chariot error", error instanceof Error ? error.message : "unknown");
    return json({ error: "Erreur serveur lors du partage." }, 500);
  }
});
