import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthLoginCredentialsSchema, zodError } from "@repo/types/zod";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@repo/db/prisma";
import { comparePassword } from "@repo/auth/bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } =
            NextAuthLoginCredentialsSchema.parse(credentials);

          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) {
            throw new Error("Invalid email or password");
          }

          const isValid = await comparePassword(password, user.password);

          if (!isValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          if (error instanceof zodError) {
            throw new Error(error.errors.map((e) => e.message).join(", "));
          }
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          user.id = existingUser.id;
          await prisma.user.update({
            where: {
              id: existingUser.id,
            },
            data: {
              provider: "google",
              provider_id: account.providerAccountId,
            },
          });
          return true;
        }

        const newUser = await prisma.user.create({
          data: {
            email: user.email!,
            password: "", //no password as sign in with google, can change later
            name: user.name!,
            provider: "google",
            provider_id: account.providerAccountId,
          },
        });

        user.id = newUser.id;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === "development",
};
