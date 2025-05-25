import {
  loginCredentialSchema,
  signupSchema,
  signupFormSchema,
} from "./zod/schema";
import { z, ZodError } from "zod";

//SCHEMAS
export const NextAuthLoginCredentialsSchema = loginCredentialSchema;
export const SignupSchema = signupSchema;
export const SignupFormSchema = signupFormSchema;

//EXTRA
export const zodError = ZodError;

//FRONTEND FORM
export type LoginFormData = z.infer<typeof loginCredentialSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
