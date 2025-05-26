import { JwtPayload, verify } from "jsonwebtoken";

export const verifyToken = (
  token: string
): JwtPayload | string | null => {
  try {
    console.log("Token: ", token);
    console.log("Secret: ", process.env.JWT_SECRET);
    return verify(token, process.env.JWT_SECRET as string);
  } catch {
    return null;
  }
};
