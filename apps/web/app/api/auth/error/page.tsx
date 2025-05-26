"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Palette, AlertTriangle, Home, LogIn } from "lucide-react";
import ShapesBackground from "../../../../components/ShapesBackground";

const errorMessages: Record<string, string> = {
  default: "An error occurred during authentication.",
  configuration: "There is a problem with the server configuration.",
  accessdenied: "You do not have permission to sign in.",
  verification: "The verification link may have expired or was already used.",
  credentialssignin: "The email or password you entered is incorrect.",
  oauthsignin: "There was a problem with the OAuth provider.",
  oauthcallback: "There was a problem with the OAuth callback.",
  oauthcreateaccount:
    "There was a problem creating an account with the OAuth provider.",
  emailcreateaccount: "There was a problem creating your account.",
  callback: "There was a problem with the authentication callback.",
  sessionrequired: "You must be signed in to access this page.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("default");
  const [errorDescription, setErrorDescription] = useState<string | null>(null);

  useEffect(() => {
    const errorType = searchParams.get("error") || "default";
    setError(errorType);

    const description = searchParams.get("error_description");
    if (description) {
      setErrorDescription(description);
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row lg:items-center lg:justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <Link
        href="/"
        className="flex lg:absolute lg:top-8 xl:top-12 lg:left-4 xl:left-6 2xl:left-8 items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity z-20 mb-6 lg:mb-0"
      >
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: "#7F8CAA" }}
        >
          <Palette className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
        </div>
        <span
          className="text-xl sm:text-2xl font-bold"
          style={{ color: "#333446" }}
        >
          ilustraciones
        </span>
      </Link>

      <ShapesBackground />

      <div className="relative z-10 w-full max-w-6xl mx-auto lg:flex lg:items-center lg:justify-center">
        <div className="w-full lg:w-5/12 xl:w-1/2 text-center lg:text-left space-y-3 sm:space-y-4 mb-8 lg:mb-0 lg:pr-6 xl:pr-8 2xl:pr-16">
          <div className="lg:min-h-[200px] xl:min-h-[300px] flex flex-col justify-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-[#333446] mb-3 sm:mb-4 leading-tight">
              Oops! Something went wrong
            </h2>
            <p className="text-base sm:text-lg lg:text-lg xl:text-xl text-[#333446] opacity-80 leading-relaxed">
              Don&apos;t worry, these things happen. Let&apos;s get you back on
              track to creating amazing illustrations.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-7/12 xl:w-1/2">
          <div
            className="backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border w-full"
            style={{
              backgroundColor: "rgba(184, 207, 206, 0.7)",
              borderColor: "#B8CFCE",
            }}
          >
            <div className="flex items-start space-x-4 mb-6">
              <div
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
              >
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: "#333446" }}
                >
                  Authentication Error
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "#333446", opacity: 0.8 }}
                >
                  {errorMessages[error] || errorMessages.default}
                </p>
                {errorDescription && (
                  <div
                    className="mt-3 p-3 rounded-lg"
                    style={{ backgroundColor: "rgba(220, 38, 38, 0.05)" }}
                  >
                    <p className="text-sm text-red-700">{errorDescription}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/login"
                className="w-full flex items-center justify-center space-x-2 text-white px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ backgroundColor: "#7F8CAA" }}
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Try logging in again</span>
              </Link>

              <Link
                href="/"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: "rgba(234, 239, 239, 0.8)",
                  border: "2px solid #B8CFCE",
                  color: "#333446",
                }}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Return to home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#EAEFEF" }}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
          style={{ borderColor: "#7F8CAA" }}
        ></div>
        <p className="text-sm" style={{ color: "#333446", opacity: 0.8 }}>
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthErrorContent />
    </Suspense>
  );
}
