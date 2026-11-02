import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { Filter } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import FnfFilter from "./FnfFilter";
import { useFnFnadNoticeData } from "./services";
import Pagination from "../common/Pagination";
import { formatDate } from "../../utils/dateFormatter";
import FnfEditForm from "./FnfEditForm";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { useAuthorization } from "../../context/AuthorizationContext";
import TableSkeleton from "../common/TableSkelton";
import FnfMobileCard from "./FnfMobileCard";
function FullandFinalSettlement() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [fnfClosedFilter, setFnfClosedFilter] = useState(() => {
    return localStorage.getItem("fnf_fnf_closed") === "true";
  });

  const [fnfCancelledFilter, setFnfCancelledFilter] = useState(() => {
    return localStorage.getItem("fnf_fnf_cancelled") === "true";
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const DEFAULT_FNF_FILTERS = {
    propertyId: "",
    propertyCode: "",
    fnfStatus: "",
    stayType: "",
    hasCvd: false,
  };

  const {
    filters,
    setFilters,
    resetFilters,
    removeFilter: removePersistedFilter,
  } = usePersistedFilters("fnf_filters", DEFAULT_FNF_FILTERS);

  const [resetTrigger, setResetTrigger] = useState(0);
  const [showFnfForm, setShowFnfForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [rentHistories, setRentHistories] = useState([]);
  const debouncedSearch = useDebounce(search);
  const rowsPerPage = PAGINATION.DEFAULT_LIMIT || 10;
  const { canAdd, canEdit, canDelete, canSingleView } = useAuthorization();

  const canAddFnf = canAdd("full_final_settlement");
  const canEditFnf = canEdit("full_final_settlement");
  const canDeleteFnf = canDelete("full_final_settlement");
  const canViewFnf = canSingleView("full_final_settlement");

  const showActions = canEditFnf;
  //  const { mutate: deleteUserData, isPending } = useDeleteUserData();
  const apiFilters = useMemo(() => {
    return {
      ...filters,
      ...(fnfClosedFilter && {
        fnfStatus: "F&F Closed",
      }),
      ...(fnfCancelledFilter && {
        fnfStatus: "Cancelled",
      }),
    };
  }, [filters, fnfClosedFilter, fnfCancelledFilter]);

  const {
    data: apiResponse,
    isPending,
    isFetching,
    isError,
    error,
  } = useFnFnadNoticeData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters: apiFilters,
  });

  const data = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalCount || 0;

  const handleReset = () => {
    resetFilters();
    setSearch("");
    setFnfClosedFilter(false);
    setFnfCancelledFilter(false);
    setCurrentPage(1);

    localStorage.removeItem("fnf_fnf_closed");
    localStorage.removeItem("fnf_fnf_cancelled");
    setResetTrigger((prev) => prev + 1);
  };

  const handleRemoveFilter = (key) => {
    removePersistedFilter(key);
    setCurrentPage(1);
  };

  useEffect(() => {
    sessionStorage.setItem("fnfSearch", search);
  }, [search]);
  useEffect(() => {
    localStorage.setItem("fnf_fnf_closed", String(fnfClosedFilter));
  }, [fnfClosedFilter]);

  useEffect(() => {
    localStorage.setItem("fnf_fnf_cancelled", String(fnfCancelledFilter));
  }, [fnfCancelledFilter]);
  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.propertyId) {
      labels.push({
        key: "propertyId",
        title: "Property",
        value: filters.propertyCode || filters.propertyId,
      });
    }

    if (filters.fnfStatus) {
      labels.push({
        key: "fnfStatus",
        title: "FNF Status",
        value: filters.fnfStatus,
      });
    }

    if (filters.stayType) {
      labels.push({
        key: "stayType",
        title: "Stay Type",
        value: filters.stayType,
      });
    }

    if (filters.hasCvd) {
      labels.push({
        key: "hasCvd",
        title: "CVD",
        value: "Yes",
      });
    }

    return labels;
  }, [filters]);

  const statusFullForm = {
    RFH: "Ready for Handover",
    "F&F C": "F&F Closed",
    BDR: "Bank Details Revised",
    "F&F DS": "F&F Details Sent",
    HD: "Handover Done",
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Full & Final Settlement</h1>
              <p className="text-sm text-gray-500">
                Manage all client F & F settlement
              </p>
            </div>

            {/* <Link to="/tickets/create">
                            <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                + Add Ticket
                            </button>
                        </Link> */}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH */}
          <div className="border-b border-gray-200 px-3 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              {/* SEARCH */}
              <div className="relative w-full lg:w-80 lg:shrink-0">
                <input
                  className="border px-3 py-2 pr-10 rounded-lg w-full"
                  placeholder="Search ..."
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
              {filterLabels.length > 0 && (
                <div className="w-full min-w-0 lg:flex-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                    {filterLabels.map((filter) => (
                      <div
                        key={filter.key}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm"
                      >
                        <span className="font-semibold text-slate-500">
                          {filter.title}:
                        </span>

                        <span className="max-w-28 truncate font-medium text-slate-800">
                          {filter.value}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(filter.key)}
                          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                          aria-label={`Remove ${filter.title} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESET AND FILTER BUTTONS */}
              <div className="flex w-full flex-wrap items-center gap-2 lg:ml-auto lg:w-auto lg:shrink-0 lg:flex-nowrap">
                {(filterLabels.length > 0 ||
                  fnfClosedFilter ||
                  fnfCancelledFilter) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 lg:flex-none"
                  >
                    Reset
                  </button>
                )}

                {/* F&F CLOSED */}
                <button
                  type="button"
                  onClick={() => {
                    setFnfClosedFilter((prev) => {
                      const next = !prev;

                      if (next) {
                        setFnfCancelledFilter(false);
                      }

                      return next;
                    });

                    setCurrentPage(1);
                  }}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition lg:flex-none ${
                    fnfClosedFilter
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  F&F Closed
                </button>

                {/* FILTER */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:flex-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Filter size={16} />
                    Filters
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLE CONTENT */}

          <div className="flex-1 overflow-auto">
            {/* MOBILE CARD VIEW */}
            <div className="space-y-3 p-3 md:hidden">
              {isFetching ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />

                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <div className="h-14 rounded-lg bg-slate-100" />
                      <div className="h-14 rounded-lg bg-slate-100" />
                    </div>

                    <div className="mb-2 h-4 w-full rounded bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                  </div>
                ))
              ) : data.length > 0 ? (
                data.map((item) => (
                  <FnfMobileCard
                    key={item._id}
                    item={item}
                    canEditFnf={canEditFnf}
                    onEdit={(client) => {
                      setSelectedClient(client);
                      setShowFnfForm(true);
                    }}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
                  No Notice Clients Found
                </div>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <table className="hidden md:table min-w-max w-full">
              <thead className="sticky top-0 z-20 bg-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Property Code</th>
                  <th className="p-3 text-left">Room No</th>
                  <th className="p-3 text-left">Bed No</th>
                  <th className="p-3 text-left">Client Name</th>
                  <th className="p-3 text-left">WhatsApp No</th>
                  {/* <th className="p-3 text-left">Calling No</th> */}
                  {/* <th className="p-3 text-left">Email</th> */}
                  <th className="p-3 text-left">Stay Type</th>
                  <th className="p-3 text-left">NSD</th>
                  <th className="p-3 text-left">NLD</th>
                  <th className="p-3 text-left">CVD</th>
                  <th className="p-3 text-left">Total Deposit</th>
                  <th className="p-3 text-left">Current Due</th>
                  <th className="p-3 text-left">Bank Details</th>
                  <th className="p-3 text-left">F & F Amount</th>
                  {/* <th className="p-3 text-left">Remarks</th> */}
                  {/* <th className="p-3 text-left">Total Receivable</th>
                                    <th className="p-3 text-left">Total Received</th>
                                    <th className="p-3 text-left">Current Due</th>
                                    <th className="p-3 text-left">Payment Status</th> */}
                  {showActions && (
                    <th className="p-3 text-left sticky right-0 bg-gray-100">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              {isFetching ? (
                <TableSkeleton rows={20} columns={20} />
              ) : (
                <tbody>
                  {data.length > 0 ? (
                    data.map((item) => {
                      const rentHistory = item.latestRentHistory || {};
                      const fnfHistory = item.fnf || {};
                      const getClientStatus = (item) => {
                        const today = new Date();

                        if (item.isBookingCancelled) {
                          return {
                            text: "Cancelled",
                            className: "bg-red-100 text-red-600",
                          };
                        }

                        // Vacated highest priority
                        if (item.clientVacatingDate) {
                          const vacatedDate = new Date(item.clientVacatingDate);

                          if (vacatedDate <= today) {
                            return {
                              text: "RFH",
                              className:
                                "bg-slate-100 text-slate-700 border border-slate-300",
                            };
                          }
                        }

                        // Permanent Notice
                        if (item.noticeStartDate) {
                          return {
                            text: "Notice",
                            className: "bg-orange-100 text-orange-700",
                          };
                        }

                        return {
                          text: "Active",
                          className: "bg-green-100 text-green-600",
                        };
                      };
                      return (
                        <tr
                          key={item._id}
                          className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        >
                          <td className="p-3 text-center">
                            {(() => {
                              const fnfStatus = item?.fnf?.status;

                              if (fnfStatus && fnfStatus.trim() !== "") {
                                return (
                                  <span
                                    title={
                                      statusFullForm[fnfStatus] || fnfStatus
                                    }
                                    className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 cursor-help"
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
                                  className={`px-3 py-1 rounded-full text-sm font-semibold cursor-help ${status.className}`}
                                >
                                  {status.text}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="p-3 font-semibold">
                            {item.propertyCode || "-"}
                          </td>

                          <td className="p-3">{item.roomNo || "-"}</td>

                          <td className="p-3">{item.bedNo || "-"}</td>

                          <td className="p-3 font-semibold">
                            {item.fullName || "-"}
                          </td>

                          <td className="p-3">{item.whatsappNo || "-"}</td>

                          {/* <td className="p-3">
                                             {item.callingNo || "-"}
                                         </td> */}

                          {/* <td className="p-3">
                                             {item.emailId || "-"}
                                         </td> */}

                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-md font-semibold ${
                                item.bookingType === "Daily"
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

                          <td className="p-3">
                            ₹{fnfHistory.totalPaidDeposit || 0}
                          </td>

                          <td className="p-3">₹{fnfHistory.currentDue || 0}</td>

                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span>
                                {fnfHistory.bankDetailReceived || "-"}
                              </span>

                              {fnfHistory.bankDetailReceived && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      fnfHistory.bankDetailReceived,
                                    );
                                    toast.dismiss();
                                    toast.success("Copied!");
                                  }}
                                  className="text-gray-500 hover:text-gray-800"
                                  title="Copy"
                                >
                                  <Copy size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td
                            className={`p-3 ${
                              Number(fnfHistory.fnfAmount) < 0
                                ? "text-red-600 font-semibold"
                                : "text-green-600 font-semibold"
                            }`}
                          >
                            ₹ {fnfHistory.fnfAmount || 0}
                          </td>
                          {/* <td className="p-3">
                                                    {fnfHistory.remarks || "-"}
                                                </td> */}
                          {showActions && (
                            <td className=" sticky right-0 bg-white">
                              {canEditFnf && (
                                <button
                                  onClick={() => {
                                    setSelectedClient(item);
                                    setShowFnfForm(true);
                                  }}
                                  className="flex border border-gray-200 rounded-lg items-center gap-1 px-4 py-1 hover:bg-gray-100"
                                >
                                  <span>💰</span>
                                  FNF
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={18}
                        className="p-5 text-center text-gray-500"
                      >
                        No Notice Clients Found
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col gap-2 border-t border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
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
      {showFnfForm && (
        <FnfEditForm
          client={selectedClient}
          rentHistories={selectedClient?.rentHistories || []}
          onClose={() => {
            setShowFnfForm(false);
            setSelectedClient(null);
          }}
        />
      )}
      <FnfFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(data) => {
          setFilters(data);
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
        initialFilters={filters}
      />
    </>
  );
}

export default FullandFinalSettlement;