import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Knot & Nomad" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else {
        toast.success("Welcome back.");
        navigate({ to: "/admin" });
      }
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <p className="eyebrow mb-3">Account</p>
      <h1 className="font-display text-4xl mb-8">{mode === "signin" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="eyebrow mb-2 block">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border px-3 py-3 text-sm" />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border px-3 py-3 text-sm" />
        </label>
        <button disabled={busy} className="btn-pill w-full bg-foreground text-primary-foreground py-4 text-xs font-bold uppercase tracking-[0.25em] hover:bg-accent hover:text-accent-foreground transition disabled:opacity-50">
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
        {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
      <Link to="/" className="mt-4 block text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">← Back home</Link>
    </div>
  );
}
