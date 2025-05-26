"use client";

import AuthForm from "../../../components/AuthForm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Login() {
  const session = useSession();

  if (session.status === "authenticated") {
    redirect("/dashboard");
  }
  return <AuthForm mode="login" />;
}
