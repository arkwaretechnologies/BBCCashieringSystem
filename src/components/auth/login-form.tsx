"use client";

import { useState } from "react";
import { toast } from "sonner";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await loginAction(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    // Full page navigation ensures the session cookie is sent on the next request
    window.location.href = "/";
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>BBC Cashiering System</CardTitle>
        <CardDescription>Sign in to manage student ledger and school expenses.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required autoComplete="username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Default admin: admin / admin123 (change after first login)
        </p>
      </CardContent>
    </Card>
  );
}
