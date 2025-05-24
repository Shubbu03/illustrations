import { loginCredentialSchema,signupSchema } from "./zod/schema";
import { ZodError } from "zod";

//SCHEMAS
export const NextAuthLoginCredentialsSchema = loginCredentialSchema;
export const SignupSchema = signupSchema;

//EXTRA
export const zodError = ZodError;
