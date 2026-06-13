/** Map Supabase auth errors to user-friendly messages. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider")
  ) {
    return "That sign-in method is not enabled in Supabase yet. Enable it under Authentication → Providers (Google and/or Email), or use email/password below if Email is enabled.";
  }

  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. Try again or create an account.";
  }

  if (lower.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the Supabase confirmation link.";
  }

  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }

  return message;
}
