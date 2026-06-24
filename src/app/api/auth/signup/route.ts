import { createClient } from "@supabase/supabase-js";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().trim().min(1).optional(),
});

const supabaseAuth = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please provide a valid email and password (min. 6 characters)." },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;

  const { data, error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: name ? { data: { full_name: name } } : undefined,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 400 },
    );
  }

  if (data.user.identities?.length === 0) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in." },
      { status: 400 },
    );
  }

  // Hosted Supabase enables email confirmation by default; confirm immediately so
  // password sign-in works right after signup (matches local supabase/config.toml).
  if (!data.user.email_confirmed_at) {
    await db.execute(sql`
      UPDATE auth.users
      SET email_confirmed_at = now()
      WHERE id = ${data.user.id}
        AND email_confirmed_at IS NULL
    `);
  }

  return NextResponse.json({ success: true });
}
