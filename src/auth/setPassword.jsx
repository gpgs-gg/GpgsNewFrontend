import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useChangePassword,
  useGetOtp,
  useVerifyOtp,
} from "./services/passwordService";
import LoaderPage from "../components/common/Loader";
import { toast } from "react-toastify";

const SetPassword = ({ isOpen, setIsOpen, userData, clientData }) => {
  const { mutate: changePassword, isPending: isChange } = useChangePassword();
  const { mutate: getOtp, isPending: isGettingOtp } = useGetOtp();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();

  const [step, setStep] = useState(1);
  const [emailMatched, setEmailMatched] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password");

  // 🧠 Save OTP and expiry to localStorage
  // const saveOtpToLocal = (otp) => {
  //   const expiryTime = new Date().getTime() + 10 * 60 * 1000; // 10 mins in ms
  //   const otpData = {
  //     otp,
  //     expiry: expiryTime,
  //   };
  //   localStorage.setItem('otpData', JSON.stringify(otpData));
  // };

  // 🔍 Read and validate OTP from localStorage
  // const getValidOtpFromLocal = () => {
  //   const data = JSON.parse(localStorage.getItem('otpData'));
  //   if (!data) return null;

  //   const now = new Date().getTime();
  //   if (now > data.expiry) {
  //     localStorage.removeItem('otpData');
  //     return null;
  //   }
  //   return data.otp;
  // };

  const handleGetOtp = ({ email }) => {
    const trimmedEmail = email?.trim()?.toLowerCase();

    // const foundUser =
    //   userData?.data.find((user) => user?.email?.trim()?.toLowerCase() === trimmedEmail) ||
    //   clientData?.data?.find((client) => client.email?.trim()?.toLowerCase() === trimmedEmail);

    // if (!foundUser) {
    //   toast.dismiss();
    //   toast.error('Email is not registered. Please check and try again.');
    //   return;
    // }

    getOtp(
      { email: trimmedEmail },
      {
        onSuccess: (data) => {
          toast.dismiss();
          toast.success("OTP sent successfully.");
          setEmailMatched(trimmedEmail);
          setStep(2);

          // 🧠 Save OTP locally (for dev/testing only)
          // if (data?.otp) {
          //   saveOtpToLocal(data.otp);
          // } else {
          //   toast.warning("No OTP returned from server. Can't verify.");
          // }
        },
        onError: (error) => {
          toast.dismiss();
          toast.error(
            error?.response?.data?.message || "Failed to send OTP. Try again.",
          );
        },
      },
    );
  };

  const handleVerifyOtp = ({ otp }) => {
    const enteredOtp = otp?.trim();

    if (!enteredOtp) {
      toast.dismiss();
      toast.error("Please enter OTP");
      return;
    }

    verifyOtp(
      {
        email: emailMatched, // 👈 email bhej rahe
        otp: enteredOtp, // 👈 otp bhej rahe
      },
      {
        onSuccess: () => {
          toast.success("OTP verified successfully");
          setStep(3);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Invalid OTP");
        },
      },
    );
  };

  //   const handleVerifyOtp = ({ otp }) => {
  //     const enteredOtp = otp?.trim();
  //     const savedOtp = getValidOtpFromLocal();

  //     if (!savedOtp) {
  //       toast.error('OTP expired or not found. Please request a new one.');
  //       return;
  //     }
  // verifyOtp{

  // }
  //     if (enteredOtp === savedOtp) {
  //       toast.success('OTP verified.');
  //       setStep(3);
  //       localStorage.removeItem('otpData'); // clean up
  //     } else {
  //       toast.error('Invalid OTP. Please try again.');
  //     }
  //   };

  const handleUpdatePassword = ({ password }) => {
    const payload = {
      email: emailMatched,
      newPassword: password.trim(),
    };

    changePassword(payload, {
      onSuccess: () => {
        toast.success("Password updated successfully.");
        reset();
        setStep(1);
        setIsOpen(false);
        localStorage.removeItem("otpData"); // clean up
      },
      onError: () => {
        toast.dismiss();
        toast.error("Failed to update password.");
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#fbfbfb] bg-opacity-10 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg h-auto p-6 relative`}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setStep(1);
            reset();
          }}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-5 text-gray-900">
          {step === 1
            ? "OTP Verification"
            : step === 2
              ? "Verify OTP"
              : "Set New Password"}
        </h2>

        {/* Step 1: Enter Email */}
        {step <= 2 && (
          <form onSubmit={handleSubmit(handleGetOtp)} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1">
                Email ID{" "}
              </label>
              <input
                type="text"
                {...register("email", { required: "Email ID is required" })}
                placeholder="Enter your email id"
                className="w-full px-4 py-2 border  rounded-md focus:outline-none focus:ring-2  focus:ring-gray-300 focus:border-gray-400 "
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isGettingOtp}
              className="w-full  text-white font-semibold py-2  px-4 rounded-md"
            >
              {isGettingOtp ? (
                <div className="flex  justify-center items-center gap-2">
                  <LoaderPage className="w-4 h-4 mt-10" /> Sending OTP...
                </div>
              ) : (
                "Get OTP"
              )}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step <= 2 && (
          <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-1 mt-5">
                OTP
              </label>
              <input
                type="text"
                {...register("otp")}
                placeholder="Enter the OTP sent to your email"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300
focus:ring-gray-300
focus:border-gray-400"
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              // disabled={isVerifyingOtp}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-md"
            >
              {"Verify OTP"}
            </button>
          </form>
        )}

        {/* Step 3: Set New Password */}
        {step === 3 && (
          <form
            onSubmit={handleSubmit(handleUpdatePassword)}
            className="space-y-4 flex flex-col justify-evenly  h-auto"
          >
            {/* New Password */}
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    validate: (value) => {
                      const trimmed = value.trim();

                      if (trimmed.length === 0) {
                        return "Password cannot be empty";
                      }

                      if (trimmed.length < 8) {
                        return "Password must be at least 8 characters";
                      }

                      if (!/[A-Z]/.test(trimmed)) {
                        return "Password must contain at least one uppercase letter";
                      }

                      if (!/[a-z]/.test(trimmed)) {
                        return "Password must contain at least one lowercase letter";
                      }

                      if (!/[0-9]/.test(trimmed)) {
                        return "Password must contain at least one number";
                      }

                      if (!/[!@#$%^&*]/.test(trimmed)) {
                        return "Password must contain at least one special character";
                      }

                      return true;
                    },
                  })}
                  placeholder="New password"
                  className="w-full px-4 py-2 border  rounded-md focus:outline-none focus:ring-2 border-gray-300
focus:ring-gray-300
focus:border-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-600 border-gray-300
focus:ring-gray-300
focus:border-gray-400"
                  tabIndex={-1}
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  onPaste={(e) => e.preventDefault()}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border  rounded-md focus:outline-none focus:ring-2 border-gray-300
focus:ring-gray-300
focus:border-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-2 flex items-center text-gray-600 border-gray-300
focus:ring-gray-300
focus:border-gray-400"
                  tabIndex={-1}
                >
                  <i
                    className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isChange}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isChange ? (
                <>
                  <LoaderPage /> Submit...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetPassword;

// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useChangePassword, useGetOtp, useVerifyOtp } from './services/passwordService';
// import LoaderPage from '../../components/common/LoaderPage';
// import { toast } from 'react-toastify';

// const SetPassword = ({ isOpen, setIsOpen, userData, clientData }) => {
//   const { mutate: changePassword, isPending: isChange } = useChangePassword();
//   const { mutate: getOtp, isPending: isGettingOtp } = useGetOtp();
//   const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();

//   const [step, setStep] = useState(1);
//   const [emailMatched, setEmailMatched] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     watch,
//     reset,
//     setError,
//     formState: { errors },
//   } = useForm({
//     mode: 'onChange',
//   });

//   const password = watch('password');

//   // 🧠 Save OTP and expiry to localStorage
//   // const saveOtpToLocal = (otp) => {
//   //   const expiryTime = new Date().getTime() + 10 * 60 * 1000; // 10 mins in ms
//   //   const otpData = {
//   //     otp,
//   //     expiry: expiryTime,
//   //   };
//   //   localStorage.setItem('otpData', JSON.stringify(otpData));
//   // };

//   // 🔍 Read and validate OTP from localStorage
//   // const getValidOtpFromLocal = () => {
//   //   const data = JSON.parse(localStorage.getItem('otpData'));
//   //   if (!data) return null;

//   //   const now = new Date().getTime();
//   //   if (now > data.expiry) {
//   //     localStorage.removeItem('otpData');
//   //     return null;
//   //   }
//   //   return data.otp;
//   // };

//   const handleGetOtp = ({ email }) => {
//     const trimmedEmail = email?.trim()?.toLowerCase();

//     // const foundUser =
//     //   userData?.data.find((user) => user?.email?.trim()?.toLowerCase() === trimmedEmail) ||
//     //   clientData?.data?.find((client) => client.email?.trim()?.toLowerCase() === trimmedEmail);

//     // if (!foundUser) {
//     //   toast.dismiss();
//     //   toast.error('Email is not registered. Please check and try again.');
//     //   return;
//     // }

//     getOtp(
//       { email: trimmedEmail },
//       {
//         onSuccess: (data) => {
//           toast.dismiss();
//           toast.success('OTP sent successfully.');
//           setEmailMatched(trimmedEmail);
//           setStep(2);

//           // 🧠 Save OTP locally (for dev/testing only)
//           // if (data?.otp) {
//           //   saveOtpToLocal(data.otp);
//           // } else {
//           //   toast.warning("No OTP returned from server. Can't verify.");
//           // }
//         },
//         onError: (error) => {
//           toast.dismiss();
//           toast.error(error?.response?.data?.message || "Failed to send OTP. Try again.")
//         },
//       }
//     );
//   };

//   const handleVerifyOtp = ({ otp }) => {
//     const enteredOtp = otp?.trim();

//     if (!enteredOtp) {
//       toast.error("Please enter OTP");
//       return;
//     }

//     verifyOtp(
//       {
//         email: emailMatched,   // 👈 email bhej rahe
//         otp: enteredOtp,       // 👈 otp bhej rahe
//       },
//       {
//         onSuccess: () => {
//           toast.success("OTP verified successfully");
//           setStep(3);
//         },
//         onError: (err) => {
//           toast.error(
//             err?.response?.data?.message || "Invalid OTP"
//           );
//         },
//       }
//     );
//   };

//   //   const handleVerifyOtp = ({ otp }) => {
//   //     const enteredOtp = otp?.trim();
//   //     const savedOtp = getValidOtpFromLocal();

//   //     if (!savedOtp) {
//   //       toast.error('OTP expired or not found. Please request a new one.');
//   //       return;
//   //     }
//   // verifyOtp{

//   // }
//   //     if (enteredOtp === savedOtp) {
//   //       toast.success('OTP verified.');
//   //       setStep(3);
//   //       localStorage.removeItem('otpData'); // clean up
//   //     } else {
//   //       toast.error('Invalid OTP. Please try again.');
//   //     }
//   //   };

//   const handleUpdatePassword = ({ password }) => {
//     const payload = {
//       email: emailMatched,
//       newPassword: password.trim(),
//     };

//     changePassword(payload, {
//       onSuccess: () => {
//         toast.success('Password updated successfully.');
//         reset();
//         setStep(1);
//         setIsOpen(false);
//         localStorage.removeItem('otpData'); // clean up
//       },
//       onError: () => {
//         toast.error('Failed to update password.');
//       },
//     });
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
//       <div className={`bg-white rounded-lg shadow-lg w-full max-w-lg h-auto p-6 relative`}>
//         {/* Close Button */}
//         <button
//           onClick={() => {
//             setIsOpen(false);
//             setStep(1);
//             reset();
//           }}
//           className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 text-xl"
//         >
//           &times;
//         </button>

//         <h2 className="text-2xl font-bold mb-5 text-orange-600">
//           {step === 1 ? 'OTP Verification' : step === 2 ? 'Verify OTP' : 'Set New Password'}
//         </h2>

//         {/* Step 1: Enter Email */}
//         {step <= 2 && (
//           <form onSubmit={handleSubmit(handleGetOtp)} className="space-y-4">
//             <div>
//               <label className="block text-lg font-medium text-gray-700 mb-1">Email ID </label>
//               <input
//                 type="text"
//                 {...register('email', { required: 'Email ID is required' })}
//                 placeholder="Enter your email id"
//                 className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               />
//               {errors.email && (
//                 <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               disabled={isGettingOtp}
//               className="w-full bg-orange-300 hover:bg-orange-400 font-semibold py-2  px-4 rounded-md"
//             >
//               {isGettingOtp ? <div className='flex justify-center items-center gap-2'>
//                 <LoaderPage className="w-4 h-4 mt-10" /> Sending OTP...
//               </div> : 'Get OTP'}
//             </button>
//           </form>
//         )}

//         {/* Step 2: Enter OTP */}
//         {step <= 2 && (
//           <form onSubmit={handleSubmit(handleVerifyOtp)} className="space-y-4">
//             <div>
//               <label className="block text-lg font-medium text-gray-700 mb-1 mt-5">OTP</label>
//               <input
//                 type="text"
//                 {...register('otp')}
//                 placeholder="Enter the OTP sent to your email"
//                 className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
//               />
//               {errors.otp && (
//                 <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
//               )}
//             </div>

//             <button
//               type="submit"
//               // disabled={isVerifyingOtp}
//               className="w-full bg-orange-300 hover:bg-orange-400 font-semibold py-2 px-4 rounded-md"
//             >
//               {'Verify OTP'}
//             </button>
//           </form>
//         )}

//         {/* Step 3: Set New Password */}
//         {step === 3 && (
//           <form onSubmit={handleSubmit(handleUpdatePassword)} className="space-y-4 flex flex-col justify-evenly  h-auto">
//             {/* New Password */}
//             <div>
//               <label className="block text-[16px] font-medium text-gray-700 mb-1">New Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   {...register('password', {
//                     required: 'Password is required',
//                     validate: (value) => {
//                       const trimmed = value.trim();

//                       if (trimmed.length === 0) {
//                         return "Password cannot be empty";
//                       }

//                       if (trimmed.length < 8) {
//                         return "Password must be at least 8 characters";
//                       }

//                       if (!/[A-Z]/.test(trimmed)) {
//                         return "Password must contain at least one uppercase letter";
//                       }

//                       if (!/[a-z]/.test(trimmed)) {
//                         return "Password must contain at least one lowercase letter";
//                       }

//                       if (!/[0-9]/.test(trimmed)) {
//                         return "Password must contain at least one number";
//                       }

//                       if (!/[!@#$%^&*]/.test(trimmed)) {
//                         return "Password must contain at least one special character";
//                       }

//                       return true;
//                     },
//                   })}
//                   placeholder="New password"
//                   className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-orange-500"
//                   tabIndex={-1}
//                 >
//                   <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-[16px] font-medium text-gray-700 mb-1">Confirm Password</label>
//               <div className="relative">
//                 <input
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   {...register('confirmPassword', {
//                     required: 'Please confirm your password',
//                     validate: (value) =>
//                       value === password || 'Passwords do not match',
//                   })}
//                   placeholder="Confirm password"
//                   className="w-full px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute inset-y-0 right-2 flex items-center text-gray-600 hover:text-orange-500"
//                   tabIndex={-1}
//                 >
//                   <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
//               )}
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isChange}
//               className="w-full bg-orange-300 hover:bg-orange-400 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
//             >
//               {isChange ? <>
//                 <LoaderPage /> Submit...
//               </> : 'Submit'}
//             </button>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SetPassword;