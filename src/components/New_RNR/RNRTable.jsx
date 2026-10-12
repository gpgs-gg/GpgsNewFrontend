import { useState, useMemo, useEffect, useRef } from "react";
import { Pencil, Filter, MessageSquarePlus, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import NoDataFound from "../common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import { useClients } from "./services";
import { useCreateRentNotReceivedComment } from "../RNR/services/index";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";

import { useAuthorization } from "../../context/AuthorizationContext";
import TableSkeleton from "../common/TableSkelton";
import { useAuth } from "../../context/authContext";
import RnrFilter from "./RnrFilter";
import { FaWhatsapp } from "react-icons/fa";
const RNRTable = () => {
  const { canEdit, canDelete, canSingleView } = useAuthorization();
  const { user } = useAuth();
  const canEditClient = canEdit("clients");
  const canDeleteClient = canDelete("clients");
  const canViewClient = canSingleView("clients");
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
        user: user?.name || null,
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
  //console.log("caneditclient", canEditClient, canDeleteClient, canViewClient);
  const showActions = canViewClient || canEditClient || canDeleteClient;
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("clients_page");

    return savedPage ? Number(savedPage) : 1;
  });
  const [fnfClosedFilter, setFnfClosedFilter] = useState(() => {
    return localStorage.getItem("clients_fnf_closed") === "true";
  });

  const [fnfCancelledFilter, setFnfCancelledFilter] = useState(() => {
    return localStorage.getItem("clients_fnf_cancelled") === "true";
  });
  useEffect(() => {
    localStorage.setItem("clients_page", String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("clients_fnf_closed", String(fnfClosedFilter));
  }, [fnfClosedFilter]);

  useEffect(() => {
    localStorage.setItem("clients_fnf_cancelled", String(fnfCancelledFilter));
  }, [fnfCancelledFilter]);
  const [filterOpen, setFilterOpen] = useState(false);

  const DEFAULT_CLIENT_FILTERS = {
    propertyId: "",
    propertyCode: "",
    propertyLocation: "",
    roomNo: "",
    bedNo: "",
    stayType: "",
    loginEnabled: "",
    clientStatus: "",
    clientDojFrom: "",
    clientDojTo: "",
  };
  const {
    filters,
    setFilters,
    removeFilter: removePersistedFilter,
    resetFilters,
  } = usePersistedFilters("clients_filters", DEFAULT_CLIENT_FILTERS);
  const debouncedSearch = useDebounce(search, 500);
  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.propertyId) {
      labels.push({
        key: "propertyId",
        title: "Property",
        value: filters.propertyCode || filters.propertyId,
      });
    }

    if (filters.clientDojFrom || filters.clientDojTo) {
      labels.push({
        key: "clientDoj",
        title: "DOJ",
        value: `${filters.clientDojFrom || "Any"} - ${filters.clientDojTo || "Any"}`,
      });
    }
    if (filters.propertyLocation) {
      labels.push({
        key: "propertyLocation",
        title: "Location",
        value: filters.propertyLocation,
      });
    }

    if (filters.roomNo) {
      labels.push({
        key: "roomNo",
        title: "Room",
        value: filters.roomNo,
      });
    }

    if (filters.bedNo) {
      labels.push({
        key: "bedNo",
        title: "Bed",
        value: filters.bedNo,
      });
    }

    if (filters.stayType) {
      labels.push({
        key: "stayType",
        title: "Stay Type",
        value: filters.stayType,
      });
    }

    if (filters.loginEnabled !== "") {
      labels.push({
        key: "loginEnabled",
        title: "Login",
        value: filters.loginEnabled ? "Enabled" : "Disabled",
      });
    }

    if (filters.clientStatus) {
      labels.push({
        key: "clientStatus",
        title: "Status",
        value: filters.clientStatus,
      });
    }

    return labels;
  }, [filters]);
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(
      (value) => value !== "" && value !== null && value !== undefined,
    );
  }, [filters]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [editingVacation, setEditingVacation] = useState(null);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const rowsPerPage = 20;
  const apiFilters = useMemo(() => {
    const { propertyCode, ...rest } = filters;

    return {
      ...rest,
      ...(fnfClosedFilter && {
        fnfStatus: "F&F Closed",
      }),
      ...(fnfCancelledFilter && {
        fnfStatus: "Cancelled",
      }),
    };
  }, [filters, fnfClosedFilter, fnfCancelledFilter]);

  const cleanSearch = debouncedSearch
    .replace(/₹/g, "")
    .replace(/,/g, "")
    .trim();

  const { data: clients, isPending: isClients } = useClients({
    page: currentPage,
    limit: rowsPerPage,
    search: cleanSearch,
    filters: apiFilters,
  });

  // Safely get bookings data
  const bookings = clients?.data || [];

  const totalPages = clients?.totalPages || 1;

  const totalRecords = clients?.totalRecords || 0;

  const paginatedData = bookings;
  console.log(paginatedData);

  // Reset to page 1 when filters or search changes
  const isInitialFilterLoad = useRef(true);

  useEffect(() => {
    if (isInitialFilterLoad.current) {
      isInitialFilterLoad.current = false;
      return;
    }

    setCurrentPage(1);
  }, [debouncedSearch, filters]);
  const handleReset = () => {
    resetFilters();

    setSearch("");
    setFnfClosedFilter(false);
    setFnfCancelledFilter(false);
    setCurrentPage(1);

    localStorage.setItem("clients_page", "1");
    localStorage.removeItem("clients_fnf_closed");
    localStorage.removeItem("clients_fnf_cancelled");

    setResetTrigger((prev) => prev + 1);
  };
  const removeFilter = (key) => {
    if (key === "propertyId") {
      setFilters((prev) => ({
        ...prev,
        propertyId: "",
        propertyCode: "",
      }));
    } else if (key === "clientDoj") {
      setFilters((prev) => ({
        ...prev,
        clientDojFrom: "",
        clientDojTo: "",
      }));
    } else {
      removePersistedFilter(key);
    }

    setCurrentPage(1);
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const statusFullForm = {
    RFH: "Ready for Handover",
    "F&F C": "F&F Closed",
    BDR: "Bank Details Revised",
    "F&F DS": "F&F Details Sent",
    HD: "Handover Done",
  };

  // const numberToWords = (num) => {
  //   if (num === 0) return "Zero Rupees";

  //   const ones = [
  //     "",
  //     "One",
  //     "Two",
  //     "Three",
  //     "Four",
  //     "Five",
  //     "Six",
  //     "Seven",
  //     "Eight",
  //     "Nine",
  //     "Ten",
  //     "Eleven",
  //     "Twelve",
  //     "Thirteen",
  //     "Fourteen",
  //     "Fifteen",
  //     "Sixteen",
  //     "Seventeen",
  //     "Eighteen",
  //     "Nineteen",
  //   ];

  //   const tens = [
  //     "",
  //     "",
  //     "Twenty",
  //     "Thirty",
  //     "Forty",
  //     "Fifty",
  //     "Sixty",
  //     "Seventy",
  //     "Eighty",
  //     "Ninety",
  //   ];

  //   const convert = (n) => {
  //     if (n < 20) return ones[n];

  //     if (n < 100) {
  //       return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  //     }

  //     if (n < 1000) {
  //       return (
  //         ones[Math.floor(n / 100)] +
  //         " Hundred" +
  //         (n % 100 ? " " + convert(n % 100) : "")
  //       );
  //     }

  //     if (n < 100000) {
  //       return (
  //         convert(Math.floor(n / 1000)) +
  //         " Thousand" +
  //         (n % 1000 ? " " + convert(n % 1000) : "")
  //       );
  //     }

  //     if (n < 10000000) {
  //       return (
  //         convert(Math.floor(n / 100000)) +
  //         " Lakh" +
  //         (n % 100000 ? " " + convert(n % 100000) : "")
  //       );
  //     }

  //     return (
  //       convert(Math.floor(n / 10000000)) +
  //       " Crore" +
  //       (n % 10000000 ? " " + convert(n % 10000000) : "")
  //     );
  //   };

  //   return convert(num) + " Rupees";
  // };

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
            <div className="px-4 py-2 text-lg font-bold">
              Total Due Amt :{" "}
              <span className="text-red-500">
                ₹{" "}
                {Number(clients?.totalCurrentDue || 0).toLocaleString("en-IN")}
              </span>
              {/* <div className="text-sm font-medium text-gray-400 mt-1">
                {numberToWords(Number(clients?.totalCurrentDue || 0))}
              </div> */}
            </div>
            <Link to="/tickets/create">
              {/* <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add Ticket
              </button> */}
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search booking..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {filter.title}
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {filter.value}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2"></div>
            <div className="flex gap-2">
              {(hasActiveFilters || fnfClosedFilter || fnfCancelledFilter) && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2 hover:bg-gray-50"
                >
                  Reset
                </button>
              )}

              <button
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="overflow-auto h-full">
              <table className="w-full whitespace-nowrap border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-20">
                  <tr>
                    {/* <th className="p-3 text-center whitespace-nowrap">
                      Sr No.
                    </th> */}

                    <th className="p-3 text-start whitespace-nowrap">
                      Property Code
                    </th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Room No
                    </th>

                    <th className="p-3 text-start whitespace-nowrap">Bed No</th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Client Name
                    </th>
                    <th className="p-3 text-start whitespace-nowrap">
                      WhatsApp No
                    </th>

                    <th className="p-3 text-start whitespace-nowrap">
                      Calling No
                    </th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Stay Type
                    </th>
                    <th className="p-3 text-start whitespace-nowrap">Status</th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Month/Year
                    </th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Rent Date
                    </th>

                    <th className="p-3 text-start whitespace-nowrap">DOJ</th>

                    <th className="p-3 text-start whitespace-nowrap">NSD</th>
                    <th className="p-3 text-start whitespace-nowrap">NLD</th>
                    <th className="p-3 text-start whitespace-nowrap">CVD</th>
                    <th className="p-3 text-start whitespace-nowrap">
                      Current Due
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Comment
                    </th>

                    {/* <th className="p-3 text-start whitespace-nowrap">
                      Total Amount
                    </th>

                    <th className="p-3 text-start whitespace-nowrap">
                      Advance Amount
                    </th>

                    <th className="p-3 text-start whitespace-nowrap">
                      Balance Amount
                    </th> */}
                  </tr>
                </thead>
                {isClients ? (
                  <TableSkeleton rows={20} columns={20} />
                ) : (
                  <tbody>
                    {paginatedData?.length > 0 ? (
                      paginatedData.map((item, index) => {
                        const getClientStatus = (item) => {
                          const today = new Date();

                          if (item.isBookingCancelled) {
                            return {
                              text: "Cancelled",
                              className:
                                "bg-red-50 text-red-700 border border-red-200",
                            };
                          }

                          // Vacated highest priority
                          if (item.clientVacatingDate) {
                            const vacatedDate = new Date(
                              item.clientVacatingDate,
                            );

                            if (vacatedDate <= today) {
                              return {
                                text: "RFH",
                                className:
                                  "bg-orange-100 text-orange-700 border border-orange-200",
                              };
                            }
                          }

                          // Permanent Notice
                          if (item.noticeStartDate) {
                            return {
                              text: "Notice",
                              className:
                                "bg-amber-50 text-amber-700 border border-amber-200",
                            };
                          }

                          return {
                            text: "Active",
                            className:
                              "bg-emerald-50 text-emerald-700 border border-emerald-200",
                          };
                        };

                        return (
                          <tr
                            key={item._id}
                            className="border-t text-center border-gray-300 hover:bg-gray-50"
                          >
                            {/* Sr No */}
                            {/* <td className="p-3 font-medium">
                            {(currentPage - 1) * rowsPerPage +
                              index +
                              1}
                          </td> */}

                            {/* Status */}

                            {/* Property */}
                            <td className="p-3">
                              {item.propertyId?.propertyCode || "-"}
                            </td>

                            {/* Room No */}
                            <td className="p-3">{item.bedId?.roomNo || "-"}</td>

                            {/* Bed No */}
                            <td className="p-3">{item.bedId?.bedNo || "-"}</td>

                            {/* Client Name */}
                            <td className="p-3 font-bold text-start">
                              {item.fullName || "-"}
                            </td>
                            {/* Contact No */}
                          
<td className="p-3 whitespace-nowrap">
  {item?.callingNo ? (
    <a
      href={`tel:${String(item.callingNo).replace(/[^\d+]/g, "")}`}
      className="inline-flex items-center gap-2 "
      title={`Call ${item.callingNo}`}
    >
      <span>{item.callingNo}</span>
      <Phone size={16} className="text-blue-500"/>
    </a>
  ) : (
    "-"
  )}
</td>

<td className="p-3 whitespace-nowrap">
  {item?.whatsappNo ? (
    <a
      href={`https://wa.me/${String(item.whatsappNo).replace(/\D/g, "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 "
      title={`WhatsApp ${item.whatsappNo}`}
    >
      <span>{item.whatsappNo}</span>
      <FaWhatsapp size={16} className="text-green-500" />
    </a>
  ) : (
    "-"
  )}
</td>

                            {/* stay type */}
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-md font-semibold ${item.bookingType === "Daily"
                                    ? " text-indigo-700"
                                    : item.stayType === "P. Booked"
                                      ? " text-emerald-700"
                                      : item.stayType === "T. Booked"
                                        ? " text-amber-700"
                                        : " text-gray-700"
                                  }`}
                              >
                                {item.bookingType === "Daily"
                                  ? "Daily"
                                  : item.stayType || "-"}
                              </span>
                            </td>
                            {/* status */}
                            <td className="p-3 text-center">
                              {(() => {
                                const fnfStatus = item?.fnf?.status;

                                if (fnfStatus && fnfStatus.trim() !== "") {
                                  return (
                                    <span
                                      title={
                                        statusFullForm[fnfStatus] || fnfStatus
                                      }
                                      className="px-2.5 py-1 text-sm rounded-full font-semibold bg-gray-100 text-gray-700 cursor-help"
                                    >
                                      {fnfStatus}
                                    </span>
                                  );
                                }

                                const status = getClientStatus(item);

                                return (
                                  <span
                                    title={
                                      statusFullForm[status.text] || status.text
                                    }
                                    className={`px-2.5 py-1 rounded-full text-sm font-semibold cursor-help ${status.className}`}
                                  >
                                    {status.text}
                                  </span>
                                );
                              })()}
                            </td>

                            {/*  month/year */}
                            {/* month/year */}
                            <td className="p-3 text-center">
                              {new Date(
                                item.latestRentHistory?.year,
                                item.latestRentHistory?.month - 1,
                              ).toLocaleString("en-US", { month: "long" })}{" "}
                              {item.latestRentHistory?.year}
                            </td>
                            {/*  Rent Date */}
                            <td className="p-3 text-center">Rent Date</td>
                            {/* Rent Start Date */}
                            <td className="p-3">
                              {item.clientDoj
                                ? formatDate(item.clientDoj)
                                : "-"}
                            </td>

                            <td className="p-3">
                              {formatDate(item.noticeStartDate) || "-"}
                            </td>
                            <td className="p-3">
                              {formatDate(item.noticeLastDate) || "-"}
                            </td>
                            <td className="p-3">
                              {formatDate(item.clientVacatingDate) || "-"}
                            </td>

                            <td
                              className={`p-3 ${Number(
                                item?.latestRentHistory?.currentDue || 0,
                              ) < 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                }`}
                            >
                              ₹
                              {Number(
                                item?.latestRentHistory?.currentDue || 0,
                              ).toLocaleString("en-IN")}
                            </td>

                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {/* Comments */}
                                <div className="relative group flex-1 min-w-0">
                                  {(() => {
                                    // API response mein rentNotReceivedComment array hai
                                    const comments =
                                      item?.rentNotReceivedComment?.[0]
                                        ?.comments || [];

                                    if (!comments.length) {
                                      return (
                                        <span className="text-gray-400 text-sm">
                                          No comment
                                        </span>
                                      );
                                    }

                                    const latestComment =
                                      comments[comments.length - 1];

                                    const formatDateTime = (value) => {
                                      if (!value) return "";

                                      const date = new Date(value);

                                      if (isNaN(date.getTime())) return "";

                                      const formattedDate =
                                        date.toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          timeZone: "Asia/Kolkata",
                                        });

                                      const formattedTime =
                                        date.toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                          timeZone: "Asia/Kolkata",
                                        });

                                      return `${formattedDate} ${formattedTime}`;
                                    };

                                    const words = (latestComment?.comment || "")
                                      .trim()
                                      .split(/\s+/)
                                      .filter(Boolean);

                                    return (
                                      <>
                                        {/* Latest comment */}
                                        <div className="text-sm text-gray-700 cursor-pointer truncate">
                                          <span className="font-semibold text-gray-700">
                                            {formatDateTime(
                                              latestComment?.date,
                                            )}
                                          </span>{" "}
                                          {words.slice(0, 2).join(" ")}
                                          {words.length > 2 ? "..." : ""}
                                        </div>

                                        {/* Hover Worklog */}
                                        <div className="hidden group-hover:block absolute right-full top-0 mr-2 w-[520px] max-w-[80vw] max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] p-3">
                                          <div className="font-semibold text-gray-800 text-sm mb-3 border-b border-gray-300 pb-2">
                                            RNR Comments
                                          </div>

                                          <div className="">
                                            {[...comments]
                                              .reverse()
                                              .map((comment, index) => (
                                                <div
                                                  key={comment?._id || index}
                                                  className="text-sm text-start text-gray-700 leading-relaxed whitespace-normal break-words"
                                                >
                                                  <span className="font-semibold text-gray-800">
                                                    [
                                                    {formatDateTime(
                                                      comment?.date,
                                                    )}
                                                    {comment?.addedBy
                                                      ? ` - ${comment.addedBy}`
                                                      : ""}
                                                    ]
                                                  </span>{" "}
                                                  {comment?.comment || ""}
                                                </div>
                                              ))}
                                          </div>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>

                                {/* Add Comment */}
                                <button
                                  type="button"
                                  title="Add Comment"
                                  onClick={() => {
                                    setCommentClient(item);
                                    setCommentText("");
                                  }}
                                  className="shrink-0 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
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
                        <td colSpan={15}>
                          <NoDataFound
                            title="No Clients Found"
                            description="No client records available"
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {totalRecords > 0 && (
            <div className="border-t p-3 flex justify-between items-center bg-white">
              <span className="text-sm text-gray-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} - {"  "}
                {Math.min(currentPage * rowsPerPage, totalRecords)} {"  "}
                of {totalRecords}
              </span>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
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

          setFilters((prev) => ({
            ...prev,
            propertyId: data.propertyId || "",
            propertyCode: data.propertyCode || "",
          }));

          setCurrentPage(1);
        }}
        handleReset={handleReset}
      />
    </>
  );
};

export default RNRTable;
