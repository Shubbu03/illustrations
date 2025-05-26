import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      wsToken?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    wsToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
