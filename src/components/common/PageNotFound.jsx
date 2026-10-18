import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-3xl text-center">

        {/* 404 Illustration */}
        <div className="relative mx-auto mb-8 flex max-w-2xl items-center justify-center">
          <div className="absolute left-4 top-10 h-16 w-16 rounded-full bg-blue-100/60 blur-2xl sm:left-16" />
          <div className="absolute right-8 top-12 h-20 w-20 rounded-full bg-blue-100/70 blur-2xl sm:right-20" />

          <div className="relative flex items-center justify-center gap-1 sm:gap-4">
            <span className="text-8xl font-extrabold tracking-tight text-slate-800 sm:text-9xl">
              4
            </span>

            {/* Sad Face Magnifying Glass */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-slate-500 bg-slate-50 shadow-lg shadow-blue-100 sm:h-40 sm:w-40 sm:border-[14px]">
              <div className="flex flex-col items-center">
                <div className="flex gap-5 sm:gap-7">
                  <span className="h-3 w-3 rounded-full bg-slate-800 sm:h-4 sm:w-4" />
                  <span className="h-3 w-3 rounded-full bg-slate-800 sm:h-4 sm:w-4" />
                </div>
                <svg
                  viewBox="0 0 50 25"
                  className="mt-2 h-5 w-10 sm:h-7 sm:w-12"
                  fill="none"
                >
                  <path
                    d="M5 20 Q25 -2 45 20"
                    stroke="#1e293b"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="absolute -bottom-7 -right-5 -z-10 h-12 w-7 rotate-[-42deg] rounded-full bg-slate-500 sm:-bottom-9 sm:-right-6 sm:h-16 sm:w-9" />
            </div>

            <span className="text-8xl font-extrabold tracking-tight text-slate-800 sm:text-9xl">
              4
            </span>
          </div>

          {/* Confused Character */}
          <div className="absolute -right-1 -top-8 hidden sm:block">
            <div className="relative flex flex-col items-center">
              <span className="mb-1 text-4xl font-bold text-blue-300">?</span>
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                <div className="absolute -top-1 h-5 w-12 rounded-t-full bg-slate-800" />
                <div className="mt-2 flex gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                </div>
              </div>
              <div className="h-20 w-16 rounded-t-2xl bg-slate-500" />
              <div className="flex gap-2">
                <div className="h-14 w-6 rounded-b-lg bg-slate-700" />
                <div className="h-14 w-6 rounded-b-lg bg-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Page Not Found
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-lg">
          The page you are looking for might have been removed,
          had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="theme-btn flex justify-center items-center gap-2"
          >
         
              <Home size={20} />
            Go to Home
         
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default PageNotFound;