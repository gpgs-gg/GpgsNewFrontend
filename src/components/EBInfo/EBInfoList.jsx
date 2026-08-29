import React, { useState } from "react";
import { Filter, Pencil, Save, Search } from "lucide-react";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import { useElectricityBillData } from "./services";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import EBInfoFilter from "./EBInfoFilter";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { TableFilePreview } from "../common/FilePreview";

function EBInfoList() {

    // ================= DEFAULT NEXT MONTH =================

    const getNextMonth = () => {
        const date = new Date();

        date.setMonth(date.getMonth() + 1);

        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        return `${months[date.getMonth()]}${date.getFullYear()}`;
    };

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);

    // Default = Current Month + 1
    // August 2026 -> Sep2026
    const [billingMonth, setBillingMonth] = useState(
        getNextMonth()
    );

    const debouncedSearch = useDebounce(search);

    const rowsPerPage =
        PAGINATION.PROPERTIES_PER_PAGE || 10;

    // ================= API =================

    const {
        data: apiResponse,
        isLoading,
    } = useElectricityBillData({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        billingMonth,
        filters,
    });

    const apiData = apiResponse?.data || [];

    const totalPages =
        apiResponse?.totalPages || 1;

    const totalRecords =
        apiResponse?.totalRecords || 0;

    // ================= MONTHS =================

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // ================= CONVERT STRING TO DATE =================

    const selectedMonth = billingMonth
        ? (() => {
            const monthName =
                billingMonth.slice(0, 3);

            const year =
                Number(billingMonth.slice(3));

            const monthIndex =
                months.indexOf(monthName);

            return monthIndex !== -1 && year
                ? new Date(year, monthIndex, 1)
                : null;
        })()
        : null;

    // ================= SEARCH =================

    const handleSearch = (value) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFilters({});
        setSearch("");
        setCurrentPage(1);
        setResetTrigger((prev) => prev + 1);
    };

    // ================= MONTH CHANGE =================

    const handleMonthChange = (date) => {

        if (!date) {
            return;
        }

        const value =
            `${months[date.getMonth()]}${date.getFullYear()}`;

        setBillingMonth(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-5">

            {/* ================= HEADER ================= */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">

                <div className="flex justify-between items-center">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Electricity Bill Info
                        </h1>

                        <p className="text-sm text-gray-500">
                            Manage monthly electricity bill data
                        </p>
                    </div>
                </div>

            </div>

            {/* ================= TABLE ================= */}

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">

                {/* ================= SEARCH + MONTH ================= */}

                <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">

                    {/* SEARCH */}

                    <div className="relative w-80">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            className="border px-3 py-2 pl-10 pr-10 rounded-lg w-full"
                            placeholder="Search Property..."
                            value={search}
                            onChange={(e) =>
                                handleSearch(e.target.value)
                            }
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

                    {/* MONTH PICKER */}

                    <div className="flex gap-2">
                        <div className="has-value  ">

                            <label className=" datepicker-label">
                                Month
                            </label>

                            <DatePicker
                                selected={selectedMonth}
                                onChange={handleMonthChange}
                                dateFormat="MMM yyyy"
                                showMonthYearPicker
                                className="custom-datepicker"
                                placeholderText="Select Month"
                            />

                        </div>
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

                {/* ================= TABLE CONTENT ================= */}

                <div className="flex-1 overflow-auto">



                    <table className="w-max min-w-full">

                        <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">

                            <tr>

                                <th className="p-3 text-left">
                                    Property Code
                                </th>

                                <th className="p-3 text-left">
                                    EB Cycle
                                </th>

                                <th className="p-3 text-left">
                                    Sub Meter Details
                                </th>

                                <th className="p-3 text-left">
                                    EB Caln Date
                                </th>

                                <th className="p-3 text-left">
                                    Flat Units
                                </th>

                                <th className="p-3 text-left">
                                    Flat EB
                                </th>

                                <th className="p-3 text-left">
                                    Assignee
                                </th>

                                <th className="p-3 text-left">
                                    reviewer
                                </th>

                                <th className="p-3 text-left">
                                    Attachment
                                </th>

                                <th className="p-3 text-left">
                                    Status
                                </th>

                                <th className="p-3 text-left">
                                    WorkLog
                                </th>

                                <th className="sticky right-0 bg-gray-100 p-3 text-center shadow-md">
                                    Actions
                                </th>

                            </tr>

                        </thead>
                        {isLoading ? (

                            <TableSkeleton />

                        ) : (
                            <tbody>

                                {apiData.length > 0 ? (

                                    apiData.map((item) => (

                                        <tr
                                            key={item.propertyCode}
                                            className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                        >

                                            <td className="p-3 font-semibold">
                                                {item.propertyCode || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.EBCycle ?? "-"}
                                            </td>

                                            <td
                                                className="p-3 max-w-30 truncate"
                                                title={item.SubMeterDetails || "-"}
                                            >
                                                {item.SubMeterDetails || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.EBCalnDate ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.flatUnits ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.flatEB ?? "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.assignee || "-"}
                                            </td>

                                            <td className="p-3">
                                                {item.reviewer || "-"}
                                            </td>

                                            <td className="p-3">
                                                <div className="inline-flex">
                                                    <TableFilePreview files={item.attachment} />
                                                </div>
                                            </td>

                                            <td className="p-3">

                                                {item.status ? (

                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Submitted"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>

                                                ) : (
                                                    "-"
                                                )}

                                            </td>

                                            <td className="px-2">
                                                {item.workLogs?.length > 0 ? (
                                                    <div className="group relative cursor-pointer">
                                                        {/* Short Text */}
                                                        <div className="truncate max-w-28 text-xs">
                                                            {[...item.workLogs]
                                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.message}
                                                        </div>

                                                        {/* Hover Popup */}
                                                        <div className="absolute right-0 top-4 hidden group-hover:block bg-white border shadow-xl rounded-lg p-3 w-80 max-h-62.5 overflow-y-auto whitespace-pre-line text-xs z-50">
                                                            {[...item.workLogs]
                                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                                .map((log, index) => (
                                                                    <div key={log._id || index} className="mb-3">
                                                                        <div className="text-gray-700">
                                                                            {log.createdBy}
                                                                            <span className="mx-1">•</span>
                                                                            {formatDateAndTime(log.createdAt)}
                                                                        </div>

                                                                        <div className="mt-1 font-medium">
                                                                            {log.message}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500">-</div>
                                                )}
                                            </td>

                                            {/* ================= ACTION ================= */}

                                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">

                                                <div className="flex justify-center gap-2">

                                                    {item.monthlyRecordId ? (

                                                        <Link
                                                            to={`/eb-info/edit/${item.monthlyRecordId}`}
                                                        >

                                                            <button
                                                                type="button"
                                                                className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                                                                title="Update"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                        </Link>

                                                    ) : (

                                                        <Link
                                                            to="/eb-info/create"
                                                            state={{
                                                                propertyCode:
                                                                    item.propertyCode,

                                                                billingMonth:
                                                                    item.billingMonth,

                                                                EBCycle:
                                                                    item.EBCycle,
                                                            }}
                                                        >

                                                            <button
                                                                type="button"
                                                                className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
                                                                title="Create"
                                                            >
                                                                <Save size={16} />
                                                            </button>

                                                        </Link>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td colSpan={9}>

                                            <NoDataFound
                                                title="No Properties Found"
                                                description="Try searching different property codes"
                                            />

                                        </td>

                                    </tr>

                                )}

                            </tbody>
                        )}
                    </table>



                </div>

                {/* ================= PAGINATION ================= */}

                <div className="border-t p-3 flex justify-between items-center">

                    <span className="text-sm text-gray-500">

                        Showing{" "}

                        {totalRecords === 0
                            ? 0
                            : (currentPage - 1) *
                            rowsPerPage +
                            1}

                        {" - "}

                        {Math.min(
                            currentPage * rowsPerPage,
                            totalRecords
                        )}

                        {" of "}

                        {totalRecords}

                    </span>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />

                </div>

            </div>

            <EBInfoFilter
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                apiData={apiData}
                onApply={(data) => setFilters(data)}
                handleReset={handleReset}
                resetTrigger={resetTrigger}
            />

        </div>
    );
}

export default EBInfoList;