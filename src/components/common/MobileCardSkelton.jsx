import React from "react";

/* =========================================================
   MOBILE CARD SKELETON (Used in both Skeletons)
========================================================= */
export const MobileCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="md:hidden space-y-4 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow border border-gray-100 p-4 animate-pulse"
        >
          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-full">
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
              <div className="h-3 w-28 bg-gray-200 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
            </div>

            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>

          {/* ================= QUICK INFO ================= */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-10 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-14 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* ================= DETAILS GRID ================= */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {Array.from({ length: 6 }).map((_, k) => (
              <div key={k} className="space-y-2 text-center">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>

          {/* ================= FOOTER ================= */}
          <div className="flex justify-between mt-4 pt-3 border-t">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   MAIN TABLE SKELETON (DESKTOP + MOBILE)
========================================================= */
export const Skeleton = () => {
  return (
    <div className="max-w-full mx-auto mt-3 p-2 bg-gray-50 rounded-lg shadow-md">
      {/* ================= MOBILE ================= */}
      <MobileCardSkeleton count={6} />

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block animate-pulse">
        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-32 bg-gray-200 rounded-xl" />
          ))}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full border">
            <thead className="bg-black text-gray-200">
              <tr>
                {Array.from({ length: 12 }).map((_, i) => (
                  <th key={i} className="p-4">
                    <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 8 }).map((_, row) => (
                <tr key={row} className="border-b">
                  {Array.from({ length: 12 }).map((_, col) => (
                    <td key={col} className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-5">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FNF SKELETON (Different Filters Count)
========================================================= */
export const SkeletonForFnF = () => {
  return (
    <div className="max-w-full mx-auto mt-3 p-2 bg-gray-50 rounded-lg shadow-md">
      {/* ================= MOBILE ================= */}
      <MobileCardSkeleton count={5} />

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block animate-pulse">
        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-3 mb-4 justify-between">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-8 w-32 bg-gray-200 rounded-xl" />
          ))}
        </div>

        {/* TABLE */}
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <table className="min-w-full border">
            <thead className="bg-black text-gray-200">
              <tr>
                {Array.from({ length: 12 }).map((_, i) => (
                  <th key={i} className="p-4">
                    <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 8 }).map((_, row) => (
                <tr key={row} className="border-b">
                  {Array.from({ length: 12 }).map((_, col) => (
                    <td key={col} className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-5">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};