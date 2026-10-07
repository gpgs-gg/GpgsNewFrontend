import { useState, useMemo } from "react";
import { Eye, Pencil, Filter, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
// import RentLadgerFiilter from "./RentLadgerFiilter";
import { useParams } from "react-router-dom";
import { useRentHistoryForBooking } from "./services";
import { IoIosArrowBack } from "react-icons/io";
import { useAuth } from "../../context/authContext";
import { formatDate } from "../../utils/dateFormatter";
import NoDataFound from "../../components/common/NoDataFound";
import Pagination from "../../components/common/Pagination";

const RentHistory = () => {
  const { user } = useAuth();
  // Booking ID
  const bookingId = user?.bookingId; // ya user?.booking?._id (jo bhi tumhare user object me ho)

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useRentHistoryForBooking(bookingId);

  const apiData = [...(apiResponse?.data || [])].sort((a, b) => {
    if (a.stayType === "T. Booked" && b.stayType !== "T. Booked") return 1;
    if (a.stayType !== "T. Booked" && b.stayType === "T. Booked") return -1;
    return 0;
  });

  const permanentRent =
    apiData.find((item) => item.stayType === "P. Booked") || null;

  // Latest Temporary record
  const temporaryRents = apiData.filter(
    (item) => item.stayType === "T. Booked",
  );

  const latestTemporaryRent =
    temporaryRents.length > 0
      ? [...temporaryRents].sort((a, b) => {
          const dateA = new Date(
            a.updatedAt || a.createdAt || a.endDate || a.startDate || 0,
          ).getTime();

          const dateB = new Date(
            b.updatedAt || b.createdAt || b.endDate || b.startDate || 0,
          ).getTime();

          return dateB - dateA;
        })[0]
      : null;

  const currentRent = permanentRent || latestTemporaryRent || {};

  const client = currentRent?.clientId || {};
  const property = currentRent?.propertyId || {};
  const bed = currentRent?.bedId || {};

  // Total due = Permanent Due + Latest Temporary Due
  const permanentCurrentDue = Number(permanentRent?.currentDue || 0);
  const temporaryCurrentDue = Number(latestTemporaryRent?.currentDue || 0);
  const totalCurrentDue = permanentCurrentDue + temporaryCurrentDue;
  const fnfAmount = Number(permanentRent?.clientId?.fnf?.fnfAmount || 0);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = 10;
  // ✅ filter & search logic
  const filteredData = useMemo(() => {
    return apiData?.filter((item) => {
      console.log(item);
      const matchesSearch =
        !search ||
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        );

      return (
        (!filters.propertyCode || item.propertyCode === filters.propertyCode) &&
        (!filters.propertyLocation ||
          item.propertyLocation === filters.propertyLocation) &&
        (!filters.bedCount ||
          String(item.bedCount) === String(filters.bedCount)) &&
        (!filters.status || item.status === filters.status) &&
        matchesSearch
      );
    });
  }, [apiData, filters, search, bookingId]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    );
  }, [filteredData, currentPage]);

  const handleReset = () => {
    setFilters({});
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2  ">
            <div className="flex w-full justify-between items-center"></div>
          </div>

          {bookingId && client && (
            <div className="space-y-5">
              {/* ================= TOP TOTAL DUE ================= */}
              <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white px-5 p-2 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-md font-semibold  tracking-widest text-red-600">
                      Total Amount Due
                    </p>

                    <p
                      className={`mt-1 text-2xl font-bold tracking-tight ${
                        totalCurrentDue > 0
                          ? "text-red-600"
                          : totalCurrentDue < 0
                            ? "text-green-600"
                            : "text-gray-800"
                      }`}
                    >
                      ₹ {totalCurrentDue.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {fnfAmount > 0 && (
                <div
                  className={`rounded-2xl border px-5 p-2 shadow-sm ${
                    fnfAmount < 0
                      ? "border-red-200 bg-linear-to-r from-red-50 to-white"
                      : "border-green-200 bg-linear-to-r from-green-50 to-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p
                        className={`text-md font-semibold tracking-widest ${
                          fnfAmount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {fnfAmount < 0
                          ? "FNF Payable Amount"
                          : "Refundable Amount"}
                      </p>

                      <p
                        className={`mt-1 text-2xl font-bold tracking-tight ${
                          fnfAmount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹ {fnfAmount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MAIN CONTENT ================= */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
                {/* ================= LEFT - CLIENT DETAILS ================= */}

                {/* ================= RIGHT - PAYMENT DETAILS ================= */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-2 border-b flex gap-10  items-center border-gray-100 pb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Payment Summary
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
                    {/* Rent */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Rent Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹
                        {Number(currentRent.rentAmt || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* EB */}
                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                        EB Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-orange-600">
                        ₹
                        {Number(currentRent.ebAmt || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Parking */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Parking Charges
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹
                        {Number(currentRent.parkingCharges || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Processing */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Processing Fee
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹
                        {Number(currentRent.processingFees || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Previous Due */}
                    <div className="rounded-xl bg-yellow-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-yellow-700">
                        Previous Due
                      </p>
                      <p className="mt-1 text-lg font-bold text-yellow-700">
                        ₹
                        {Number(currentRent.previousDue || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Adjustment */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Adjusted Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹
                        {Number(currentRent.adjAmt || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Total Received */}
                    <div className="rounded-xl bg-green-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                        Total Received
                      </p>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        ₹
                        {Number(currentRent.totalReceived || 0).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    {/* Days */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Days Count
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {currentRent.daysCount || 0}
                      </p>
                    </div>
                    {/* Deposit */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Deposit
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {currentRent.depositAmount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABLE */}
        {/* WRAPPER */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75dvh] sm:h-[75vh]">
          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-3">
            <div className="relative w-full sm:w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full text-sm sm:text-base"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 min-h-0 overflow-auto">
            {paginatedData.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <NoDataFound
                  title="No Rent History Found"
                  description="No rent history available for this client."
                />
              </div>
            ) : (
              <>
                {/* ===================== MOBILE CARDS (sm se chhota) ===================== */}
                <div className="sm:hidden p-3 space-y-3">
                  {paginatedData.map((item) => {
                    const isCurrent =
                      item.monthName === currentMonth &&
                      item.year === currentYear &&
                      item.paymentStatus !== "Shifted";

                    return (
                      <div
                        key={item._id}
                        className={`rounded-lg border p-3 shadow-sm ${
                          isCurrent
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        {/* Header: Property + Pay Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-gray-800 text-sm">
                            {item.propertyId?.propertyCode || "-"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold
                      ${
                        item.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : item.paymentStatus === "Partial"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.paymentStatus === "Shifted"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                      }`}
                          >
                            {item.paymentStatus}
                          </span>
                        </div>

                        {/* Stay + Month/Year */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              item.stayType === "T. Booked"
                                ? "bg-orange-100 text-orange-700"
                                : item.stayType === "P. Booked"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.stayType === "T. Booked"
                              ? "Temporary"
                              : item.stayType === "P. Booked"
                                ? "Permanent"
                                : item.stayType || "-"}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            {item.monthName} {item.year}
                          </span>
                        </div>

                        {/* Key amounts */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-gray-50 rounded-md p-2">
                            <div className="text-[10px] text-gray-500 uppercase">
                              Current Due
                            </div>
                            <div
                              className={`text-sm font-bold ${
                                item.currentDue > 0
                                  ? "text-red-600"
                                  : item.currentDue < 0
                                    ? "text-green-600"
                                    : "text-gray-700"
                              }`}
                            >
                              ₹{item.currentDue}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-md p-2">
                            <div className="text-[10px] text-gray-500 uppercase">
                              Total Received
                            </div>
                            <div className="text-sm font-bold text-green-600">
                              ₹
                              {Number(item.totalReceived || 0).toLocaleString(
                                "en-IN",
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-md p-2">
                            <div className="text-[10px] text-gray-500 uppercase">
                              Receivable
                            </div>
                            <div className="text-sm font-semibold">
                              ₹{item.totalReceivable}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-md p-2">
                            <div className="text-[10px] text-gray-500 uppercase">
                              Rent Amount
                            </div>
                            <div className="text-sm font-semibold">
                              ₹{item.rentAmt}
                            </div>
                          </div>
                        </div>

                        {/* Expandable details */}
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-semibold text-blue-600 select-none">
                            View full details
                          </summary>

                          <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Days Count</span>
                              <span className="font-semibold">
                                {item.daysCount}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">EB Amount</span>
                              <span className="font-semibold">
                                ₹{item.ebAmt}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Adj. EB</span>
                              <span className="font-semibold">
                                ₹{item.adjEB}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">
                                Previous Due
                              </span>
                              <span className="font-semibold">
                                ₹{item.previousDue}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Parking</span>
                              <span className="font-semibold">
                                ₹{item.parkingCharges}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Deposit</span>
                              <span className="font-semibold">
                                ₹{item.depositAmount}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">
                                Processing Fee
                              </span>
                              <span className="font-semibold">
                                ₹{item.processingFees}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Adj. Amount</span>
                              <span className="font-semibold">
                                ₹{item.adjAmt}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Flat EB</span>
                              <span className="font-semibold">
                                ₹{item.flatEB}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">
                                Monthly Rent
                              </span>
                              <span className="font-semibold">
                                ₹{item.monthlyRent}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Start Date</span>
                              <span className="font-semibold">
                                {item.startDate
                                  ? formatDate(item.startDate)
                                  : "-"}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-1">
                              <span className="text-gray-500">Last Date</span>
                              <span className="font-semibold">
                                {item.endDate ? formatDate(item.endDate) : "-"}
                              </span>
                            </div>
                          </div>

                          {/* Comments */}
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">
                              Payment Comments
                            </div>
                            {item?.paymentComments?.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {[...item.paymentComments]
                                  .reverse()
                                  .map((comment, index) => {
                                    const date = comment?.date
                                      ? new Date(comment.date)
                                      : null;
                                    const formattedDate =
                                      date && !isNaN(date.getTime())
                                        ? date.toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : "";
                                    const formattedTime =
                                      date && !isNaN(date.getTime())
                                        ? date.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                          })
                                        : "";

                                    return (
                                      <div
                                        key={comment?._id || index}
                                        className="text-xs text-gray-700 leading-relaxed whitespace-normal break-words"
                                      >
                                        <span className="font-semibold text-gray-800">
                                          [{formattedDate} {formattedTime}]
                                        </span>{" "}
                                        {comment?.comment}
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                No comment
                              </span>
                            )}
                          </div>

                          {/* Remarks */}
                          {item.remarks && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="text-[10px] text-gray-500 uppercase mb-1">
                                Remarks
                              </div>
                              <div className="text-xs text-gray-700 break-words">
                                {item.remarks}
                              </div>
                            </div>
                          )}
                        </details>
                      </div>
                    );
                  })}
                </div>

                {/* ===================== DESKTOP TABLE (sm aur upar) ===================== */}
                <div className="hidden sm:block h-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 whitespace-nowrap z-10">
                      <tr>
                        <th className="p-3 text-center">Property</th>
                        <th className="p-3 text-center">Stay</th>
                        <th className="p-3 text-center">Pay Status</th>
                        <th className="p-3 text-center">Month</th>
                        <th className="p-3 text-center">Year</th>
                        <th className="p-3 text-center">Current Due</th>
                        <th className="p-3 text-center">Total Received</th>
                        <th className="p-3 text-center">Total Receivable</th>
                        <th className="p-3 text-center">Rent Amount</th>
                        <th className="p-3 text-center">Days Count</th>
                        <th className="p-3 text-center">EB Amount</th>
                        <th className="p-3 text-center">Adj. EB</th>
                        <th className="p-3 text-center">Previous Due</th>
                        <th className="p-3 text-center">Parking Charges</th>
                        <th className="p-3 text-center">Deposit</th>
                        <th className="p-3 text-center">Processing Fee</th>
                        <th className="p-3 text-center">Adj. Amount</th>
                        <th className="p-3 text-center">Flat EB</th>
                        <th className="p-3 text-center">Monthly Rent</th>
                        <th className="p-3 text-center">Rent Start Date</th>
                        <th className="p-3 text-center">Rent Last Date</th>
                        <th className="p-3 text-center">Payment Comments</th>
                        <th className="p-3 text-center">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item) => (
                        <tr
                          key={item._id}
                          className={`border-t border-gray-200 whitespace-nowrap text-center
                    ${
                      item.monthName === currentMonth &&
                      item.year === currentYear &&
                      item.paymentStatus !== "Shifted"
                        ? "bg-green-100 hover:bg-green-100"
                        : "hover:bg-gray-50"
                    }`}
                        >
                          <td className="p-3 font-bold">
                            {item.propertyId?.propertyCode}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                item.stayType === "T. Booked"
                                  ? "bg-orange-100 text-orange-700"
                                  : item.stayType === "P. Booked"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {item.stayType === "T. Booked"
                                ? "Temporary"
                                : item.stayType === "P. Booked"
                                  ? "Permanent"
                                  : item.stayType || "-"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 text-sm rounded-full font-semibold
                        ${
                          item.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : item.paymentStatus === "Partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.paymentStatus === "Shifted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                        }`}
                            >
                              {item.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{item.monthName}</td>
                          <td className="p-3">{item.year}</td>
                          <td
                            className={`p-3 font-semibold ${
                              item.currentDue > 0
                                ? "text-red-600"
                                : item.currentDue < 0
                                  ? "text-green-600"
                                  : "text-gray-700"
                            }`}
                          >
                            ₹{item.currentDue}
                          </td>
                          <td className="p-3 text-green-600">
                            <div className="relative group inline-block">
                              <span className="font-semibold cursor-pointer">
                                ₹
                                {Number(item.totalReceived || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </span>
                              {item.totalReceivedHistory?.length > 0 && (
                                <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-[100] w-max">
                                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
                                    <div className="text-xs text-gray-500 mb-1">
                                      Payment Breakdown
                                    </div>
                                    <div className="text-sm font-semibold text-green-600 whitespace-nowrap">
                                      {item.totalReceivedHistory
                                        .map((payment) =>
                                          Number(
                                            payment.amount || 0,
                                          ).toLocaleString("en-IN"),
                                        )
                                        .join(" + ")}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3 font-semibold">
                            ₹{item.totalReceivable}
                          </td>
                          <td className="p-3">₹{item.rentAmt}</td>
                          <td className="p-3">{item.daysCount}</td>
                          <td className="p-3">₹{item.ebAmt}</td>
                          <td className="p-3">₹{item.adjEB}</td>
                          <td className="p-3">₹{item.previousDue}</td>
                          <td className="p-3">₹{item.parkingCharges}</td>
                          <td className="p-3">₹{item.depositAmount}</td>
                          <td className="p-3">₹{item.processingFees}</td>
                          <td className="p-3">₹{item.adjAmt}</td>
                          <td className="p-3">₹{item.flatEB}</td>
                          <td className="p-3">₹{item.monthlyRent}</td>

                          <td className="p-3">
                            {item.startDate ? formatDate(item.startDate) : "-"}
                          </td>
                          <td className="p-3">
                            {item.endDate ? formatDate(item.endDate) : "-"}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="relative group flex-1 min-w-0">
                                {item?.paymentComments?.length > 0 ? (
                                  <>
                                    <div className="text-sm text-gray-700 cursor-pointer">
                                      {(() => {
                                        const latestComment =
                                          item.paymentComments[
                                            item.paymentComments.length - 1
                                          ];
                                        const date = latestComment?.date
                                          ? new Date(latestComment.date)
                                          : null;
                                        const formattedDate =
                                          date && !isNaN(date.getTime())
                                            ? date.toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                              })
                                            : "";
                                        const formattedTime =
                                          date && !isNaN(date.getTime())
                                            ? date.toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                              })
                                            : "";
                                        const text =
                                          latestComment?.comment || "";
                                        const words = text.trim().split(/\s+/);
                                        return (
                                          <>
                                            <span className="font-semibold text-gray-700">
                                              [{formattedDate} {formattedTime}]
                                            </span>{" "}
                                            {words.slice(0, 2).join(" ")}
                                            {words.length > 2 ? "..." : ""}
                                          </>
                                        );
                                      })()}
                                    </div>
                                    <div className="hidden group-hover:block absolute right-full top-0 w-[420px] max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-3 text-left">
                                      <div className="space-y-3 text-left">
                                        {[...item.paymentComments]
                                          .reverse()
                                          .map((comment, index) => {
                                            const date = comment?.date
                                              ? new Date(comment.date)
                                              : null;
                                            const formattedDate =
                                              date && !isNaN(date.getTime())
                                                ? date.toLocaleDateString(
                                                    "en-GB",
                                                    {
                                                      day: "2-digit",
                                                      month: "short",
                                                      year: "numeric",
                                                    },
                                                  )
                                                : "";
                                            const formattedTime =
                                              date && !isNaN(date.getTime())
                                                ? date.toLocaleTimeString(
                                                    "en-US",
                                                    {
                                                      hour: "2-digit",
                                                      minute: "2-digit",
                                                      hour12: true,
                                                    },
                                                  )
                                                : "";
                                            return (
                                              <div
                                                key={comment?._id || index}
                                                className="w-full text-left text-sm text-gray-700 leading-relaxed whitespace-normal break-words"
                                              >
                                                <span className="font-semibold text-gray-800">
                                                  [{formattedDate}{" "}
                                                  {formattedTime}]
                                                </span>{" "}
                                                {comment?.comment}
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    No comment
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3">{item.remarks || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* PAGINATION */}
          <div className="border-t p-3 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </span>
            <div className="flex justify-center sm:justify-end overflow-x-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* <RentLadgerFiilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        onApply={(data) => setFilters(data)}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      /> */}
    </>
  );
};

export default RentHistory;
