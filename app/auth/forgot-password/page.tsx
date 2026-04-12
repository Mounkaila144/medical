"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";

const emailSchema = z.object({
  email: z.string().email("Email invalide"),
});

const resetSchema = z.object({
  code: z.string().length(6, "Le code doit contenir 6 chiffres"),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Confirmez votre mot de passe"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const handleSendCode = async (data: EmailFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiClient.post<{ message: string }>("/auth/forgot-password", {
        email: data.email,
      });
      setEmail(data.email);
      setSuccessMessage(result.message);
      setStep("code");
    } catch (err: any) {
      setError(err.data?.message || err.message || "Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post("/auth/forgot-password", { email });
      setSuccessMessage("Un nouveau code a été envoyé sur votre WhatsApp.");
    } catch (err: any) {
      setError(err.data?.message || err.message || "Erreur lors du renvoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post("/auth/reset-password", {
        email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setStep("success");
    } catch (err: any) {
      setError(err.data?.message || err.message || "Code invalide ou expiré");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-brand-cyan/10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/images/logo.png" alt="Clinoo+" width={180} height={54} className="h-14 w-auto" />
          </div>
          <CardTitle className="text-2xl">
            {step === "success" ? "Mot de passe modifié" : "Mot de passe oublié"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Entrez votre email pour recevoir un code de vérification sur votre WhatsApp"}
            {step === "code" && "Entrez le code reçu sur votre WhatsApp et votre nouveau mot de passe"}
            {step === "success" && "Votre mot de passe a été réinitialisé avec succès"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && step === "code" && !error && (
            <Alert className="mb-6">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={emailForm.handleSubmit(handleSendCode)} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Adresse email
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  autoComplete="off"
                  {...emailForm.register("email")}
                  className={emailForm.formState.errors.email ? "border-red-500" : ""}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Un code de vérification sera envoyé sur le WhatsApp associé à votre compte
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer le code
              </Button>

              <div className="text-center">
                <Link href="/auth/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Code + nouveau mot de passe */}
          {step === "code" && (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4" autoComplete="off">
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Code de vérification
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="off"
                  {...resetForm.register("code")}
                  className={`text-center text-lg tracking-widest ${resetForm.formState.errors.code ? "border-red-500" : ""}`}
                />
                {resetForm.formState.errors.code && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...resetForm.register("newPassword")}
                  className={resetForm.formState.errors.newPassword ? "border-red-500" : ""}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...resetForm.register("confirmPassword")}
                  className={resetForm.formState.errors.confirmPassword ? "border-red-500" : ""}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Réinitialiser le mot de passe
              </Button>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(null); setSuccessMessage(null); }}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Changer d'email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-sm text-primary hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Succès */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Button className="w-full" onClick={() => router.push("/auth/login")}>
                Se connecter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
