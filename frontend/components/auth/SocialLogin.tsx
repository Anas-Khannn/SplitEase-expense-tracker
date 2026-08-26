"use client";

import { motion } from "framer-motion";
import { useOAuthLogin } from "@/hooks/useOAuthLogin";

const providers = [
  { key: "google" as const, label: "Continue with Google", icon: GoogleIcon },
  { key: "github" as const, label: "Continue with GitHub", icon: GitHubIcon },
  { key: "facebook" as const, label: "Continue with Facebook", icon: FacebookIcon },
];

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.03 0 0 4.03 0 9c0 3.977 2.579 7.35 6.154 8.541.45.083.615-.195.615-.43 0-.212-.008-.775-.012-1.52-2.504.544-3.032-1.207-3.032-1.207-.41-1.037-1-1.31-1-1.31-.816-.558.062-.546.062-.546.903.063 1.378.927 1.378.927.803 1.376 2.105.978 2.62.748.081-.581.314-.978.571-1.203-1.998-.227-4.107-.999-4.107-4.45 0-.983.352-1.784.927-2.412-.093-.228-.402-1.14.088-2.375 0 0 .757-.242 2.475.922A8.64 8.64 0 019 4.37a8.64 8.64 0 012.25.303c1.717-1.164 2.473-.922 2.473-.922.491 1.235.182 2.147.089 2.375.576.628.926 1.429.926 2.412 0 3.459-2.112 4.218-4.116 4.442.324.278.613.826.613 1.664 0 1.203-.011 2.175-.011 2.471 0 .237.164.517.62.43C15.424 16.345 18 12.972 18 9c0-4.97-4.03-9-9-9z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="#1877F2" aria-hidden="true">
      <path d="M18 9c0-4.97-4.03-9-9-9S0 4.03 0 9c0 4.492 3.29 8.213 7.594 8.891v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.502 3.4-3.502.984 0 2.014.176 2.014.176v2.215h-1.135c-1.118 0-1.467.693-1.467 1.4V9h2.496l-.399 2.602h-2.097v6.289C14.71 17.213 18 13.492 18 9z"/>
    </svg>
  );
}

export default function SocialLogin() {
  const { mutate: oauthLogin, isPending } = useOAuthLogin();

  return (
    <div className="flex items-center justify-center gap-4">
      {providers.map((p) => (
        <motion.button
          key={p.key}
          type="button"
          aria-label={p.label}
          disabled={isPending}
          onClick={() => oauthLogin(p.key)}
          whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(108, 92, 224, 0.15)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface text-text-primary shadow-xs transition-colors duration-150 hover:border-primary-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:pointer-events-none disabled:opacity-50"
        >
          <p.icon />
        </motion.button>
      ))}
    </div>
  );
}
