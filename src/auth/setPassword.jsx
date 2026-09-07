import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  useChangePassword,
  useGetOtp,
  useVerifyOtp,
} from "./services/passwordService";
import LoaderPage from "../components/common/Loader";
import { toast } from "react-toastify";
import { Eye, EyeOff, X, Mail, Shield, CheckCircle, ArrowLeft, Key, Send, Lock } from "lucide-react";

// Progress Steps Component
const ProgressSteps = ({ currentStep, totalSteps = 3 }) => {
  const steps = [
    { number: 1, label: "Email", icon: Mail },
    { number: 2, label: "Verify OTP", icon: Shield },
    { number: 3, label: "New Password", icon: Key },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                    : isActive
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-200"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={20} className="text-white" />
                ) : (
                  <Icon size={18} />
                )}
              </div>
              <span
                className={`text-xs font-medium mt-2 ${
                  isActive ? "text-indigo-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Password Strength Indicator
const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState({
    score: 0,
    label: "Weak",
    color: "bg-red-500",
  });

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "Weak", color: "bg-red-500" });
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const strengthMap = {
      0: { label: "Weak", color: "bg-red-500", width: "20%" },
      1: { label: "Weak", color: "bg-red-500", width: "20%" },
      2: { label: "Fair", color: "bg-orange-500", width: "40%" },
      3: { label: "Good", color: "bg-yellow-500", width: "60%" },
      4: { label: "Strong", color: "bg-green-500", width: "80%" },
      5: { label: "Very Strong", color: "bg-emerald-500", width: "100%" },
      6: { label: "Very Strong", color: "bg-emerald-600", width: "100%" },
    };

    const result = strengthMap[Math.min(score, 6)];
    setStrength({
      score: Math.min(score, 6),
      label: result.label,
      color: result.color,
      width: result.width,
    });
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-gray-600">Password Strength</span>
        <span className={`text-xs font-semibold ${strength.color.replace('bg-', 'text-')}`}>
          {strength.label}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-500 ease-in-out rounded-full`}
          style={{ width: strength.width }}
        />
      </div>
      <div className="grid grid-cols-4 gap-1 mt-1">
        {[
          { label: "8+ chars", test: password.length >= 8 },
          { label: "Uppercase", test: /[A-Z]/.test(password) },
          { label: "Lowercase", test: /[a-z]/.test(password) },
          { label: "Number", test: /[0-9]/.test(password) },
        ].map((criterion, index) => (
          <div
            key={index}
            className={`flex items-center gap-1 ${
              criterion.test ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {criterion.test ? (
              <CheckCircle size={12} className="text-emerald-500" />
            ) : (
              <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
            )}
            <span className="text-xs">{criterion.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// OTP Input Component
const OtpInput = ({ value, onChange, onComplete }) => {
  const inputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(Array(6).fill(""));

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const newValue = e.target.value.replace(/\D/g, "");
    if (newValue.length > 1) return;

    const newOtp = [...otpValues];
    newOtp[index] = newValue;
    setOtpValues(newOtp);

    // Update parent
    onChange(newOtp.join(""));

    // Auto-advance to next field
    if (newValue && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Check if all fields are filled
    if (newOtp.every((v) => v !== "")) {
      const completeOtp = newOtp.join("");
      if (completeOtp.length === 6 && onComplete) {
        onComplete(completeOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        onChange(newOtp.join(""));
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtpValues(newOtp);
      onChange(pastedData);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
      if (onComplete) {
        onComplete(pastedData);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center my-4" onPaste={handlePaste}>
      {otpValues.map((value, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength="1"
          value={value}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 outline-none"
          aria-label={`OTP digit ${index + 1}`}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

const SetPassword = ({ isOpen, setIsOpen, userData, clientData }) => {
  // Hooks
  const { mutate: changePassword, isPending: isChange } = useChangePassword();
  const { mutate: getOtp, isPending: isGettingOtp } = useGetOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();

  // State
  const [step, setStep] = useState(1);
  const [emailMatched, setEmailMatched] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const emailValue = watch("email");

  // Timer for resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset form on close
  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setEmailMatched("");
    setOtpValue("");
    reset();
    setResendCooldown(0);
  };

  // Handle Get OTP
  const handleGetOtp = (data) => {
    const trimmedEmail = data.email?.trim()?.toLowerCase();

    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if email exists (if userData and clientData provided)
    // Uncomment and implement based on your data structure
    /*
    const foundUser =
      userData?.data?.find((user) => user?.email?.trim()?.toLowerCase() === trimmedEmail) ||
      clientData?.data?.find((client) => client.email?.trim()?.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      toast.error('Email is not registered. Please check and try again.');
      return;
    }
    */

    getOtp(
      { email: trimmedEmail },
      {
        onSuccess: (data) => {
          toast.success("OTP sent successfully to your email address.");
          setEmailMatched(trimmedEmail);
          setStep(2);
          setResendCooldown(30); // 30 seconds cooldown
          
          // Auto-dismiss any existing toasts
          toast.dismiss();
        },
        onError: (error) => {
          toast.dismiss();
          toast.error(
            error?.response?.data?.message || "Failed to send OTP. Please try again."
          );
        },
      }
    );
  };

  // Handle Verify OTP
  const handleVerifyOtp = (data) => {
    const enteredOtp = data.otp?.trim() || otpValue;

    if (!enteredOtp || enteredOtp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    verifyOtp(
      {
        email: emailMatched,
        otp: enteredOtp,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("OTP verified successfully!");
          setStep(3);
          setOtpValue("");
        },
        onError: (err) => {
          toast.dismiss();
          toast.error(err?.response?.data?.message || "Invalid OTP. Please try again.");
        },
      }
    );
  };

  // Handle Update Password
  const handleUpdatePassword = (data) => {
    const payload = {
      email: emailMatched,
      newPassword: data.password.trim(),
    };

    changePassword(payload, {
      onSuccess: () => {
        toast.dismiss();
        toast.success("Password updated successfully!");
        reset();
        setStep(1);
        setIsOpen(false);
        localStorage.removeItem("otpData");
      },
      onError: (error) => {
        toast.dismiss();
        toast.error(
          error?.response?.data?.message || "Failed to update password. Please try again."
        );
      },
    });
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    if (!emailMatched) {
      toast.error("Email not found. Please go back and enter your email.");
      return;
    }

    getOtp(
      { email: emailMatched },
      {
        onSuccess: () => {
          toast.success("OTP resent successfully!");
          setResendCooldown(30);
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to resend OTP");
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-slideUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Key size={20} className="text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                  {step === 1
                    ? "Reset Password"
                    : step === 2
                    ? "Verify OTP"
                    : "Set New Password"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step === 1
                    ? "Enter your email to receive OTP"
                    : step === 2
                    ? "Enter the 6-digit code sent to your email"
                    : "Create a strong password for your account"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Progress Steps */}
          <ProgressSteps currentStep={step} totalSteps={3} />

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleGetOtp)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email address is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    placeholder="you@company.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 bg-red-50 focus:ring-red-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    aria-invalid={errors.email ? "true" : "false"}
                    disabled={isGettingOtp}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isGettingOtp}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGettingOtp ? (
                  <>
                    <LoaderPage className="w-4 h-4" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 text-center">
                  Enter Verification Code
                </label>
                <p className="text-xs text-gray-500 text-center mb-4">
                  We sent a 6-digit code to <span className="font-semibold text-gray-700">{emailMatched}</span>
                </p>

                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  onComplete={(value) => {
                    // Auto-submit when all digits are filled
                    handleVerifyOtp({ otp: value });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    "Resend OTP"
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || !otpValue || otpValue.length < 6}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? (
                  <>
                    <LoaderPage className="w-4 h-4" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <form
              onSubmit={handleSubmit(handleUpdatePassword)}
              className="space-y-5"
            >
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      validate: {
                        hasUppercase: (value) =>
                          /[A-Z]/.test(value) || "Must contain an uppercase letter",
                        hasLowercase: (value) =>
                          /[a-z]/.test(value) || "Must contain a lowercase letter",
                        hasNumber: (value) =>
                          /[0-9]/.test(value) || "Must contain a number",
                        hasSpecial: (value) =>
                          /[!@#$%^&*]/.test(value) ||
                          "Must contain a special character (!@#$%^&*)",
                      },
                    })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border-gray-300 hover:border-gray-400"
                    aria-invalid={errors.password ? "true" : "false"}
                    disabled={isChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                    {errors.password.message}
                  </p>
                )}
                {/* Password Strength Indicator */}
                <PasswordStrengthIndicator password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    onPaste={(e) => e.preventDefault()}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 border-gray-300 hover:border-gray-400"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                    disabled={isChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Password Requirements Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                <p className="text-xs font-medium text-gray-600 mb-1">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "At least 8 characters", test: password?.length >= 8 },
                    { label: "Uppercase letter", test: /[A-Z]/.test(password || "") },
                    { label: "Lowercase letter", test: /[a-z]/.test(password || "") },
                    { label: "Number", test: /[0-9]/.test(password || "") },
                    { label: "Special character", test: /[!@#$%^&*]/.test(password || "") },
                    { label: "Passwords match", test: password === watch("confirmPassword") && !!password },
                  ].map((req, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1.5 text-xs ${
                        req.test ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {req.test ? (
                        <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChange || !password || password !== watch("confirmPassword")}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isChange ? (
                  <>
                    <LoaderPage className="w-4 h-4" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t border-gray-100 rounded-b-3xl">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield size={12} />
              <span>Secure Connection</span>
            </div>
            <span className="w-px h-3 bg-gray-300" />
            <span>256-bit Encryption</span>
            <span className="w-px h-3 bg-gray-300" />
            <span>SSL Protected</span>
          </div>
        </div>
      </div>

      {/* CSS Animations - Add to your global CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SetPassword;