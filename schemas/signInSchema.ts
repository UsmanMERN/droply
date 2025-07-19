import * as zod from "zod";


export const signInSchema = zod.object({
    identifier: zod.string().min(1, { message: "Email is Required" }).email({ message: "Please Enter a valid email" }),
    password: zod.string().min(1, { message: "Password is required" }).min(8, { message: "Password should be atleast 8 characters" })
})