"use client";

import { useMutation } from "@tanstack/react-query";

type OAuthProvider = "google" | "github" | "facebook";

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

function redirectToOAuth(provider: OAuthProvider): Promise<void> {
  return new Promise(() => {
    const base = API_BASE_URL.replace(/\/api$/, "");
    const baseUrl = base || window.location.origin;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- external OAuth redirect to backend
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  });
}

export function useOAuthLogin() {
  return useMutation({
    mutationFn: redirectToOAuth,
  });
}
