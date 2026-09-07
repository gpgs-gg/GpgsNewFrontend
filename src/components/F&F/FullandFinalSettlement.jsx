
import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {Filter } from "lucide-react";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import FnfFilter from "./FnfFilter";
import { useFnFnadNoticeData } from "./services";
import Pagination from "../Common/Pagination";
import { formatDate } from "../../utils/dateFormatter";
import FnfEditForm from "./FnfEditForm";
import { Copy } from "lucide-react";
import { toast } from "react-toastify";
import usePersistedFilters from "../hooks/usePersistedFilters";

function FullandFinalSettlement() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
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

    //  const { mutate: deleteUserData, isPending } = useDeleteUserData();

    const {
        data: apiResponse,
        isPending,
        isError,
        error,
    } = useFnFnadNoticeData({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        filters,
    });

    const data = apiResponse?.data || [];

    const totalPages = apiResponse?.totalPages || 1;
    const totalRecords = apiResponse?.totalCount || 0;

    const handleReset = () => {
        resetFilters();
        setSearch("");
        setCurrentPage(1);
        setResetTrigger((prev) => prev + 1);
    };

    const handleRemoveFilter = (key) => {
        removePersistedFilter(key);
        setCurrentPage(1);
    };

    useEffect(() => {
        sessionStorage.setItem("fnfSearch", search);
    }, [search]);

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
                    <div className="px-3 py-2 border-b border-gray-400">
                        <div className="flex justify-between gap-3 items-center">
                            {/* SEARCH */}
                            <div className="relative w-80">
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
                                <div className="flex flex-wrap items-center gap-2 flex-1">
                                    {filterLabels.map((filter) => (
                                        <div
                                            key={filter.key}
                                            className="flex items-center gap-2 bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-full text-sm"
                                        >
                                            <span className="font-medium">{filter.title}:</span>

                                            <span>{filter.value}</span>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFilter(filter.key)}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* BUTTONS */}
                            <div className="flex gap-2">
                                {filterLabels.length > 0 && (
                                    <button
                                        onClick={handleReset}
                                        className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                                    >
                                        Reset
                                    </button>
                                )}

                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE CONTENT */}

                    <div className="overflow-auto h-full">
                        <table className="w-full">
                            <thead className="bg-gray-100 whitespace-nowrap">
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
                                    <th className="p-3 text-left sticky right-0 bg-gray-100">
                                        Action
                                    </th>
                                </tr>
                            </thead>

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
                                                        className: "bg-slate-100 text-slate-700 border border-slate-300",
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
                                                                    title={statusFullForm[fnfStatus] || fnfStatus}
                                                                    className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 cursor-help">
                                                                    {fnfStatus}
                                                                </span>
                                                            );
                                                        }

                                                        const status = getClientStatus(item);

                                                        return (
                                                            <span
                                                                title={statusFullForm[status.text] || status.text}
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

                                                <td className="p-3">
                                                    {item.roomNo || "-"}
                                                </td>

                                                <td className="p-3">
                                                    {item.bedNo || "-"}
                                                </td>

                                                <td className="p-3 font-semibold">
                                                    {item.fullName || "-"}
                                                </td>

                                                <td className="p-3">
                                                    {item.whatsappNo || "-"}
                                                </td>

                                                {/* <td className="p-3">
                                             {item.callingNo || "-"}
                                         </td> */}

                                                {/* <td className="p-3">
                                             {item.emailId || "-"}
                                         </td> */}

                                                <td className="p-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-md font-semibold ${item.stayType === "P. Booked"
                                                            ? " text-green-700"
                                                            : item.stayType === "T. Booked"
                                                                ? " text-yellow-700"
                                                                : " text-gray-700"
                                                            }`}
                                                    >
                                                        {item.stayType || "-"}
                                                    </span>
                                                </td>

                                                <td className="p-3">
                                                    {item.noticeStartDate
                                                        ? formatDate(
                                                            item.noticeStartDate
                                                        )
                                                        : "-"}
                                                </td>

                                                <td className="p-3">
                                                    {item.noticeLastDate
                                                        ? formatDate(item.noticeLastDate
                                                        )

                                                        : "-"}
                                                </td>

                                                <td className="p-3">
                                                    {item.clientVacatingDate
                                                        ? formatDate(
                                                            item.clientVacatingDate
                                                        )
                                                        : "-"}
                                                </td>

                                                <td className="p-3">
                                                    ₹{fnfHistory.totalPaidDeposit || 0}
                                                </td>

                                                <td className="p-3">
                                                    ₹{fnfHistory.currentDue || 0}
                                                </td>

                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span>{fnfHistory.bankDetailReceived || "-"}</span>

                                                        {fnfHistory.bankDetailReceived && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(
                                                                        fnfHistory.bankDetailReceived
                                                                    );
                                                                    toast.dismiss()
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
                                                    className={`p-3 ${Number(fnfHistory.fnfAmount) < 0 ? "text-red-600 font-semibold" : "text-green-600 font-semibold"
                                                        }`}
                                                >
                                                    ₹ {fnfHistory.fnfAmount || 0}
                                                </td>
                                                {/* <td className="p-3">
                                                    {fnfHistory.remarks || "-"}
                                                </td> */}



                                                <td className=' sticky right-0 bg-white'>
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
                                                </td>
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