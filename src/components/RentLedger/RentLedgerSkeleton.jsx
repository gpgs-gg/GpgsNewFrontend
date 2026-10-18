import React from "react";
import { useParams } from "react-router-dom";

const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 ${className}`}
  />
);

const RentLedgerSkeleton = () => {
  const { clientId } = useParams();

  const columns = [
    "Property",
    "Pay Status",
    "Month",
    "Year",
    "Current Due",
    "Total Received",
    "Total Receivable",
    "Rent Amount",
    "Days Count",
    "EB Amount",
    "Adj. EB",
    "Previous Due",
    "Parking Charges",
    "Deposit",
    "Processing Fee",
    "Adj. Amount",
    "Flat EB",
    "Monthly Rent",
    "Rent Start Date",
    "Rent Last Date",
    "Payment Comments",
    "Remarks",
    "Actions",
  ];

  return (
    <div className="space-y-5">
      {/* Header Skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-7 w-64 max-w-full" />
            {!clientId && (
              <Skeleton className="h-4 w-40 max-w-full" />
            )}
          </div>

          <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
        </div>

        {/* Client Information Skeleton */}
        {clientId && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <Skeleton className="mb-3 h-3 w-24 max-w-full" />
                <Skeleton className="h-5 w-32 max-w-full" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Container Skeleton */}
      <div className="flex h-[75vh] min-h-[450px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Search and Filter Skeleton */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full rounded-lg sm:max-w-xs" />

          <div className="flex gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-max border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-100">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column}
                    className={`whitespace-nowrap border-b border-gray-200 px-4 py-4 ${
                      index === columns.length - 1
                        ? "sticky right-0 z-20 bg-gray-100"
                        : ""
                    }`}
                  >
                    <Skeleton className="mx-auto h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-gray-100"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column}`}
                      className={`whitespace-nowrap px-4 py-4 ${
                        colIndex === columns.length - 1
                          ? "sticky right-0 z-[1] bg-white"
                          : ""
                      }`}
                    >
                      {colIndex === 1 ? (
                        <Skeleton className="mx-auto h-6 w-20 rounded-full" />
                      ) : colIndex === 4 || colIndex === 5 ? (
                        <Skeleton className="mx-auto h-4 w-24" />
                      ) : colIndex === 20 ? (
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      ) : colIndex === columns.length - 1 ? (
                        <div className="flex justify-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                      ) : (
                        <Skeleton
                          className={`mx-auto h-4 ${
                            colIndex % 3 === 0
                              ? "w-16"
                              : colIndex % 3 === 1
                                ? "w-24"
                                : "w-20"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex flex-col gap-3 border-t border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-40 max-w-full" />

          <div className="flex items-center justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentLedgerSkeleton;