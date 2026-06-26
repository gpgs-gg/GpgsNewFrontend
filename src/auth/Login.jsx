import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin } from "./services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import SetPassword from "./SetPassword";

const Login = () => {
  const { mutate: sendLoginDetails } = useLogin();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setIsSubmitting(true);

    sendLoginDetails(data, {
      onSuccess: async (response) => {
        if (!response?.success) {
          toast.error("Login failed");
          setIsSubmitting(false);
          return;
        }

        // Refresh current user query
        await queryClient.invalidateQueries({
          queryKey: ["currentUser"],
        });

        toast.success("Logged in successfully");

        reset();
        setIsSubmitting(false);

        navigate("/dashboard", {
          replace: true,
        });
      },

      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            "Invalid Email or Password"
        );

        setIsSubmitting(false);
      },
    });
  };

  return (
    <>
      <div className=" flex items-center justify-center h-screen px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg border border-gray-300"
        >
          <h2 className="text-3xl font-bold text-center mb-2">
            Admin Login
          </h2>

          <p className="text-gray-500 text-center mb-6">
            Please enter your credentials to continue
          </p>

          {/* Email */}
          <label className="block mb-1 font-medium">
            Email ID
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
            })}
            className="w-full mb-3 px-4 py-2 border border-gray-400 outline-none rounded-lg"
          />

          {errors.email && (
            <p className="text-red-500 text-sm">
              {errors.email.message}
            </p>
          )}

          {/* Password */}
          <label className="block mt-4 mb-1 font-medium">
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full px-4 py-2 border border-gray-400 outline-none rounded-lg pr-10"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-2"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-2">
              {errors.password.message}
            </p>
          )}

          {/* Set Password */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-4 text-sm underline"
          >
            Set Password
          </button>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 theme-btn text-white py-2 rounded-lg"
          >
            {isSubmitting
              ? "Logging in..."
              : "Login"}
          </button>

          {/* Register */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold underline"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>

      <SetPassword
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </>
  );
};

export default Login;