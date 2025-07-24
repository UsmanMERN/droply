"use client"

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";

import { signUpSchema } from "@/schemas/signUpSchema";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpForm() {
    const router = useRouter();
    const { signUp, isLoaded, setActive } = useSignUp();
    const [verifying, setVerifying] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if (!isLoaded) return;

        setSubmitting(true);
        setAuthError(null);

        try {
            const signUpResponse = await signUp.create({
                emailAddress: data.email,
                password: data.password,
            });

            await signUpResponse.prepareEmailAddressVerification({ strategy: "email_code" });
            setVerifying(true);
        } catch (error: any) {
            console.error("Sign up error:", error);
            setAuthError(error.errors ? error.errors[0].message : "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoaded) return;

        setSubmitting(true);
        setVerificationError(null);

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                setVerificationError("Invalid verification code. Please check your inbox and try again.");
            }
        } catch (error: any) {
            console.error("Verification error:", error);
            setVerificationError("An unexpected error occurred during verification. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (verifying) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle>Verify Your Email</CardTitle>
                        <CardDescription>
                            We've sent a verification code to your email. Please enter it below to complete the sign-up process.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleVerificationSubmit}>
                        <CardContent>
                            {verificationError && (
                                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                                    {verificationError}
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="verificationcode">Verification Code</Label>
                                <Input
                                    id="verificationcode"
                                    type="text"
                                    placeholder="Enter your verification code"
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    disabled={submitting}
                                    autoFocus
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? "Verifying..." : "Verify Email"}
                            </Button>
                            <div className="mt-6 text-center ">
                                <p className="text-sm text-gray-500">
                                    Didn't receive a code?{" "}
                                    <Button
                                        variant="link"
                                        onClick={() => signUp?.prepareEmailAddressVerification({ strategy: "email_code" })}
                                        disabled={submitting}
                                    >
                                        Resend Code
                                    </Button>
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        {authError && (
                            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                                {authError}
                            </div>
                        )}
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    {...register("email")}
                                    disabled={submitting}
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    {...register("password")}
                                    disabled={submitting}
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmpassword">Confirm Password</Label>
                                <Input
                                    id="confirmpassword"
                                    type="password"
                                    required
                                    {...register("passwordConfirmation")}
                                    disabled={submitting}
                                />
                                {errors.passwordConfirmation && <p className="text-red-500 text-sm">{errors.passwordConfirmation.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Creating account..." : "Create account"}
                        </Button>
                        <div className="mt-6 text-center ">
                            <p className="text-sm text-gray-500">
                                Already have an account?{" "}
                                <Button variant="link" onClick={() => router.push("/sign-in")}>
                                    Login
                                </Button>
                            </p>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}