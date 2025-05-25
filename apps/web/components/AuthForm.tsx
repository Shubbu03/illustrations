import { useState } from "react";
import { Eye, EyeOff, User, LogIn, Palette, Github } from "lucide-react";
import Link from "next/link";
import {
  LoginFormData,
  SignupFormData,
  NextAuthLoginCredentialsSchema,
  SignupFormSchema,
  zodError,
} from "@repo/types/zod";
import { signIn } from "next-auth/react";
import axios from "axios";
import PropTypes from "prop-types";
import ShapesBackground from "./ShapesBackground";
import router from "next/router";

interface AuthFormProps {
  mode: "login" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const [formData, setFormData] = useState<LoginFormData | SignupFormData>(
    mode === "login"
      ? { email: "", password: "" }
      : { name: "", email: "", password: "", confirmPassword: "" }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    try {
      if (mode === "login") {
        NextAuthLoginCredentialsSchema.parse(formData);
      } else {
        SignupFormSchema.parse(formData);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof zodError) {
        const newErrors: Record<string, string> = {};
        (error as any).errors?.forEach((err: any) => {
          if (err.path && err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error("Validation error (not a ZodError instance):", error);
        setErrors({ form: "An unexpected validation error occurred." });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === "login") {
        const result = await signIn("credentials", {
          redirect: true,
          email: (formData as LoginFormData).email,
          password: (formData as LoginFormData).password,
          callbackUrl: "/dashboard",
        });
        if (result?.error) {
          setErrors({ form: result.error });
        } else if (result?.ok) {
          router.push("/dashboard");
        }
      } else {
        const response = await axios.post(
          "/api/auth/signup",
          {
            name: (formData as SignupFormData).name,
            email: (formData as SignupFormData).email,
            password: (formData as SignupFormData).password,
          },
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status !== 201 && response.status !== 200) {
          throw new Error(
            response.data.message || "Something went wrong during signup"
          );
        } else {
          await signIn("credentials", {
            redirect: true,
            email: (formData as SignupFormData).email,
            password: (formData as SignupFormData).password,
            callbackUrl: "/dashboard",
          });
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrors({
        form:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
      setErrors({ form: "Google sign-in failed." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setErrors({ form: "GitHub sign-in failed." });
    } finally {
      setIsLoading(false);
    }
  };

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
              {mode === "login" ? "Welcome back!" : "Join the fun!"}
            </h2>
            <p className="text-base sm:text-lg lg:text-lg xl:text-xl text-[#333446] opacity-80 leading-relaxed">
              {mode === "login"
                ? "Ready to draw together? Login to continue your artistic journey."
                : "Start creating amazing illustrations today."}
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
            {errors.form && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#333446" }}
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required={mode === "signup"}
                      value={(formData as SignupFormData).name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 pl-10 sm:pl-12 text-sm sm:text-base"
                      style={{
                        backgroundColor: "rgba(234, 239, 239, 0.8)",
                        border: `2px solid ${errors.name ? "#DC2626" : "#B8CFCE"}`,
                        color: "#333446",
                      }}
                      placeholder="What should we call you?"
                    />
                    <User
                      className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: "#7F8CAA" }}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333446" }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 text-sm sm:text-base"
                  style={{
                    backgroundColor: "rgba(234, 239, 239, 0.8)",
                    border: `2px solid ${errors.email ? "#DC2626" : "#B8CFCE"}`,
                    color: "#333446",
                  }}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "#333446" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                    style={{
                      backgroundColor: "rgba(234, 239, 239, 0.8)",
                      border: `2px solid ${errors.password ? "#DC2626" : "#B8CFCE"}`,
                      color: "#333446",
                    }}
                    placeholder="Your secret password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
                    style={{ color: "#7F8CAA" }}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#333446" }}
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required={mode === "signup"}
                      value={(formData as SignupFormData).confirmPassword || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-opacity-50 transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                      style={{
                        backgroundColor: "rgba(234, 239, 239, 0.8)",
                        border: `2px solid ${errors.confirmPassword ? "#DC2626" : "#B8CFCE"}`,
                        color: "#333446",
                      }}
                      placeholder="Type it again"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
                      style={{ color: "#7F8CAA" }}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 text-white px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
                style={{ backgroundColor: "#7F8CAA" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {mode === "login" ? "Start Drawing" : "Create Account"}
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-sm" style={{ color: "#333446", opacity: 0.8 }}>
                {mode === "login"
                  ? "New to ilustraciones?"
                  : "Already have an account?"}
                <Link
                  href={mode === "login" ? "/signup" : "/login"}
                  className="ml-1 font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "#7F8CAA" }}
                >
                  {mode === "login" ? "Join us!" : "Login"}
                </Link>
              </p>
            </div>

            <div className="mt-4 sm:mt-6 lg:mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: "#B8CFCE" }}
                  />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-3 text-xs sm:text-sm"
                    style={{
                      backgroundColor: "rgba(184, 207, 206, 0.7)",
                      color: "#333446",
                      opacity: 0.8,
                    }}
                  >
                    or continue with
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-70 cursor-pointer"
                style={{
                  backgroundColor: "rgba(234, 239, 239, 0.8)",
                  border: `2px solid #B8CFCE`,
                  color: "#333446",
                }}
                disabled={isLoading}
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={handleGitHubSignIn}
                className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-70 cursor-pointer"
                style={{
                  backgroundColor: "rgba(234, 239, 239, 0.8)",
                  border: `2px solid #B8CFCE`,
                  color: "#333446",
                }}
                disabled={isLoading}
              >
                <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Github
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AuthForm.propTypes = {
  mode: PropTypes.oneOf(["login", "signup"]).isRequired,
};

export default AuthForm;
