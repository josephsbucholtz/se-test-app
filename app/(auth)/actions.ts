"use server";
 
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  // Intentionally just "required" here, not a length rule — a login
  // attempt should never be rejected by client-side validation logic
  // that's stricter than whatever rule was in place when the account
  // was created.
  password: z.string().min(1, "Password is required."),
});

const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

 
type ActionResult = { error: string } | undefined;
 
export async function login(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
 
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
 
  const supabase = await createClient();
 
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
 
  if (error) {
    // Deliberately vague — don't reveal whether the email exists.
    console.error("Supabase login error:", error.message); // TEMP — remove after debugging
    return { error: "Incorrect email or password." };
  }
 
  // TODO: adjust to wherever your app's main authenticated page is.
  redirect("/typing");
}
 
export async function signup(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
 
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
 
  const supabase = await createClient();
 
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
 
  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with that email already exists." };
    }
 
    return {
      error: "Something went wrong creating your account. Please try again.",
    };
  }
 
  // TODO: adjust based on whether email confirmation is required in
  // your Supabase project settings (Authentication > Providers > Email).
  // If confirmations are on, the user isn't signed in yet — send them
  // somewhere that says "check your email" instead of straight to the app.
  redirect("/login?signupSuccess=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/typing");
}