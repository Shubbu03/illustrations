"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import QueryProvider from "./providers/QueryProvider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryProvider>{children}</QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
