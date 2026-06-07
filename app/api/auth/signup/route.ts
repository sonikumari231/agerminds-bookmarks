import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { email, password, handle } = parsed.data;
  const adminClient = createAdminClient();

  // Check handle availability BEFORE creating the user, to give a better UX.
  // The DB UNIQUE constraint is the real guard; this is just a fast pre-flight.
  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "Validation failed", issues: { handle: ["This handle is already taken"] } },
      { status: 422 }
    );
  }

  // Create the Supabase Auth user
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: authData, error: signUpError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // user must confirm via email
    user_metadata: { handle },
  });

  if (signUpError || !authData.user) {
    console.error("[POST /api/auth/signup] createUser:", signUpError);
    // Supabase returns a generic error if the email is already registered;
    // we surface a safe message rather than confirming which emails exist.
    return NextResponse.json(
      { error: "Could not create account. The email may already be registered." },
      { status: 400 }
    );
  }

  // Update the auto-generated profile to use the chosen handle.
  // The DB trigger creates a profile automatically on user insert, but uses a
  // derived handle from the email. We overwrite it here with the user's choice.
  const { error: profileError } = await adminClient
    .from("profiles")
    .update({ handle, display_name: handle })
    .eq("id", authData.user.id);

  if (profileError) {
    // Handle collision (race condition): extremely rare but possible
    console.error("[POST /api/auth/signup] profile update:", profileError);
    // Clean up the orphaned auth user so the email isn't "taken" permanently
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json(
      { error: "Validation failed", issues: { handle: ["This handle is already taken"] } },
      { status: 422 }
    );
  }

  // Generate an email confirmation link and send our branded welcome email
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
      options: { redirectTo: `${appUrl}/auth/confirm` },
    });

  if (!linkError && linkData?.properties?.action_link) {
    await sendWelcomeEmail({
      to: email,
      handle,
      confirmationUrl: linkData.properties.action_link,
    });
  } else {
    // Non-fatal: log but don't fail signup — Supabase also sends its own
    // confirmation email if "Confirm email" is enabled in the dashboard.
    console.error("[POST /api/auth/signup] generateLink:", linkError);
  }

  return NextResponse.json({ message: "Account created! Check your email to confirm." }, { status: 201 });
}
