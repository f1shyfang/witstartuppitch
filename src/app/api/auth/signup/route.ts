import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

import { env } from "~/env";

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

  return NextResponse.json({ success: true });
}
