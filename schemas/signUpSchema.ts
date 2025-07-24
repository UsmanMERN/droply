import * as zod from "zod";

export const signUpSchema = zod.object({
    email: zod.string().min(1, { message: "Email is required" }).email({ message: "Please enter a valid email" }),
    password: zod.string().min(1, { message: "Password is required" }).min(8, { message: "Password must be at least 8 characters" }),
    passwordConfirmation: zod.string().min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"], // This attaches the error message to the 'passwordConfirmation' field
});