"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { buttonStyles, inputStyles, cardStyles } from "@/lib/styles";
import { useTranslations } from "next-intl";

export default function LoginForm() {
  const t = useTranslations("admin.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(t("error"));
      } else if (result?.ok) {
        router.push(callbackUrl as import("next").Route);
        router.refresh();
      }
    } catch (_err) {
      setError(t("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cardStyles("default") + " w-full max-w-[400px] space-y-8 p-8"}>
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-bold text-white">
          Clarity<span className="text-brand-500">Scans</span>
        </h1>
        <p className="font-mono text-sm uppercase tracking-widest text-gray-400">{t("title")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="ml-1 text-sm font-medium text-gray-300">
            {t("username")}
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputStyles(error ? "error" : "default")}
            disabled={isLoading}
            required
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="ml-1 text-sm font-medium text-gray-300">
            {t("password")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputStyles(error ? "error" : "default")}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 transition-colors hover:text-white"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="animate-in fade-in slide-in-from-top-1 flex items-center gap-3 rounded-xl border border-medical-red/20 bg-medical-red/10 p-4 text-sm text-medical-red"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={buttonStyles("primary", "lg")}
          aria-busy={isLoading}
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : t("submit")}
        </button>
      </form>

      <div className="pt-4 text-center">
        <p className="text-xs text-gray-500">Patient-facing app does not require login</p>
      </div>
    </div>
  );
}
