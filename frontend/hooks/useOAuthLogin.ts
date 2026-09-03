"use client";

import { useMutation } from "@tanstack/react-query";

type OAuthProvider = "google" | "github" | "facebook";

function redirectToOAuth(provider: OAuthProvider): Promise<void> {
  return new Promise(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- external OAuth redirect to backend
    window.location.href = `${baseUrl}/api/auth/${provider}`;
  });
}

export function useOAuthLogin() {
  return useMutation({
    mutationFn: redirectToOAuth,
  });
}
