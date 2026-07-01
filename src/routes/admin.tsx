import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useIsAdmin } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Knot & Nomad" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || roleLoading) {
    return <div className="mx-auto max-w-7xl px-6 py-20 text-muted-foreground">Loading…</div>;
  }
  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-display text-3xl mb-4">Admin access required</h1>
        <p className="text-muted-foreground mb-6">
          Your account is signed in but is not an admin yet. To grant admin access, run this once in your database (Cloud → SQL):
        </p>
        <pre className="bg-muted border border-border p-4 text-xs overflow-x-auto">
{`INSERT INTO public.user_roles (user_id, role)
VALUES ('${user.id}', 'admin');`}
        </pre>
        <p className="mt-4 text-xs text-muted-foreground">After running, refresh this page.</p>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))} className="mt-6 text-xs uppercase tracking-[0.25em] underline">
          Sign out
        </button>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="font-display text-3xl">Knot & Nomad Studio</h1>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))} className="text-xs uppercase tracking-[0.25em] hover:text-accent">
          Sign out
        </button>
      </div>
      <nav className="flex gap-1 border-b border-border mb-10 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.to === "/admin" ? path === "/admin" : path.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`px-4 py-3 text-xs uppercase tracking-[0.25em] border-b-2 transition ${active ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </div>
  );
}
