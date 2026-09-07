import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useCurrentUser, useLogin } from "./services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import SetPassword from "./setPassword";
import video1 from "../videos/PV1NL21-privateR.mp4";

const Login = () => {
  const { mutate: sendLoginDetails, isLoading } = useLogin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const isClient = currentUser?.user?.role?.toLowerCase() === "client";
  const [showPassword, setShowPassword] = useState(false);
  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
   console.log(isClient)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

 
const onSubmit = async (data) => {
  sendLoginDetails(data, {
    onSuccess: async (response) => {
      if (!response?.success) {
        toast.error(
          response?.message || "Login failed. Please try again."
        );
        return;
      }

      // Current user data refresh
      await queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });

      toast.success(
        "Welcome back! You have been logged in successfully."
      );

      reset();

      // Get role directly from login response
      const role = response?.user?.role?.toLowerCase();

      // Role based redirect
      if (role === "client") {
        navigate("/renthistory", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    },

    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid email or password. Please check your credentials.";

      toast.error(errorMessage);
    },
  });
};

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-3 bg-gray-100">
        {/* Hero Section - Left Side */}
        <div className="hidden lg:flex relative flex-col justify-center items-center overflow-hidden p-12 text-white col-span-2">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={video1} type="video/mp4" />
          </video>

          {/* Dark Overlay */}

          {/* Content */}
          <div className="relative z-10 max-w-lg text-center">
            {/* <div className="mb-8">
              <img
                src="https://www.kindpng.com/picc/m/584-5847378_paying-guest-clipart-hd-png-download.png"
                alt="Admin Dashboard Illustration"
                className="mx-auto rounded-2xl object-contain"
                loading="lazy"
              />
            </div> */}

            <h1 className="text-4xl font-bold mb-4">
              Welcome Back !
            </h1>

            <p className="text-4xl font-bold mb-4">
              Gopal's Paying Guest Services
            </p>
          </div>
        </div>

        {/* Login Form - Right Side */}
        <div className="flex justify-center items-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  Admin Login
                </h2>
                <p className="text-gray-500 mt-2">
                  Enter your credentials to access the dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email
                      ? "border-red-500 ring-red-500"
                      : "border-gray-300"
                      }`}
                    aria-invalid={errors.email ? "true" : "false"}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12 ${errors.password
                        ? "border-red-500 ring-red-500"
                        : "border-gray-300"
                        }`}
                      aria-invalid={errors.password ? "true" : "false"}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Set Password Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSetPasswordOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    Forgot or need to set password?
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Create Account Link */}
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SetPassword
        isOpen={isSetPasswordOpen}
        setIsOpen={setIsSetPasswordOpen}
      />
    </>
  );
};

export default Login;