import { sign } from "jsonwebtoken";

export const signToken = (payload: any, secret: string): string => {
  return sign(payload, secret, {
    expiresIn: "30d",
  });
};
