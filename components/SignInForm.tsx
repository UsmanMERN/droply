"use client"

import { useForm } from "react-hook-form";
import { useSignIn } from "@clerk/nextjs";
import { z } from "zod";

import { signInSchema } from "@/schemas/signInSchema";
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

export default function SignInForm() {
    const router = useRouter();
    const { signIn, isLoaded, setActive } = useSignIn();
    const [authError, setAuthError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "",
        }
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        if (!isLoaded) return;

        setSubmitting(true);
        setAuthError(null);

        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                // Handle other statuses like "needs_first_factor", "needs_second_factor", etc.
                console.log("Sign in status:", result.status);
                setAuthError("Authentication failed. Please check your credentials.");
            }
        } catch (error: any) {
            console.error("Sign in error:", error);
            setAuthError(error.errors ? error.errors[0].message : "An unexpected error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {authError && (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                            {authError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    {...register("identifier")}
                                    disabled={submitting}
                                />
                                {errors.identifier && <p className="text-red-500 text-sm">{errors.identifier.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    {...register("password")}
                                    disabled={submitting}
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                            </div>
                        </div>
                        <Button type="submit" className="w-full mt-6" disabled={submitting}>
                            {submitting ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <div className="mt-6 text-center ">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Button variant="link" onClick={() => router.push("/sign-up")}>
                                Sign up
                            </Button>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}