
import React from 'react'
import { useState } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import UserFilter from '../User/UserFilter';
import { useFnFnadNoticeData } from './services';
import Pagination from '../Common/Pagination';
import { formatDate } from '../../utils/dateFormatter';
import FnfEditForm from './FnfEditForm';
import { useUpdateClientData } from '../Clients/services';
import { Copy } from "lucide-react";
import { toast } from 'react-toastify';
function FullandFinalSettlement() {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);
    const [showFnfForm, setShowFnfForm] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [rentHistories, setRentHistories] = useState([]);
    const debouncedSearch = useDebounce(search);
    const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;

    //  const { mutate: deleteUserData, isPending } = useDeleteUserData();

    const {
        data: apiResponse,
        isPending,
        isError,
        error,
    } = useFnFnadNoticeData({
        page: 1,
        limit: 10,
    });

    //  API response ko array me normalize kar rahe hain
    const data = Array.isArray(apiResponse)
        ? apiResponse
        : apiResponse?.data || [];


    // const { data: apiResponse, isLoading } = useUsersData({
    //     page: currentPage,
    //     limit: rowsPerPage,
    //     search: debouncedSearch,
    //     filters,
    // });

    const apiData = apiResponse?.data || [];
    const totalPages = apiResponse?.totalPages || 1;
    const totalRecords = apiResponse?.totalRecords || 0;

    const paginatedData = apiData;

    const handleReset = () => {
        setFilters({});
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
                    <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">

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
                        <div className="flex gap-2">
                            {Object.keys(filters).length > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                                >
                                    {/* <Filter size={16} /> */}
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
                                    <th className="p-3 text-left sticky right-0 bg-gray-100">Action</th>
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
                                                        text: "Ready For Handover",
                                                        className: "bg-gray-200 text-gray-700",
                                                    };
                                                }
                                            }

                                            // Permanent Notice
                                            if (item.noticeStartDate) {
                                                return {
                                                    text: "Notice",
                                                    className: "bg-orange-200 text-orange-700",
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
                                                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
                                                                    {fnfStatus}
                                                                </span>
                                                            );
                                                        }

                                                        const status = getClientStatus(item);

                                                        return (
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${status.className}`}
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
                            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
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
            <UserFilter
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                apiData={apiData}
                onApply={(data) => setFilters(data)}
                handleReset={handleReset}
                resetTrigger={resetTrigger}
            />
        </>
    );
}

export default FullandFinalSettlement