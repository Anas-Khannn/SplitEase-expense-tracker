"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import AuthCard from "@/components/auth/AuthCard";
import SocialLogin from "@/components/auth/SocialLogin";
import { Button, Input } from "@/components/ui";
import { useShake } from "@/hooks/useShake";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const { shakeControls, shake } = useShake();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setServerError(null);
      try {
        const res = await authApi.login({
          email: data.email,
          password: data.password,
        });
        localStorage.setItem("token", res.data.token);
        queryClient.setQueryData(queryKeys.auth.me(), res.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setServerError(message);
        shake();
      }
    },
    [queryClient, router, shake]
  );

  return (
    <AuthCard screenKey="login" className="w-full">
      <div className="px-6 py-8 sm:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-h2 font-bold text-text-primary mb-1.5">
              Welcome back
            </h2>
            <p className="text-body-sm text-text-muted mb-6">
              Sign in to continue to SplitEase
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <SocialLogin />
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default" />
              </div>
              <div className="relative flex justify-center text-caption text-text-muted">
                <span className="bg-surface px-3">or continue with email</span>
              </div>
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit(onSubmit, () => shake())}
            animate={shakeControls}
            noValidate
          >
            <div className="flex flex-col gap-4">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-radius-md bg-danger-100 border border-danger-500/20 px-4 py-3 text-body-sm text-danger-500"
                  role="alert"
                >
                  {serverError}
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-body-sm text-primary-500 hover:text-primary-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isSubmitting}
                  icon={<ArrowRight />}
                  iconPosition="right"
                >
                  Sign in
                </Button>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-body-sm text-text-muted text-center mt-1"
              >
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
                >
                  Create account
                </Link>
              </motion.p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </AuthCard>
  );
}
