import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ZeptoMail, buildEmailHtml } from "../_shared/zeptomail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with caller's token to check admin role
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, display_name, role } = await req.json();

    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: "Email, password, and role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user with admin API (auto-confirms email) and must_change_password flag
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        display_name: display_name || email.split("@")[0],
        must_change_password: true
      },
    });

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Assign role
    const { error: roleErr } = await adminClient
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role });

    if (roleErr) {
      return new Response(JSON.stringify({ error: roleErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email with credentials
    let emailSent = false;
    let emailError = null;
    try {
      if (ZeptoMail.isConfigured()) {
        const zm = new ZeptoMail();
        const origin = req.headers.get("origin") || "http://localhost:8081";
        const actionUrl = `${origin}/login`;
        const emailHtml = buildEmailHtml({
          title: "Account Created",
          body: `
            <p>Hello <strong>${display_name || email.split("@")[0]}</strong>,</p>
            <p>An administrator has created your account on Distribo with the role of <strong>${role}</strong>.</p>
            <p>Here are your temporary login credentials:</p>
            <table cellpadding="0" cellspacing="0" style="margin: 20px 0; font-size: 14px;">
              <tr>
                <td style="padding: 4px 8px; font-weight: bold; color: #475569;">Email:</td>
                <td style="padding: 4px 8px; color: #0f172a;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 8px; font-weight: bold; color: #475569;">Password:</td>
                <td style="padding: 4px 8px; color: #0f172a; font-family: monospace; background-color: #f1f5f9; border-radius: 4px;">${password}</td>
              </tr>
            </table>
            <p style="color: #b91c1c; font-weight: 600;">Important Security Advice:</p>
            <p>You will be required to change this temporary password immediately upon your first login.</p>
          `,
          actionUrl,
          actionLabel: "Log In to Distribo",
          footerNote: "This is an automated security notification."
        });

        const result = await zm.send({
          to: email,
          toName: display_name || email.split("@")[0],
          subject: "Your Distribo Account Credentials",
          html: emailHtml
        });
        emailSent = result.ok;
        if (!result.ok) {
          emailError = result.error;
          console.error(`[admin-create-user] Failed to send email to ${email}:`, result.error);
        } else {
          console.log(`[admin-create-user] Successfully sent credentials email to ${email}`);
        }
      } else {
        console.warn("[admin-create-user] ZeptoMail is not configured. Skipping email sending.");
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[admin-create-user] Error sending email:", err);
      emailError = err.message;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id, 
        email,
        email_sent: emailSent,
        email_error: emailError
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
