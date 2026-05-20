"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { mockSession, persistSession } from "@/lib/auth-session";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/auth-slice";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { login, isLoggingIn } = useAuth();
  const { isAuthenticated, hydrated } = useAppSelector((s) => s.auth);

  const enterWithMockData = () => {
    persistSession(mockSession);
    dispatch(setUser(mockSession.user));
    router.push("/dashboard");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@repairshop.local",
      password: "ChangeMe!123456",
    },
  });

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f4f6f9] p-4 dark:bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border-0 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <CardHeader className="space-y-4 text-center">
          <BrandLogo className="justify-center" />
          <div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your repair shop POS dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => login(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Demo: admin@repairshop.local / ChangeMe!123456
          </p>
          <p className="mt-2 text-center text-sm">
            <button
              type="button"
              onClick={enterWithMockData}
              className="text-primary hover:underline"
            >
              Continue with mock data →
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
