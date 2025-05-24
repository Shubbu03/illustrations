import { comparePasswordBcrypt, hashPasswordBcrypt } from "./bcrypt/index";

export const comparePassword = comparePasswordBcrypt;
export const hashPassword = hashPasswordBcrypt;
