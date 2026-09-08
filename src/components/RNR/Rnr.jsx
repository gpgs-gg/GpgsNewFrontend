import React, { useMemo, useState, useEffect } from "react";
import { Filter, MessageSquarePlus } from "lucide-react";
import { Link } from "react-router-dom";
import NoDataFound from "../Common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import {
  useCreateRentNotReceivedComment,
  useFnFnadNoticeData,
} from "./services";
import Pagination from "../Common/Pagination";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import usePersistedFilters from "../hooks/usePersistedFilters";
import RnrFilter from "./RnrFilter";

function Rnr() {
  // ======================================================
  // DEFAULT FILTERS
  // ======================================================

  const DEFAULT_RNR_FILTERS = {
    propertyId: "",
    propertyCode: "",
  };

  // ======================================================
  // PERSISTED FILTERS
  // ======================================================

  const { filters, setFilters, removeFilter, resetFilters } =
    usePersistedFilters("rnr_filters", DEFAULT_RNR_FILTERS);

  // ======================================================
  // STATE
  // ======================================================
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("rnr_page");

    return savedPage ? Number(savedPage) : 1;
  });

  const [filterOpen, setFilterOpen] = useState(false);

  const [resetTrigger, setResetTrigger] = useState(0);

  const debouncedSearch = useDebounce(search);
  const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
  //  const { mutate: deleteUserData, isPending } = useDeleteUserData();
  // ======================================================
  // SAVE PAGE
  // ======================================================

  useEffect(() => {
    localStorage.setItem("rnr_page", String(currentPage));
  }, [currentPage]);
  const {
    data: apiResponse,
    isPending,
    isError,
    error,
  } = useFnFnadNoticeData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    propertyId: filters.propertyId,
  });

  //  API response ko array me normalize kar rahe hain
  const data = Array.isArray(apiResponse)
    ? apiResponse
    : apiResponse?.data || [];

  const [commentClient, setCommentClient] = useState(null);
  const [commentText, setCommentText] = useState("");

  const { mutate: createRentNotReceivedComment, isPending: isAddingComment } =
    useCreateRentNotReceivedComment();

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error("Please enter comment");
      return;
    }

    createRentNotReceivedComment(
      {
        clientId: commentClient?._id,
        comment: commentText.trim(),
      },
      {
        onSuccess: (response) => {
          toast.dismiss();
          toast.success(response?.message || "Comment added successfully");

          setCommentText("");
          setCommentClient(null);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to add comment",
          );
        },
      },
    );
  };

  // ======================================================
  // NORMALIZE RESPONSE
  // ======================================================
  const apiData = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalCount || 0;
  // ======================================================
  // PROPERTY LIST
  // ======================================================

  const properties = useMemo(() => {
    const unique = new Map();

    apiData.forEach((item) => {
      if (item?.propertyCode) {
        unique.set(item.propertyCode, {
          _id: item.propertyCode,
          propertyCode: item.propertyCode,
        });
      }
    });

    return Array.from(unique.values());
  }, [apiData]);

  // const { data: apiResponse, isLoading } = useUsersData({
  //     page: currentPage,
  //     limit: rowsPerPage,
  //     search: debouncedSearch,
  //     filters,
  // });

  const paginatedData = apiData;
  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.propertyCode) {
      labels.push({
        key: "propertyCode",
        label: `Property Code : ${filters.propertyCode}`,
      });
    }

    return labels;
  }, [filters]);

  const numberToWords = (num) => {
    if (num === 0) return "Zero Rupees";

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convert = (n) => {
      if (n < 20) return ones[n];

      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }

      if (n < 1000) {
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      }

      if (n < 100000) {
        return (
          convert(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      }

      if (n < 10000000) {
        return (
          convert(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convert(n % 100000) : "")
        );
      }

      return (
        convert(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convert(n % 10000000) : "")
      );
    };

    return convert(num) + " Rupees";
  };

  const handleReset = () => {
    resetFilters();

    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Rent Not Received</h1>
              <p className="text-sm text-gray-500">
                Manage all rent Not received
              </p>
            </div>
            <div className="px-4 py-2 text-lg  font-bold">
              Total Due Amt :{" "}
              <span className="text-green-500">
                ₹{" "}
                {Number(apiResponse?.totalCurrentDue || 0).toLocaleString(
                  "en-IN",
                )}
              </span>
              <div className="text-sm font-medium text-gray-400 mt-1">
                {numberToWords(Number(apiResponse?.totalCurrentDue || 0))}
              </div>
            </div>
            <Link to="/tickets/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add Ticket
              </button>
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* SEARCH */}

            <div className="relative w-80">
              <input
                type="text"
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search client, property code..."
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

            {/* FILTER CHIPS */}

            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100"
                >
                  <span className="mr-2 font-medium text-slate-700">
                    {filter.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setFilters({
                        propertyId: "",
                        propertyCode: "",
                      });

                      setCurrentPage(1);
                    }}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* BUTTONS */}

            <div className="flex gap-2">
              {filterLabels.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* TABLE CONTENT */}

          <div className="overflow-auto h-full">
            <table className="w-full">
              <thead className="bg-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-3 text-left">Property Code</th>
                  <th className="p-3 text-left">Room No</th>
                  <th className="p-3 text-left">Bed No</th>
                  <th className="p-3 text-left">Client Name</th>
                  <th className="p-3 text-left">WhatsApp No</th>
                  <th className="p-3 text-left">Calling No</th>
                  {/* <th className="p-3 text-left">Email</th> */}
                  <th className="p-3 text-left">Stay Type</th>
                  <th className="p-3 text-left">Month/Year</th>
                  <th className="p-3 text-left">Rent Date</th>
                  <th className="p-3 text-left">DOJ</th>
                  <th className="p-3 text-left">NSD</th>
                  <th className="p-3 text-left">NLD</th>
                  <th className="p-3 text-left">CVD</th>
                  <th className="p-3 text-left">Current Due</th>
                  <th className="p-3 text-left">Comment</th>
                  {/* <th className="p-3 text-left">Monthly Rent</th>
                                    <th className="p-3 text-left">Rent Amount</th>
                                    <th className="p-3 text-left">Parking</th>
                                    <th className="p-3 text-left">Total Receivable</th>
                                    <th className="p-3 text-left">Total Received</th> */}
                </tr>
              </thead>

              <tbody>
                {data.length > 0 ? (
                  data.map((item) => {
                    const rentHistory = item.latestRentHistory || {};

                    return (
                      <tr
                        key={item._id}
                        className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                      >
                        <td className="p-3 font-semibold">
                          {item.propertyCode || "-"}
                        </td>

                        <td className="p-3">{item.roomNo || "-"}</td>

                        <td className="p-3">{item.bedNo || "-"}</td>

                        <td className="p-3 font-semibold">
                          {item.fullName || "-"}
                        </td>

                        <td className="p-3">{item.whatsappNo || "-"}</td>

                        <td className="p-3">{item.callingNo || "-"}</td>

                        {/* <td className="p-3">
                                             {item.emailId || "-"}
                                         </td> */}
                        <td className="p-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              item.stayType === "T. Booked"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.stayType === "P. Booked"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.stayType || "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          {rentHistory.monthName || 0} {rentHistory.year || 0}
                        </td>
                        <td className="p-3">Add karna h</td>
                        <td className="p-3">
                          {item.clientDoj ? formatDate(item.clientDoj) : "-"}
                        </td>
                        <td className="p-3">
                          {item.noticeStartDate
                            ? formatDate(item.noticeStartDate)
                            : "-"}
                        </td>

                        <td className="p-3">
                          {item.noticeLastDate
                            ? formatDate(item.noticeLastDate)
                            : "-"}
                        </td>

                        <td className="p-3">
                          {item.clientVacatingDate
                            ? formatDate(item.clientVacatingDate)
                            : "-"}
                        </td>

                        {/* <td className="p-3">
                                                    ₹{rentHistory.monthlyRent || 0}
                                                </td>

                                                <td className="p-3">
                                                    ₹{rentHistory.rentAmt || 0}
                                                </td>

                                                <td className="p-3">
                                                    ₹{rentHistory.parkingCharges || 0}
                                                </td>

                                                <td className="p-3">
                                                    ₹{rentHistory.totalReceivable || 0}
                                                </td>

                                                <td className="p-3">
                                                    ₹{rentHistory.totalReceived || 0}
                                                </td> */}

                        <td className="p-3 text-red-500 font-bold">
                          ₹{rentHistory.currentDue || 0}
                        </td>
                        <td className="p-3 ">
                          <div className="flex items-center gap-2">
                            {/* Comments */}
                            <div className="relative group flex-1 min-w-0">
                              {item?.rentNotReceivedComment?.comments?.length >
                              0 ? (
                                <>
                                  {/* Latest comment */}
                                  <div className="text-sm text-gray-700 cursor-pointer">
                                    {(() => {
                                      const latestComment =
                                        item.rentNotReceivedComment?.comments?.[
                                          item.rentNotReceivedComment.comments
                                            .length - 1
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
                                            {formattedDate} {formattedTime}
                                          </span>{" "}
                                          {words.slice(0, 2).join(" ")}
                                          {words.length > 2 ? "..." : ""}
                                        </>
                                      );
                                    })()}
                                  </div>

                                  {/* Hover Worklog */}
                                  <div className="hidden group-hover:block absolute right-full top-full w-[520px] max-h-[300px]  overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-3">
                                    <div className="font-semibold text-gray-800 text-sm mb-3 border-b border-gray-400 pb-2">
                                      Worklog
                                    </div>

                                    <div className="space-y-3">
                                      {[...item.rentNotReceivedComment.comments]
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
                                              className="text-sm text-gray-700 leading-relaxed whitespace-normal break-words"
                                            >
                                              <span className="font-semibold text-gray-800">
                                                [{formattedDate} {formattedTime}
                                                {comment?.user?.name
                                                  ? ` - ${comment.user.name}`
                                                  : ""}
                                                ]
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

                            {/* Add Comment */}
                            <button
                              type="button"
                              title="Add Comment"
                              onClick={() => {
                                setCommentClient(item);
                                setCommentText("");
                              }}
                              className="shrink-0 p-2 text-gray-600 hover:bg-blue-50 rounded-md transition"
                            >
                              <MessageSquarePlus size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={18} className="p-5 text-center text-gray-500">
                      No Notice Clients Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="border-t p-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing{" "}
              {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, totalRecords)} of{" "}
              {totalRecords}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
      {commentClient && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-white w-[500px] rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Rent Not Received Comment</h2>

                <p className="text-sm text-gray-500 mt-1">
                  {commentClient?.fullName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCommentClient(null);
                  setCommentText("");
                }}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* New comment */}
            <div className="p-5">
              <label className="block text-sm font-semibold mb-2">
                Add Comment
              </label>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter rent not received comment..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-gray-00"
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setCommentClient(null);
                  setCommentText("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isAddingComment || !commentText.trim()}
                onClick={handleAddComment}
                className="theme-btn"
              >
                {isAddingComment ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </div>
        </div>
      )}
      <RnrFilter
        isOpen={filterOpen}
        initialFilters={filters}
        resetTrigger={resetTrigger}
        onClose={() => setFilterOpen(false)}
        onApply={(data) => {
          console.log("RNR Apply Data:", data);

          setFilters({
            propertyId: data.propertyId || "",
            propertyCode: data.propertyCode || "",
          });

          setCurrentPage(1);
        }}
        handleReset={handleReset}
      />
    </>
  );
}

export default Rnr;