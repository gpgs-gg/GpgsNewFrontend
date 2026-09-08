
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


  // ✅ safe extraction
const apiData = [...(apiResponse?.data || [])].sort((a, b) => {
  if (a.stayType === "T. Booked" && b.stayType !== "T. Booked") return 1;
  if (a.stayType !== "T. Booked" && b.stayType === "T. Booked") return -1;
  return 0;
});

const permanentRent =
  apiData.find((item) => item.stayType === "P. Booked") || null;

const currentRent = permanentRent || {};

const client = currentRent?.clientId || {};
const property = currentRent?.propertyId || {};
const bed = currentRent?.bedId || {};
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = 10;
  // ✅ filter & search logic
  const filteredData = useMemo(() => {
    return apiData?.filter((item) => {
      console.log(item)
      const matchesSearch =
        !search ||
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        );


      return (
        (!filters.propertyCode ||
          item.propertyCode === filters.propertyCode) &&
        (!filters.propertyLocation ||
          item.propertyLocation === filters.propertyLocation) &&
        (!filters.bedCount ||
          String(item.bedCount) === String(filters.bedCount)) &&
        (!filters.status ||
          item.status === filters.status) &&
        matchesSearch
      );
    });
  }, [apiData, filters, search, bookingId]);



  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
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
            <div className="flex w-full justify-between items-center">
            </div>
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
                      className={`mt-1 text-2xl font-bold tracking-tight ${Number(currentRent.currentDue) > 0
                        ? "text-red-600"
                        : Number(currentRent.currentDue) < 0
                          ? "text-green-600"
                          : "text-gray-800"
                        }`}
                    >
                      ₹ {Number(currentRent.currentDue || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>


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

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">

                    {/* Rent */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Rent Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{Number(currentRent.rentAmt || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* EB */}
                    <div className="rounded-xl bg-orange-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                        EB Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-orange-600">
                        ₹{Number(currentRent.ebAmt || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Parking */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Parking Charges
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{Number(currentRent.parkingCharges || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Processing */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Processing Fee
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{Number(currentRent.processingFees || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Previous Due */}
                    <div className="rounded-xl bg-yellow-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-yellow-700">
                        Previous Due
                      </p>
                      <p className="mt-1 text-lg font-bold text-yellow-700">
                        ₹{Number(currentRent.previousDue || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Adjustment */}
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Adjusted Amount
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{Number(currentRent.adjAmt || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Total Received */}
                    <div className="rounded-xl bg-green-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                        Total Received
                      </p>
                      <p className="mt-1 text-lg font-bold text-green-600">
                        ₹{Number(currentRent.totalReceived || 0).toLocaleString("en-IN")}
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




                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">

          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">

            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search property..."
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

          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto">

            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-3 text-center">Property</th>
                  <th className="p-3 text-center">Stay</th>
                  <th className="p-3 text-center">Pay Status</th>
                  <th className="p-3 text-center">Month</th>
                  <th className="p-3 text-center">Year</th>
                  {/* <th className="p-3 text-center">Stay Type</th> */}
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
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (

                    <tr
                      key={item._id}
                      className={`border-t border-gray-200 whitespace-nowrap text-center
    ${item.monthName === currentMonth && item.year === currentYear && item.paymentStatus !== "Shifted"
                          ? "bg-green-100 hover:bg-green-100"
                          : "hover:bg-gray-50"
                        }`}
                    >

                      <td className="p-3 font-bold">{item.propertyId?.propertyCode}</td>
                       <td className="p-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${item.stayType === "T. Booked"
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
                             ${item.paymentStatus === "Paid"
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
                      {/* <td className="p-3">{item.stayType}</td> */}
                      <td
                        className={`p-3 font-semibold ${item.currentDue > 0
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

                          {/* Total */}
                          <span className="font-semibold cursor-pointer">
                            ₹{Number(item.totalReceived || 0).toLocaleString("en-IN")}
                          </span>

                          {/* Hover */}
                          {item.totalReceivedHistory?.length > 0 && (
                            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-[100] w-max">
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">

                                <div className="text-xs text-gray-500 mb-1">
                                  Payment Breakdown
                                </div>

                                <div className="text-sm font-semibold text-green-600 whitespace-nowrap">
                                  {item.totalReceivedHistory
                                    .map((payment) =>
                                      Number(payment.amount || 0).toLocaleString("en-IN")
                                    )
                                    .join(" + ")}
                                </div>

                              </div>
                            </div>
                          )}

                        </div>
                      </td>
                      <td className="p-3 font-semibold">₹{item.totalReceivable}</td>
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


                      {/* <td className="p-3">₹{item.parkingChargesReceived}</td> */}
                      {/* <td className="p-3">₹{item.parkingChargesDue}</td> */}

                      {/* <td className="p-3">₹{item.processingFeesReceived}</td> */}
                      {/* <td className="p-3">₹{item.processingFeesDue}</td> */}

                      {/* <td className="p-3">₹{item.depositAmountReceived}</td> */}
                      {/* <td className="p-3">₹{item.depositAmountDue}</td> */}



                      <td className="p-3">
                        {item.startDate ? formatDate(item.startDate) : "-"}
                      </td>

                      <td className="p-3">
                        {item.endDate ? formatDate(item.endDate) : "-"}
                      </td>


                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {/* Payment Comments */}
                          <div className="relative group flex-1 min-w-0">
                            {item?.paymentComments?.length > 0 ? (
                              <>
                                {/* Latest Comment */}
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

                                    const text = latestComment?.comment || "";
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

                                {/* Hover Worklog */}
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
                                            className="w-full text-left text-sm text-gray-700 leading-relaxed whitespace-normal break-words"
                                          >
                                            <span className="font-semibold text-gray-800">
                                              [{formattedDate} {formattedTime}]
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="h-64">
                      <div className="flex items-center justify-center h-full">
                        <NoDataFound
                          title="No Rent History Found"
                          description="No rent history available for this client."
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

          {/* PAGINATION */}
          <div className="border-t p-3 flex justify-between items-center">

            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

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







// import { useState, useMemo } from "react";
// import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import { IoIosArrowBack } from "react-icons/io";

// import { useRentHistoryForBooking } from "./services";
// import { useAuth } from "../../context/authContext";
// import { formatDate } from "../../utils/dateFormatter";
// import NoDataFound from "../../components/common/NoDataFound";
// import Pagination from "../../components/Common/Pagination";

// const RentHistory = () => {
//   const { user } = useAuth();

//   // ============================================================
//   // BOOKING ID
//   // ============================================================

//   const bookingId = user?.bookingId;

//   // ============================================================
//   // API
//   // ============================================================

//   const {
//     data: apiResponse,
//     isLoading,
//     isError,
//     error,
//   } = useRentHistoryForBooking(bookingId);

//   // ============================================================
//   // API DATA
//   // ============================================================

//   const apiData = apiResponse?.data || [];

//   // ============================================================
//   // TEMPORARY & PERMANENT RENT HISTORY
//   // ============================================================

//   const temporaryRent =
//     apiData.find(
//       (item) => item.stayType === "T. Booked"
//     ) || null;

//   const permanentRent =
//     apiData.find(
//       (item) => item.stayType === "P. Booked"
//     ) || null;

//   // Permanent record gets priority for common client details
//   const currentRent =
//     permanentRent || temporaryRent || {};

//   const client = currentRent?.clientId || {};
//   const property = currentRent?.propertyId || {};
//   const bed = currentRent?.bedId || {};

//   // ============================================================
//   // STATES
//   // ============================================================

//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const rowsPerPage = 10;

//   // ============================================================
//   // CURRENT MONTH / YEAR
//   // ============================================================

//   const currentMonth = new Date().toLocaleString("en-US", {
//     month: "long",
//   });

//   const currentYear = new Date().getFullYear();

//   // ============================================================
//   // SEARCH & FILTER
//   // ============================================================

//   const filteredData = useMemo(() => {
//     return apiData.filter((item) => {
//       const searchValue = search.trim().toLowerCase();

//       if (!searchValue) {
//         return true;
//       }

//       const searchableValues = [
//         item?.propertyId?.propertyCode,
//         item?.stayType,
//         item?.paymentStatus,
//         item?.monthName,
//         item?.year,
//         item?.rentAmt,
//         item?.ebAmt,
//         item?.adjEB,
//         item?.previousDue,
//         item?.parkingCharges,
//         item?.depositAmount,
//         item?.processingFees,
//         item?.adjAmt,
//         item?.flatEB,
//         item?.monthlyRent,
//         item?.daysCount,
//         item?.currentDue,
//         item?.totalReceived,
//         item?.totalReceivable,
//         item?.remarks,
//         item?.clientId?.fullName,
//         item?.clientId?.callingNo,
//         item?.bedId?.roomNo,
//         item?.bedId?.bedNo,
//       ];

//       return searchableValues.some((value) =>
//         String(value ?? "")
//           .toLowerCase()
//           .includes(searchValue)
//       );
//     });
//   }, [apiData, search]);

//   // ============================================================
//   // PAGINATION
//   // ============================================================

//   const totalPages = Math.ceil(
//     filteredData.length / rowsPerPage
//   );

//   const paginatedData = useMemo(() => {
//     return filteredData.slice(
//       (currentPage - 1) * rowsPerPage,
//       currentPage * rowsPerPage
//     );
//   }, [filteredData, currentPage]);

//   // ============================================================
//   // FORMAT AMOUNT
//   // ============================================================

//   const formatAmount = (amount) => {
//     return Number(amount || 0).toLocaleString("en-IN");
//   };

//   // ============================================================
//   // STAY TYPE LABEL
//   // ============================================================

//   const getStayTypeLabel = (stayType) => {
//     if (stayType === "T. Booked") {
//       return "Temporary";
//     }

//     if (stayType === "P. Booked") {
//       return "Permanent";
//     }

//     return stayType || "-";
//   };

//   // ============================================================
//   // STAY TYPE CLASS
//   // ============================================================

//   const getStayTypeClass = (stayType) => {
//     if (stayType === "T. Booked") {
//       return "bg-orange-100 text-orange-700 border-orange-200";
//     }

//     if (stayType === "P. Booked") {
//       return "bg-blue-100 text-blue-700 border-blue-200";
//     }

//     return "bg-gray-100 text-gray-700 border-gray-200";
//   };

//   // ============================================================
//   // RESET SEARCH
//   // ============================================================

//   const handleReset = () => {
//     setSearch("");
//     setCurrentPage(1);
//   };

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (isLoading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#14223f]" />

//           <p className="text-sm text-gray-500">
//             Loading rent history...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // ERROR
//   // ============================================================

//   if (isError) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
//           <p className="font-semibold text-red-700">
//             Failed to load rent history
//           </p>

//           <p className="mt-1 text-sm text-red-500">
//             {error?.message || "Something went wrong"}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="space-y-5">

//         {/* ======================================================
//             HEADER
//         ====================================================== */}

//         <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">

//           <div className="mb-2 flex items-center justify-between">

//             <div className="flex w-full items-center justify-between">

//               <div>
//                 <h1 className="text-2xl font-bold uppercase text-gray-900">
//                   Payment History & Details
//                 </h1>

//                 {!bookingId && (
//                   <p className="mt-1 text-sm text-gray-500">
//                     Manage all PG Rent
//                   </p>
//                 )}
//               </div>

//               {!bookingId && (
//                 <button
//                   type="button"
//                   onClick={() => window.history.back()}
//                   className="
//                     mr-3
//                     flex
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-md
//                     border
//                     border-gray-300
//                     px-2
//                     py-1
//                     text-lg
//                     hover:bg-gray-50
//                   "
//                 >
//                   <IoIosArrowBack />
//                   Cancel
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* ====================================================
//               CLIENT SUMMARY
//           ==================================================== */}

//           {bookingId && client && (
//             <div className="space-y-5">

//               {/* ==================================================
//                   TOTAL AMOUNT DUE
//               ================================================== */}

//               <div className="
//                 rounded-2xl
//                 border
//                 border-red-200
//                 bg-gradient-to-r
//                 from-red-50
//                 to-white
//                 px-5
//                 py-3
//                 shadow-sm
//               ">
//                 <div className="
//                   flex
//                   flex-col
//                   gap-3
//                   sm:flex-row
//                   sm:items-center
//                   sm:justify-between
//                 ">

//                   <div>
//                     <p className="
//                       text-xs
//                       font-semibold
//                       uppercase
//                       tracking-widest
//                       text-red-600
//                     ">
//                       Total Amount Due
//                     </p>

//                     <p
//                       className={`
//                         mt-1
//                         text-3xl
//                         font-bold
//                         tracking-tight
//                         ${
//                           Number(currentRent.currentDue) > 0
//                             ? "text-red-600"
//                             : Number(currentRent.currentDue) < 0
//                               ? "text-green-600"
//                               : "text-gray-800"
//                         }
//                       `}
//                     >
//                       ₹
//                       {formatAmount(
//                         currentRent.currentDue
//                       )}
//                     </p>
//                   </div>

//                 </div>
//               </div>

//               {/* ==================================================
//                   TEMPORARY + PERMANENT SUMMARY
//               ================================================== */}

//               <div className="
//                 grid
//                 grid-cols-1
//                 gap-5
//                 lg:grid-cols-2
//               ">

//                 {/* =================================================
//                     TEMPORARY STAY
//                 ================================================= */}

//                 {temporaryRent && (
//                   <div className="
//                     overflow-hidden
//                     rounded-2xl
//                     border
//                     border-orange-200
//                     bg-orange-50/40
//                   ">

//                     {/* HEADER */}

//                     <div className="
//                       flex
//                       items-center
//                       justify-between
//                       border-b
//                       border-orange-200
//                       bg-orange-100/70
//                       px-4
//                       py-3
//                     ">

//                       <div>
//                         <p className="
//                           text-sm
//                           font-bold
//                           text-orange-800
//                         ">
//                           Temporary Stay
//                         </p>

//                         <p className="
//                           mt-0.5
//                           text-xs
//                           text-orange-600
//                         ">
//                           T. Booked
//                         </p>
//                       </div>

//                       <span className="
//                         rounded-full
//                         border
//                         border-orange-200
//                         bg-orange-200
//                         px-3
//                         py-1
//                         text-xs
//                         font-bold
//                         text-orange-800
//                       ">
//                         TEMPORARY
//                       </span>
//                     </div>

//                     {/* DETAILS */}

//                     <div className="
//                       grid
//                       grid-cols-2
//                       gap-3
//                       p-4
//                       sm:grid-cols-4
//                     ">

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Property
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {temporaryRent?.propertyId?.propertyCode ||
//                             "-"}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Month
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {temporaryRent.monthName || "-"}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Days
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {temporaryRent.daysCount || 0}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Rent
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           ₹{formatAmount(temporaryRent.rentAmt)}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           EB
//                         </p>

//                         <p className="mt-1 font-semibold text-orange-600">
//                           ₹{formatAmount(temporaryRent.ebAmt)}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Received
//                         </p>

//                         <p className="mt-1 font-semibold text-green-600">
//                           ₹
//                           {formatAmount(
//                             temporaryRent.totalReceived
//                           )}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Receivable
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           ₹
//                           {formatAmount(
//                             temporaryRent.totalReceivable
//                           )}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Due
//                         </p>

//                         <p
//                           className={`
//                             mt-1
//                             font-bold
//                             ${
//                               Number(
//                                 temporaryRent.currentDue
//                               ) > 0
//                                 ? "text-red-600"
//                                 : "text-green-600"
//                             }
//                           `}
//                         >
//                           ₹
//                           {formatAmount(
//                             temporaryRent.currentDue
//                           )}
//                         </p>
//                       </div>
//                     </div>

//                     {/* STAY PERIOD */}

//                     <div className="
//                       border-t
//                       border-orange-200
//                       px-4
//                       py-3
//                       text-xs
//                       text-gray-600
//                     ">
//                       <span className="font-semibold">
//                         Stay Period:
//                       </span>{" "}

//                       {temporaryRent.startDate
//                         ? formatDate(
//                             temporaryRent.startDate
//                           )
//                         : "-"}

//                       {" → "}

//                       {temporaryRent.endDate
//                         ? formatDate(
//                             temporaryRent.endDate
//                           )
//                         : "-"}
//                     </div>

//                   </div>
//                 )}

//                 {/* =================================================
//                     PERMANENT STAY
//                 ================================================= */}

//                 {permanentRent && (
//                   <div className="
//                     overflow-hidden
//                     rounded-2xl
//                     border
//                     border-blue-200
//                     bg-blue-50/40
//                   ">

//                     {/* HEADER */}

//                     <div className="
//                       flex
//                       items-center
//                       justify-between
//                       border-b
//                       border-blue-200
//                       bg-blue-100/70
//                       px-4
//                       py-3
//                     ">

//                       <div>
//                         <p className="
//                           text-sm
//                           font-bold
//                           text-blue-800
//                         ">
//                           Permanent Stay
//                         </p>

//                         <p className="
//                           mt-0.5
//                           text-xs
//                           text-blue-600
//                         ">
//                           P. Booked
//                         </p>
//                       </div>

//                       <span className="
//                         rounded-full
//                         border
//                         border-blue-200
//                         bg-blue-200
//                         px-3
//                         py-1
//                         text-xs
//                         font-bold
//                         text-blue-800
//                       ">
//                         PERMANENT
//                       </span>
//                     </div>

//                     {/* DETAILS */}

//                     <div className="
//                       grid
//                       grid-cols-2
//                       gap-3
//                       p-4
//                       sm:grid-cols-4
//                     ">

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Property
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {permanentRent?.propertyId
//                             ?.propertyCode || "-"}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Month
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {permanentRent.monthName || "-"}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Days
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           {permanentRent.daysCount || 0}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Rent
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           ₹{formatAmount(permanentRent.rentAmt)}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           EB
//                         </p>

//                         <p className="mt-1 font-semibold text-blue-600">
//                           ₹{formatAmount(permanentRent.ebAmt)}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Received
//                         </p>

//                         <p className="mt-1 font-semibold text-green-600">
//                           ₹
//                           {formatAmount(
//                             permanentRent.totalReceived
//                           )}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Receivable
//                         </p>

//                         <p className="mt-1 font-semibold text-gray-900">
//                           ₹
//                           {formatAmount(
//                             permanentRent.totalReceivable
//                           )}
//                         </p>
//                       </div>

//                       <div>
//                         <p className="text-xs text-gray-500">
//                           Due
//                         </p>

//                         <p
//                           className={`
//                             mt-1
//                             font-bold
//                             ${
//                               Number(
//                                 permanentRent.currentDue
//                               ) > 0
//                                 ? "text-red-600"
//                                 : "text-green-600"
//                             }
//                           `}
//                         >
//                           ₹
//                           {formatAmount(
//                             permanentRent.currentDue
//                           )}
//                         </p>
//                       </div>

//                     </div>

//                     {/* STAY PERIOD */}

//                     <div className="
//                       border-t
//                       border-blue-200
//                       px-4
//                       py-3
//                       text-xs
//                       text-gray-600
//                     ">
//                       <span className="font-semibold">
//                         Stay Period:
//                       </span>{" "}

//                       {permanentRent.startDate
//                         ? formatDate(
//                             permanentRent.startDate
//                           )
//                         : "-"}

//                       {" → "}

//                       {permanentRent.endDate
//                         ? formatDate(
//                             permanentRent.endDate
//                           )
//                         : "-"}
//                     </div>

//                   </div>
//                 )}

//               </div>

//               {/* ==================================================
//                   PAYMENT SUMMARY
//               ================================================== */}

//               <div className="
//                 rounded-2xl
//                 border
//                 border-gray-200
//                 bg-white
//                 p-5
//                 shadow-sm
//               ">

//                 {/* HEADER */}

//                 <div className="
//                   mb-3
//                   flex
//                   flex-col
//                   gap-3
//                   border-b
//                   border-gray-100
//                   pb-3
//                   sm:flex-row
//                   sm:items-center
//                   sm:justify-between
//                 ">

//                   <div>
//                     <h3 className="
//                       text-base
//                       font-semibold
//                       text-gray-900
//                     ">
//                       Current Payment Summary
//                     </h3>

//                     <p className="
//                       mt-1
//                       text-xs
//                       text-gray-500
//                     ">
//                       Latest rent record details
//                     </p>
//                   </div>

//                   <div className="text-left sm:text-right">

//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-400
//                     ">
//                       Client
//                     </p>

//                     <p className="
//                       mt-1
//                       font-semibold
//                       text-gray-900
//                     ">
//                       {client.fullName || "-"}
//                     </p>

//                     <p className="text-xs text-gray-500">
//                       {client.callingNo || "-"}
//                       {" • "}
//                       Room {bed?.roomNo || "-"}
//                       {" • "}
//                       Bed {bed?.bedNo || "-"}
//                     </p>

//                   </div>

//                 </div>

//                 {/* CURRENT RECORD STAY TYPE */}

//                 <div className="mb-4 flex items-center gap-2">

//                   <span className="
//                     text-xs
//                     font-medium
//                     uppercase
//                     tracking-wide
//                     text-gray-500
//                   ">
//                     Current Record:
//                   </span>

//                   <span
//                     className={`
//                       rounded-full
//                       border
//                       px-3
//                       py-1
//                       text-xs
//                       font-semibold
//                       ${getStayTypeClass(
//                         currentRent.stayType
//                       )}
//                     `}
//                   >
//                     {getStayTypeLabel(
//                       currentRent.stayType
//                     )}
//                   </span>

//                 </div>

//                 {/* DETAILS */}

//                 <div className="
//                   grid
//                   grid-cols-1
//                   gap-3
//                   sm:grid-cols-2
//                   md:grid-cols-4
//                   lg:grid-cols-8
//                 ">

//                   {/* RENT */}

//                   <div className="
//                     rounded-xl
//                     bg-gray-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-500
//                     ">
//                       Rent Amount
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-gray-900
//                     ">
//                       ₹{formatAmount(currentRent.rentAmt)}
//                     </p>
//                   </div>

//                   {/* EB */}

//                   <div className="
//                     rounded-xl
//                     bg-orange-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-orange-600
//                     ">
//                       EB Amount
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-orange-600
//                     ">
//                       ₹{formatAmount(currentRent.ebAmt)}
//                     </p>
//                   </div>

//                   {/* PARKING */}

//                   <div className="
//                     rounded-xl
//                     bg-gray-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-500
//                     ">
//                       Parking Charges
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-gray-900
//                     ">
//                       ₹
//                       {formatAmount(
//                         currentRent.parkingCharges
//                       )}
//                     </p>
//                   </div>

//                   {/* PROCESSING */}

//                   <div className="
//                     rounded-xl
//                     bg-gray-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-500
//                     ">
//                       Processing Fee
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-gray-900
//                     ">
//                       ₹
//                       {formatAmount(
//                         currentRent.processingFees
//                       )}
//                     </p>
//                   </div>

//                   {/* PREVIOUS DUE */}

//                   <div className="
//                     rounded-xl
//                     bg-yellow-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-yellow-700
//                     ">
//                       Previous Due
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-yellow-700
//                     ">
//                       ₹
//                       {formatAmount(
//                         currentRent.previousDue
//                       )}
//                     </p>
//                   </div>

//                   {/* ADJUSTMENT */}

//                   <div className="
//                     rounded-xl
//                     bg-gray-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-500
//                     ">
//                       Adjusted Amount
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-gray-900
//                     ">
//                       ₹
//                       {formatAmount(
//                         currentRent.adjAmt
//                       )}
//                     </p>
//                   </div>

//                   {/* TOTAL RECEIVED */}

//                   <div className="
//                     rounded-xl
//                     bg-green-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-green-600
//                     ">
//                       Total Received
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-green-600
//                     ">
//                       ₹
//                       {formatAmount(
//                         currentRent.totalReceived
//                       )}
//                     </p>
//                   </div>

//                   {/* DAYS */}

//                   <div className="
//                     rounded-xl
//                     bg-gray-50
//                     p-4
//                   ">
//                     <p className="
//                       text-xs
//                       font-medium
//                       uppercase
//                       tracking-wide
//                       text-gray-500
//                     ">
//                       Days Count
//                     </p>

//                     <p className="
//                       mt-1
//                       text-lg
//                       font-bold
//                       text-gray-900
//                     ">
//                       {currentRent.daysCount || 0}
//                     </p>
//                   </div>

//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* ========================================================
//             TABLE
//         ======================================================== */}

//         <div className="
//           flex
//           h-[75vh]
//           flex-col
//           overflow-hidden
//           rounded-xl
//           border
//           border-gray-200
//           bg-white
//           shadow-sm
//         ">

//           {/* SEARCH */}

//           <div className="
//             flex
//             justify-between
//             gap-3
//             border-b
//             border-gray-300
//             px-3
//             py-2
//           ">

//             <div className="relative w-80">

//               <input
//                 className="
//                   w-full
//                   rounded-lg
//                   border
//                   border-gray-300
//                   px-3
//                   py-2
//                   pr-10
//                   outline-none
//                   focus:border-[#14223f]
//                   focus:ring-1
//                   focus:ring-[#14223f]
//                 "
//                 placeholder="Search property, client, stay type..."
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setCurrentPage(1);
//                 }}
//               />

//               {search && (
//                 <button
//                   type="button"
//                   onClick={handleReset}
//                   className="
//                     absolute
//                     right-3
//                     top-1/2
//                     -translate-y-1/2
//                     text-gray-500
//                     hover:text-red-500
//                   "
//                 >
//                   ✕
//                 </button>
//               )}

//             </div>

//           </div>

//           {/* ======================================================
//               TABLE CONTENT
//           ====================================================== */}

//           <div className="flex-1 overflow-auto">

//             <table className="w-full">

//               <thead className="
//                 sticky
//                 top-0
//                 z-20
//                 whitespace-nowrap
//                 bg-gray-100
//               ">

//                 <tr>

//                   <th className="p-3 text-center">
//                     Property
//                   </th>

//                   <th className="p-3 text-center">
//                     Stay Type
//                   </th>

//                   <th className="p-3 text-center">
//                     Pay Status
//                   </th>

//                   <th className="p-3 text-center">
//                     Month
//                   </th>

//                   <th className="p-3 text-center">
//                     Year
//                   </th>

//                   <th className="p-3 text-center">
//                     Current Due
//                   </th>

//                   <th className="p-3 text-center">
//                     Total Received
//                   </th>

//                   <th className="p-3 text-center">
//                     Total Receivable
//                   </th>

//                   <th className="p-3 text-center">
//                     Rent Amount
//                   </th>

//                   <th className="p-3 text-center">
//                     Days Count
//                   </th>

//                   <th className="p-3 text-center">
//                     EB Amount
//                   </th>

//                   <th className="p-3 text-center">
//                     Adj. EB
//                   </th>

//                   <th className="p-3 text-center">
//                     Previous Due
//                   </th>

//                   <th className="p-3 text-center">
//                     Parking Charges
//                   </th>

//                   <th className="p-3 text-center">
//                     Deposit
//                   </th>

//                   <th className="p-3 text-center">
//                     Processing Fee
//                   </th>

//                   <th className="p-3 text-center">
//                     Adj. Amount
//                   </th>

//                   <th className="p-3 text-center">
//                     Flat EB
//                   </th>

//                   <th className="p-3 text-center">
//                     Monthly Rent
//                   </th>

//                   <th className="p-3 text-center">
//                     Rent Start Date
//                   </th>

//                   <th className="p-3 text-center">
//                     Rent Last Date
//                   </th>

//                   <th className="p-3 text-center">
//                     Payment Comments
//                   </th>

//                   <th className="p-3 text-center">
//                     Remarks
//                   </th>

//                 </tr>

//               </thead>

//               <tbody>

//                 {paginatedData.length > 0 ? (
//                   paginatedData.map((item) => (

//                     <tr
//                       key={item._id}
//                       className={`
//                         whitespace-nowrap
//                         border-t
//                         border-gray-200
//                         text-center
//                         ${
//                           item.monthName === currentMonth &&
//                           item.year === currentYear &&
//                           item.paymentStatus !== "Shifted"
//                             ? "bg-green-100 hover:bg-green-100"
//                             : "hover:bg-gray-50"
//                         }
//                       `}
//                     >

//                       {/* PROPERTY */}

//                       <td className="p-3 font-bold">
//                         {item.propertyId?.propertyCode || "-"}
//                       </td>

//                       {/* STAY TYPE */}

//                       <td className="p-3">

//                         <span
//                           className={`
//                             inline-flex
//                             rounded-full
//                             border
//                             px-3
//                             py-1
//                             text-xs
//                             font-semibold
//                             ${getStayTypeClass(
//                               item.stayType
//                             )}
//                           `}
//                         >
//                           {getStayTypeLabel(
//                             item.stayType
//                           )}
//                         </span>

//                       </td>

//                       {/* PAYMENT STATUS */}

//                       <td className="p-3">

//                         <span
//                           className={`
//                             rounded-full
//                             px-3
//                             py-1
//                             text-sm
//                             font-semibold
//                             ${
//                               item.paymentStatus === "Paid"
//                                 ? "bg-green-100 text-green-700"
//                                 : item.paymentStatus === "Partial"
//                                   ? "bg-yellow-100 text-yellow-700"
//                                   : item.paymentStatus === "Shifted"
//                                     ? "bg-blue-100 text-blue-700"
//                                     : "bg-red-100 text-red-700"
//                             }
//                           `}
//                         >
//                           {item.paymentStatus || "-"}
//                         </span>

//                       </td>

//                       {/* MONTH */}

//                       <td className="p-3 font-bold">
//                         {item.monthName || "-"}
//                       </td>

//                       {/* YEAR */}

//                       <td className="p-3">
//                         {item.year || "-"}
//                       </td>

//                       {/* CURRENT DUE */}

//                       <td
//                         className={`
//                           p-3
//                           font-semibold
//                           ${
//                             Number(item.currentDue) > 0
//                               ? "text-red-600"
//                               : Number(item.currentDue) < 0
//                                 ? "text-green-600"
//                                 : "text-gray-700"
//                           }
//                         `}
//                       >
//                         ₹{formatAmount(item.currentDue)}
//                       </td>

//                       {/* TOTAL RECEIVED */}

//                       <td className="p-3 text-green-600">

//                         <div className="
//                           group
//                           relative
//                           inline-block
//                         ">

//                           <span className="
//                             cursor-pointer
//                             font-semibold
//                           ">
//                             ₹
//                             {formatAmount(
//                               item.totalReceived
//                             )}
//                           </span>

//                           {item.totalReceivedHistory
//                             ?.length > 0 && (

//                             <div className="
//                               absolute
//                               right-0
//                               top-full
//                               z-[100]
//                               mt-2
//                               hidden
//                               w-max
//                               group-hover:block
//                             ">

//                               <div className="
//                                 rounded-lg
//                                 border
//                                 border-gray-200
//                                 bg-white
//                                 px-4
//                                 py-3
//                                 shadow-lg
//                               ">

//                                 <div className="
//                                   mb-1
//                                   text-xs
//                                   text-gray-500
//                                 ">
//                                   Payment Breakdown
//                                 </div>

//                                 <div className="
//                                   whitespace-nowrap
//                                   text-sm
//                                   font-semibold
//                                   text-green-600
//                                 ">
//                                   {item.totalReceivedHistory
//                                     .map((payment) =>
//                                       Number(
//                                         payment.amount || 0
//                                       ).toLocaleString(
//                                         "en-IN"
//                                       )
//                                     )
//                                     .join(" + ")}
//                                 </div>

//                               </div>

//                             </div>
//                           )}

//                         </div>

//                       </td>

//                       {/* TOTAL RECEIVABLE */}

//                       <td className="p-3 font-semibold">
//                         ₹{formatAmount(item.totalReceivable)}
//                       </td>

//                       {/* RENT */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.rentAmt)}
//                       </td>

//                       {/* DAYS */}

//                       <td className="p-3">
//                         {item.daysCount || 0}
//                       </td>

//                       {/* EB */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.ebAmt)}
//                       </td>

//                       {/* ADJ EB */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.adjEB)}
//                       </td>

//                       {/* PREVIOUS DUE */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.previousDue)}
//                       </td>

//                       {/* PARKING */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.parkingCharges)}
//                       </td>

//                       {/* DEPOSIT */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.depositAmount)}
//                       </td>

//                       {/* PROCESSING */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.processingFees)}
//                       </td>

//                       {/* ADJUSTED AMOUNT */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.adjAmt)}
//                       </td>

//                       {/* FLAT EB */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.flatEB)}
//                       </td>

//                       {/* MONTHLY RENT */}

//                       <td className="p-3">
//                         ₹{formatAmount(item.monthlyRent)}
//                       </td>

//                       {/* START DATE */}

//                       <td className="p-3">
//                         {item.startDate
//                           ? formatDate(item.startDate)
//                           : "-"}
//                       </td>

//                       {/* END DATE */}

//                       <td className="p-3">
//                         {item.endDate
//                           ? formatDate(item.endDate)
//                           : "-"}
//                       </td>

//                       {/* PAYMENT COMMENTS */}

//                       <td className="p-3">

//                         <div className="
//                           flex
//                           items-center
//                           gap-2
//                         ">

//                           <div className="
//                             group
//                             relative
//                             min-w-0
//                             flex-1
//                           ">

//                             {item?.paymentComments
//                               ?.length > 0 ? (
//                               <>

//                                 {/* LATEST COMMENT */}

//                                 <div className="
//                                   cursor-pointer
//                                   text-sm
//                                   text-gray-700
//                                 ">

//                                   {(() => {
//                                     const latestComment =
//                                       item.paymentComments[
//                                         item.paymentComments
//                                           .length - 1
//                                       ];

//                                     const date =
//                                       latestComment?.date
//                                         ? new Date(
//                                             latestComment.date
//                                           )
//                                         : null;

//                                     const formattedDate =
//                                       date &&
//                                       !isNaN(
//                                         date.getTime()
//                                       )
//                                         ? date.toLocaleDateString(
//                                             "en-GB",
//                                             {
//                                               day: "2-digit",
//                                               month: "short",
//                                               year: "numeric",
//                                             }
//                                           )
//                                         : "";

//                                     const formattedTime =
//                                       date &&
//                                       !isNaN(
//                                         date.getTime()
//                                       )
//                                         ? date.toLocaleTimeString(
//                                             "en-US",
//                                             {
//                                               hour: "2-digit",
//                                               minute: "2-digit",
//                                               hour12: true,
//                                             }
//                                           )
//                                         : "";

//                                     const text =
//                                       latestComment?.comment ||
//                                       "";

//                                     const words =
//                                       text
//                                         .trim()
//                                         .split(/\s+/);

//                                     return (
//                                       <>
//                                         <span className="
//                                           font-semibold
//                                           text-gray-700
//                                         ">
//                                           [
//                                           {formattedDate}{" "}
//                                           {formattedTime}
//                                           ]
//                                         </span>{" "}

//                                         {words
//                                           .slice(0, 2)
//                                           .join(" ")}

//                                         {words.length > 2
//                                           ? "..."
//                                           : ""}
//                                       </>
//                                     );
//                                   })()}

//                                 </div>

//                                 {/* PAYMENT COMMENT HISTORY */}

//                                 <div className="
//                                   absolute
//                                   right-full
//                                   top-0
//                                   z-[9999]
//                                   hidden
//                                   max-h-[300px]
//                                   w-[420px]
//                                   overflow-y-auto
//                                   rounded-lg
//                                   border
//                                   border-gray-200
//                                   bg-white
//                                   p-3
//                                   text-left
//                                   shadow-xl
//                                   group-hover:block
//                                 ">

//                                   <div className="
//                                     space-y-3
//                                     text-left
//                                   ">

//                                     {[
//                                       ...item.paymentComments,
//                                     ]
//                                       .reverse()
//                                       .map(
//                                         (
//                                           comment,
//                                           index
//                                         ) => {

//                                           const date =
//                                             comment?.date
//                                               ? new Date(
//                                                   comment.date
//                                                 )
//                                               : null;

//                                           const formattedDate =
//                                             date &&
//                                             !isNaN(
//                                               date.getTime()
//                                             )
//                                               ? date.toLocaleDateString(
//                                                   "en-GB",
//                                                   {
//                                                     day: "2-digit",
//                                                     month: "short",
//                                                     year: "numeric",
//                                                   }
//                                                 )
//                                               : "";

//                                           const formattedTime =
//                                             date &&
//                                             !isNaN(
//                                               date.getTime()
//                                             )
//                                               ? date.toLocaleTimeString(
//                                                   "en-US",
//                                                   {
//                                                     hour: "2-digit",
//                                                     minute: "2-digit",
//                                                     hour12: true,
//                                                   }
//                                                 )
//                                               : "";

//                                           return (
//                                             <div
//                                               key={
//                                                 comment?._id ||
//                                                 index
//                                               }
//                                               className="
//                                                 w-full
//                                                 break-words
//                                                 text-left
//                                                 text-sm
//                                                 leading-relaxed
//                                                 text-gray-700
//                                                 whitespace-normal
//                                               "
//                                             >
//                                               <span className="
//                                                 font-semibold
//                                                 text-gray-800
//                                               ">
//                                                 [
//                                                 {
//                                                   formattedDate
//                                                 }{" "}
//                                                 {
//                                                   formattedTime
//                                                 }
//                                                 ]
//                                               </span>{" "}

//                                               {
//                                                 comment?.comment
//                                               }
//                                             </div>
//                                           );
//                                         }
//                                       )}

//                                   </div>

//                                 </div>

//                               </>
//                             ) : (
//                               <span className="
//                                 text-sm
//                                 text-gray-400
//                               ">
//                                 No comment
//                               </span>
//                             )}

//                           </div>

//                         </div>

//                       </td>

//                       {/* REMARKS */}

//                       <td className="p-3">
//                         {item.remarks || "-"}
//                       </td>

//                     </tr>

//                   ))
//                 ) : (

//                   <tr>

//                     <td
//                       colSpan={23}
//                       className="h-64"
//                     >

//                       <div className="
//                         flex
//                         h-full
//                         items-center
//                         justify-center
//                       ">

//                         <NoDataFound
//                           title="No Rent History Found"
//                           description="No rent history available for this client."
//                         />

//                       </div>

//                     </td>

//                   </tr>

//                 )}

//               </tbody>

//             </table>

//           </div>

//           {/* ======================================================
//               PAGINATION
//           ====================================================== */}

//           <div className="
//             flex
//             items-center
//             justify-between
//             border-t
//             p-3
//           ">

//             <span className="
//               text-sm
//               text-gray-500
//             ">

//               {filteredData.length > 0
//                 ? `Showing ${
//                     (currentPage - 1) *
//                       rowsPerPage +
//                     1
//                   } - ${Math.min(
//                     currentPage * rowsPerPage,
//                     filteredData.length
//                   )} of ${filteredData.length}`
//                 : "Showing 0 of 0"}

//             </span>

//             <Pagination
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />

//           </div>

//         </div>
//       </div>
//     </>
//   );
// };

// export default RentHistory;

