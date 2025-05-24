import bcrypt from "bcryptjs";

export const comparePasswordBcrypt = async (
  newPassword: string,
  oldPassword: string
): Promise<boolean> => {
  return bcrypt.compare(newPassword, oldPassword);
};

export const hashPasswordBcrypt = async (
  passwordToHash: string,
  rounds: number
) => {
  return bcrypt.hash(passwordToHash, rounds);
};
