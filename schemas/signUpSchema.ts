import * as zod from "zod";


export const signUpSchema = zod.object({
    email: zod.string().min(1, { message: "Email is required" }).email({ message: "Please Enter a valid Email" }),
    password: zod.string().min(1, { message: "Password is required" }).min(8, { message: "Password should be minimum of 8 characters" }),
    passwordConfirmation: zod.string().min(1, { message: "Please confirm your password" }).min(8, { message: "Password should be minimum of 8 characters" }),
}).refine((data) => { data.password === data.passwordConfirmation }, { message: "Password do not match", path: ["passwordConfirmation"] })