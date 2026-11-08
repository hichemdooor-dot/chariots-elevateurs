// Supabase Edge Function: recognize-handwriting
// Required secrets: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
// Supabase JWT verification is enabled by default for deployed functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    rows: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          chassis: { type: "string", description: "Handwritten chassis number, normally starts with G. Empty if uncertain." },
          engine: { type: "string", description: "Engine brand/type exactly as supported by evidence. Empty if uncertain." },
          capacity: { type: "string", description: "Capacity such as 3T or 3.8T. Empty if uncertain." },
          lifting_height: { type: "string", description: "Lift height such as 3M or 4.3M. Empty if uncertain." },
          color: { type: "string", description: "Color in French if legible. Empty if absent or uncertain." },
          confidence: {
            type: "object",
            additionalProperties: false,
            properties: {
              chassis: { type: "number" }, engine: { type: "number" }, capacity: { type: "number" },
              lifting_height: { type: "number" }, color: { type: "number" }
            },
            required: ["chassis", "engine", "capacity", "lifting_height", "color"]
          },
          uncertain_fields: { type: "array", items: { type: "string", enum: ["chassis", "engine", "capacity", "lifting_height", "color"] } },
          source_text: { type: "string", description: "Short transcription of this handwritten row, if possible." }
        },
        required: ["chassis", "engine", "capacity", "lifting_height", "color", "confidence", "uncertain_fields", "source_text"]
      }
    },
    notes: { type: "string", description: "Mention unreadable or ambiguous parts; do not guess." }
  },
  required: ["rows", "notes"]
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !anonKey || !openAiKey) return json({ error: "Server configuration incomplete. Configure Supabase and OPENAI_API_KEY secrets." }, 503);

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json({ error: "Invalid or expired session" }, 401);

    const adminEmail = (Deno.env.get("SBI_ADMIN_EMAIL") || "HICHEMDOOOR@GMAIL.COM").toLowerCase();
    let role = String(user.app_metadata?.sbi_role || "").toLowerCase();
    if (role !== "admin") {
      const { data: sbiStatus, error: roleError } = await supabase.rpc("get_my_sbi_status");
      if (!roleError && sbiStatus) role = String(sbiStatus.role || "").toLowerCase();
    }
    if (String(user.email || "").toLowerCase() !== adminEmail && role !== "admin") {
      return json({ error: "Administrator access required" }, 403);
    }

    const body = await req.json();
    const imageBase64 = String(body.imageBase64 || "").replace(/^data:image\/[^;]+;base64,/, "");
    const mimeType = String(body.mimeType || "image/jpeg").toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) return json({ error: "Only JPEG, PNG and WebP images are supported" }, 400);
    if (!imageBase64 || imageBase64.length > 11_000_000) return json({ error: "Image is missing or exceeds the 8 MB limit" }, 413);

    const prompt = `Read this photographed handwritten SBI forklift inventory list. It may be handwritten in French and contain columns for chassis number, engine, color, capacity, and lifting height. Read row-by-row, preserving the association between columns. Chassis usually starts with G. Normalize obvious formatting only (for example 3,8 -> 3.8, 4,3m -> 4.3M). Recognize engine names only when supported by the handwriting: ISUZU, MITSUBISHI, XINCHAI, YANMAR. Colors may be Jaune, Orange, Rouge, Vert, Gris. Never invent missing values. If any character or field is ambiguous, return an empty string for that field and include it in uncertain_fields. Confidence values are your estimated confidence from 0 to 1, not a guarantee. Do not infer mast type, stock, client, or fields not visibly written. Ignore logos, printed footer text, dates, and crossed-out entries if clearly cancelled. Extract only actual forklift rows. Return notes for any unreadable rows.`;

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: [{ role: "user", content: [
          { type: "input_text", text: prompt },
          { type: "input_image", image_url: `data:${mimeType};base64,${imageBase64}`, detail: "high" }
        ]}],
        text: { format: { type: "json_schema", name: "sbi_handwritten_forklift_rows", strict: true, schema } },
        max_output_tokens: 5000
      })
    });
    const result = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error("OpenAI request failed", aiResponse.status, result?.error?.type || result?.error?.code);
      return json({ error: "Handwriting recognition failed. Check the OpenAI API configuration and try again." }, 502);
    }
    const outputText = (result.output || []).flatMap((item: any) => item.content || []).find((item: any) => item.type === "output_text")?.text;
    if (!outputText) return json({ error: "The recognition service returned no structured result" }, 502);
    const parsed = JSON.parse(outputText);
    const rows = Array.isArray(parsed.rows) ? parsed.rows.slice(0, 100).map((r: any) => ({
      chassis: String(r.chassis || "").trim().toUpperCase(),
      engine: String(r.engine || "").trim().toUpperCase(),
      capacity: String(r.capacity || "").trim().toUpperCase().replace(",", "."),
      lifting_height: String(r.lifting_height || "").trim().toUpperCase().replace(",", "."),
      color: String(r.color || "").trim(),
      confidence: r.confidence || {},
      uncertain_fields: Array.isArray(r.uncertain_fields) ? r.uncertain_fields : [],
      source_text: String(r.source_text || "")
    })) : [];
    return json({ rows, notes: String(parsed.notes || ""), model: "gpt-4.1" });
  } catch (error) {
    console.error("recognize-handwriting error", error);
    return json({ error: "Unexpected recognition error" }, 500);
  }
});
