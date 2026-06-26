/**
 * =========================================================
 * AUTH SERVICE & API HOOKS
 * =========================================================
 *
 * Purpose:
 * Centralized authentication layer using:
 * - Axios
 * - React Query
 * - JWT Access + Refresh Token Flow
 *
 * Responsibilities:
 * - User Registration
 * - Login / Logout
 * - Auto Refresh Expired Access Tokens
 * - Current User Fetching
 * - OTP Verification
 * - Password Management
 *
 * Security Features:
 * - HTTP-only refresh token cookies
 * - Automatic token refresh on 401 errors
 * - Prevents infinite refresh


/* =========================================================
   AXIOS CLIENT
========================================================= */
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
// import { queryClient as appQueryClient } from "../../../../src/queryClient.js";
import { CloudCog } from "lucide-react";
import { refresh } from "aos";
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // IMPORTANT for refresh token cookies
});
/* =========================================================
   AUTO TOKEN REFRESH
========================================================= */
/**
 * =========================================================
 * AXIOS RESPONSE INTERCEPTOR
 * =========================================================
 *
 * Purpose:
 * Automatically handles expired access tokens by:
 * 1. Detecting 401 Unauthorized responses
 * 2. Calling refresh-token API
 * 3. Generating a new access token
 * 4. Retrying the original failed request
 *
 * Why Needed:
 * Access tokens usually expire after a short time
 * (example: 15 minutes).
 *
 * Instead of forcing the user to login again,
 * this interceptor silently refreshes the token
 * in the background using the refresh token.
 *
 * Flow:
 *
 * ┌───────────────┐
 * │ API Request   │
 * └──────┬────────┘
 *        │
 *        ▼
 * Access token expired?
 *        │
 *   YES (401 Error)
 *        │
 *        ▼
 * Call /auth/refresh-token
 *        │
 *        ▼
 * New access token generated
 *        │
 *        ▼
 * Retry original request automatically
 *        │
 *        ▼
 * User continues without logout
 *
 * Security Notes:
 * - Prevents infinite refresh loops
 * - Skips refresh retry for refresh-token API itself
 * - Clears React Query cache if refresh fails
 * - Supports HTTP-only cookie authentication
 *
 * =========================================================
 */
let isRefreshing = false;
let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const excludedUrls = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
      "/auth/me",
    ];

    const shouldSkipRefresh = excludedUrls.some((url) =>
      originalRequest.url?.includes(url),
    );

    // Skip if already on login page
    if (window.location.pathname === "/login") {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh
    ) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = apiClient.post("/auth/refresh-token").finally(() => {
            isRefreshing = false;
          });
        }

        await refreshPromise;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        sessionStorage.clear();

        // remove cookies manually if needed
        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // hard redirect
        window.location.replace("/");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
// apiClient.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     const excludedUrls = [
//       "/auth/login",
//       "/auth/register",
//       "/auth/refresh-token",
//       "/auth/me",
//     ];

//     const shouldSkipRefresh = excludedUrls.some((url) =>
//       originalRequest.url?.includes(url)
//     );

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !shouldSkipRefresh
//     ) {
//       originalRequest._retry = true;

//       try {
//         await apiClient.post("/auth/refresh-token");

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         await apiClient.post("/auth/logout").catch(() => { });

//         appQueryClient.setQueryData(["currentUser"], null);

//         localStorage.clear();
//         sessionStorage.clear();

//         window.location.href = "/login";
//         // appQueryClient.clear();

//         // localStorage.clear();
//         // sessionStorage.clear();

//         // window.location.href = "/login";

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     const isRefreshRequest =
//       originalRequest.url?.includes("/auth/refresh-token");

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isRefreshRequest
//     ) {
//       originalRequest._retry = true;

//       try {
//         if (!isRefreshing) {
//           isRefreshing = true;

//           refreshPromise = apiClient
//             .post("/auth/refresh-token")
//             .finally(() => {
//               isRefreshing = false;
//             });
//         }

//         await refreshPromise;

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         appQueryClient.clear();
//         localStorage.clear();
//         sessionStorage.clear();
//         // window.location.href = "/login";

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );
/* =========================================================
   REGISTER API
========================================================= */

const register = async (data) => {
  const response = await apiClient.post("/auth/register", data);

  return response.data;
};

export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};

/* =========================================================
   LOGIN API
========================================================= */

const login = async (data) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

/* =========================================================
   LOGOUT API
========================================================= */
const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: async () => {
      // current user cache remove
      queryClient.removeQueries({
        queryKey: ["currentUser"],
      });

      // pura cache clear
      queryClient.clear();
    },
  });
};
/* =========================================================
   REFRESH TOKEN API
========================================================= */

const refreshToken = async () => {
  const response = await apiClient.post("/auth/refresh-token");

  return response.data;
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
  });
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */

const changePassword = async (data) => {
  const response = await apiClient.post("/auth/change-password", data);

  return response.data;
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

/* =========================================================
   SEND OTP
========================================================= */

const getOtp = async (data) => {
  const response = await apiClient.post("/auth/send-otp", data);

  return response.data;
};

export const useGetOtp = () => {
  return useMutation({
    mutationFn: getOtp,
  });
};

/* =========================================================
   VERIFY OTP
========================================================= */

const verifyOtp = async (data) => {
  const response = await apiClient.post("/auth/verify-otp", data);

  return response.data;
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtp,
  });
};

/* =========================================================
   GET CURRENT USER
========================================================= */

const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");

  return response.data;
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    retry: false,

    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
/* =========================================================
   EXPORT API CLIENT
========================================================= */

export default apiClient;

// /**
//  * =========================================================
//  * AUTH SERVICE & API HOOKS
//  * =========================================================
//  *
//  * Purpose:
//  * Centralized authentication layer using:
//  * - Axios
//  * - React Query
//  * - JWT Access + Refresh Token Flow
//  *
//  * Responsibilities:
//  * - User Registration
//  * - Login / Logout
//  * - Auto Refresh Expired Access Tokens
//  * - Current User Fetching
//  * - OTP Verification
//  * - Password Management
//  *
//  * Security Features:
//  * - HTTP-only refresh token cookies
//  * - Automatic token refresh on 401 errors
//  * - Prevents infinite refresh

// /* =========================================================
//    AXIOS CLIENT
// ========================================================= */
// import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { queryClient as appQueryClient } from "../../../../src/queryClient.js";
// import { CloudCog } from "lucide-react";
// const apiClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
//   withCredentials: true, // IMPORTANT for refresh token cookies
// });
// /* =========================================================
//    AUTO TOKEN REFRESH
// ========================================================= */
// /**
//  * =========================================================
//  * AXIOS RESPONSE INTERCEPTOR
//  * =========================================================
//  *
//  * Purpose:
//  * Automatically handles expired access tokens by:
//  * 1. Detecting 401 Unauthorized responses
//  * 2. Calling refresh-token API
//  * 3. Generating a new access token
//  * 4. Retrying the original failed request
//  *
//  * Why Needed:
//  * Access tokens usually expire after a short time
//  * (example: 15 minutes).
//  *
//  * Instead of forcing the user to login again,
//  * this interceptor silently refreshes the token
//  * in the background using the refresh token.
//  *
//  * Flow:
//  *
//  * ┌───────────────┐
//  * │ API Request   │
//  * └──────┬────────┘
//  *        │
//  *        ▼
//  * Access token expired?
//  *        │
//  *   YES (401 Error)
//  *        │
//  *        ▼
//  * Call /auth/refresh-token
//  *        │
//  *        ▼
//  * New access token generated
//  *        │
//  *        ▼
//  * Retry original request automatically
//  *        │
//  *        ▼
//  * User continues without logout
//  *
//  * Security Notes:
//  * - Prevents infinite refresh loops
//  * - Skips refresh retry for refresh-token API itself
//  * - Clears React Query cache if refresh fails
//  * - Supports HTTP-only cookie authentication
//  *
//  * =========================================================
//  */
// let isRefreshing = false;
// let refreshPromise = null;

// apiClient.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const originalRequest = error.config;

//     const excludedUrls = [
//       "/auth/login",
//       "/auth/register",
//       "/auth/refresh-token",
//       "/auth/me",
//     ];

//     const shouldSkipRefresh = excludedUrls.some((url) =>
//       originalRequest.url?.includes(url)
//     );

//     // Skip if already on login page
//     if (window.location.pathname === "/login") {
//       return Promise.reject(error);
//     }

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !shouldSkipRefresh
//     ) {
//       originalRequest._retry = true;

//       try {
//         if (!isRefreshing) {
//           isRefreshing = true;

//           refreshPromise = apiClient
//             .post("/auth/refresh-token")
//             .finally(() => {
//               isRefreshing = false;
//             });
//         }

//         await refreshPromise;

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         localStorage.clear();
//         sessionStorage.clear();

//         // remove cookies manually if needed
//         document.cookie =
//           "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//         document.cookie =
//           "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

//         // hard redirect
//         window.location.replace("/login");

//         return Promise.reject(refreshError);
//       }
//     }

//     // direct logout if /auth/me fails
//     if (
//       error.response?.status === 401 &&
//       originalRequest.url?.includes("/auth/me")
//     ) {
//       localStorage.clear();
//       sessionStorage.clear();

//       window.location.replace("/login");
//     }

//     return Promise.reject(error);
//   }
// );
// // apiClient.interceptors.response.use(
// //   (response) => response,

// //   async (error) => {
// //     const originalRequest = error.config;

// //     const excludedUrls = [
// //       "/auth/login",
// //       "/auth/register",
// //       "/auth/refresh-token",
// //       "/auth/me",
// //     ];

// //     const shouldSkipRefresh = excludedUrls.some((url) =>
// //       originalRequest.url?.includes(url)
// //     );

// //     if (
// //       error.response?.status === 401 &&
// //       !originalRequest._retry &&
// //       !shouldSkipRefresh
// //     ) {
// //       originalRequest._retry = true;

// //       try {
// //         await apiClient.post("/auth/refresh-token");

// //         return apiClient(originalRequest);
// //       } catch (refreshError) {
// //         await apiClient.post("/auth/logout").catch(() => { });

// //         appQueryClient.setQueryData(["currentUser"], null);

// //         localStorage.clear();
// //         sessionStorage.clear();

// //         window.location.href = "/login";
// //         // appQueryClient.clear();

// //         // localStorage.clear();
// //         // sessionStorage.clear();

// //         // window.location.href = "/login";

// //         return Promise.reject(refreshError);
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );
// // apiClient.interceptors.response.use(
// //   (response) => response,
// //   async (error) => {
// //     const originalRequest = error.config;

// //     const isRefreshRequest =
// //       originalRequest.url?.includes("/auth/refresh-token");

// //     if (
// //       error.response?.status === 401 &&
// //       !originalRequest._retry &&
// //       !isRefreshRequest
// //     ) {
// //       originalRequest._retry = true;

// //       try {
// //         if (!isRefreshing) {
// //           isRefreshing = true;

// //           refreshPromise = apiClient
// //             .post("/auth/refresh-token")
// //             .finally(() => {
// //               isRefreshing = false;
// //             });
// //         }

// //         await refreshPromise;

// //         return apiClient(originalRequest);
// //       } catch (refreshError) {
// //         appQueryClient.clear();
// //         localStorage.clear();
// //         sessionStorage.clear();
// //         // window.location.href = "/login";

// //         return Promise.reject(refreshError);
// //       }
// //     }

// //     return Promise.reject(error);
// //   }
// // );
// /* =========================================================
//    REGISTER API
// ========================================================= */

// const register = async (data) => {
//   const response = await apiClient.post("/auth/register", data);

//   return response.data;
// };

// export const useRegister = () => {
//   return useMutation({
//     mutationFn: register,
//   });
// };

// /* =========================================================
//    LOGIN API
// ========================================================= */

// const login = async (data) => {
//   const response = await apiClient.post("/auth/login", data);
//   return response.data;
// };

// export const useLogin = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: login,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["currentUser"] });
//     },
//   });
// };

// /* =========================================================
//    LOGOUT API
// ========================================================= */

// const logout = async () => {
//   const response = await apiClient.post("/auth/logout");
//   return response.data;
// };

// export const useLogout = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: logout,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["currentUser"] });
//     },
//   });
// };
// /* =========================================================
//    REFRESH TOKEN API
// ========================================================= */

// const refreshToken = async () => {
//   const response = await apiClient.post("/auth/refresh-token");

//   return response.data;
// };

// export const useRefreshToken = () => {
//   return useMutation({
//     mutationFn: refreshToken,
//   });
// };

// /* =========================================================
//    CHANGE PASSWORD
// ========================================================= */

// const changePassword = async (data) => {
//   const response = await apiClient.post("/auth/change-password", data);

//   return response.data;
// };

// export const useChangePassword = () => {
//   return useMutation({
//     mutationFn: changePassword,
//   });
// };

// /* =========================================================
//    SEND OTP
// ========================================================= */

// const getOtp = async (data) => {
//   const response = await apiClient.post("/auth/send-otp", data);

//   return response.data;
// };

// export const useGetOtp = () => {
//   return useMutation({
//     mutationFn: getOtp,
//   });
// };

// /* =========================================================
//    VERIFY OTP
// ========================================================= */

// const verifyOtp = async (data) => {
//   const response = await apiClient.post("/auth/verify-otp", data);

//   return response.data;
// };

// export const useVerifyOtp = () => {
//   return useMutation({
//     mutationFn: verifyOtp,
//   });
// };

// /* =========================================================
//    GET CURRENT USER
// ========================================================= */

// const getCurrentUser = async () => {
//   const response = await apiClient.get("/auth/me");

//   return response.data;
// };

// export const useCurrentUser = () => {
//   return useQuery({
//     queryKey: ["currentUser"],
//     queryFn: getCurrentUser,
//     retry: false,
//     staleTime: 0,
//     gcTime: 0,
//     refetchOnWindowFocus: true,
//     refetchOnMount: true,
//   });
// };
// /* =========================================================
//    EXPORT API CLIENT
// ========================================================= */

// export default apiClient;