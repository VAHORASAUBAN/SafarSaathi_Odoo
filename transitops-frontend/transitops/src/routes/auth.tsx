import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, ShieldAlert, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/dashboard" });
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await login(email, password);
      if (!res.ok) {
        setError(res.error ?? "Login failed");
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (em: string, pass: string) => {
    setEmail(em);
    setPassword(pass);
    setError("");
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold">TransitOps</div>
            <div className="text-xs text-muted-foreground">Smart Transport Operations Platform</div>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            One platform for your <span className="text-primary">entire fleet</span>.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Vehicles, drivers, dispatch, maintenance, fuel and analytics — with business rules and
            role-based access built in.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Automatic status transitions &amp; dispatch validations</li>
            <li>• Maintenance workflow that locks vehicles from dispatch</li>
            <li>• Fuel efficiency, cost and ROI analytics</li>
          </ul>
        </div>
        <div className="text-xs text-muted-foreground">© 2026 TransitOps</div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">Sign in to your account</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@transitops.io" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <ShieldAlert className="h-4 w-4" /> {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick Login (Backend Test Accounts)
            </p>
            <div className="grid gap-2">
              <button
                onClick={() => quickFill("admin@transitops.com", "admin123")}
                className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-sm hover:border-primary/50"
              >
                <span>Admin</span>
                <span className="text-xs text-muted-foreground">admin@transitops.com</span>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Default password: <code className="rounded bg-muted px-1">admin123</code>
              <br />
              <span className="text-xs">Make sure backend is running on http://localhost:8000</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
