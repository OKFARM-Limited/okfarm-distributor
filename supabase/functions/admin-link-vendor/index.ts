import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  action: "link" | "unlink" | "create_and_link";
  vendor_id: string;
  email?: string;
  password?: string; // for create_and_link
  user_id?: string;  // for link (existing auth user)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await admin
      .from("user_roles").select("role")
      .eq("user_id", caller.id).eq("role", "admin").maybeSingle();
    if (!roleData) return json({ error: "Admin access required" }, 403);

    const body = (await req.json()) as Payload;
    if (!body.action || !body.vendor_id) return json({ error: "Missing fields" }, 400);

    // Verify vendor exists
    const { data: vendor, error: vErr } = await admin
      .from("vendors").select("id, name, email, auth_user_id").eq("id", body.vendor_id).maybeSingle();
    if (vErr || !vendor) return json({ error: "Vendor not found" }, 404);

    if (body.action === "unlink") {
      const { error } = await admin.from("vendors")
        .update({ auth_user_id: null }).eq("id", body.vendor_id);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    let targetUserId: string | undefined;

    if (body.action === "link") {
      if (!body.user_id && !body.email) return json({ error: "user_id or email required" }, 400);
      if (body.user_id) {
        targetUserId = body.user_id;
      } else {
        // Look up auth user by email
        const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) return json({ error: error.message }, 500);
        const found = list.users.find(u => u.email?.toLowerCase() === body.email!.toLowerCase());
        if (!found) return json({ error: "No auth user with that email. Use 'create_and_link' instead." }, 404);
        targetUserId = found.id;
      }
    }

    if (body.action === "create_and_link") {
      if (!body.email || !body.password) return json({ error: "email and password required" }, 400);
      if (body.password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { display_name: vendor.name },
      });
      if (cErr) return json({ error: cErr.message }, 400);
      targetUserId = created.user.id;

      // Grant viewer role minimally so they can authenticate
      await admin.from("user_roles").insert({ user_id: targetUserId, role: "viewer" });
    }

    if (!targetUserId) return json({ error: "Could not resolve user" }, 400);

    // Ensure no other vendor is linked to this user
    const { data: existing } = await admin.from("vendors")
      .select("id, name").eq("auth_user_id", targetUserId).neq("id", body.vendor_id).maybeSingle();
    if (existing) {
      return json({ error: `User already linked to vendor: ${existing.name}` }, 409);
    }

    const { error: uErr } = await admin.from("vendors")
      .update({ auth_user_id: targetUserId, email: body.email || vendor.email })
      .eq("id", body.vendor_id);
    if (uErr) return json({ error: uErr.message }, 500);

    return json({ ok: true, user_id: targetUserId });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
