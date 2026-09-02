"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/validation/authSchemas";
import { authApi } from "@/services";
import { setAuthToken } from "@/lib/auth-token";
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

export default function SignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const { shakeControls, shake } = useShake();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
  });

  const onSubmit = useCallback(
    async (data: SignupFormData) => {
      setServerError(null);
      try {
        const res = await authApi.signup({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        setAuthToken(res.data.token);
        queryClient.setQueryData(queryKeys.auth.me(), res.data.user);
        router.push("/dashboard");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Signup failed. Please try again.";
        setServerError(message);
        shake();
      }
    },
    [queryClient, router, shake]
  );

  return (
    <AuthCard screenKey="signup" className="w-full">
      <div className="px-6 py-8 sm:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-h2 font-bold text-text-primary mb-1.5">
              Create your account
            </h2>
            <p className="text-body-sm text-text-muted mb-6">
              Start splitting expenses with friends
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
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
              </motion.div>

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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
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
                  Create account
                </Button>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="text-body-sm text-text-muted text-center mt-1"
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
                >
                  Sign in
                </Link>
              </motion.p>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </AuthCard>
  );
}
