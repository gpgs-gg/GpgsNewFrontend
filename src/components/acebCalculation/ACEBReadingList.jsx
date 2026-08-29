import React, { useState } from "react";
import { Eye, Pencil, Plus, ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";
import { PAGINATION } from "../../constants/appConfig";
import { useACEBReadingData, usePropertyACEBReadingData, useSinglePropertyData } from "./services";
import { formatDate } from "../../utils/dateFormatter";

function ACEBReadingList() {
    const { propertyId } = useParams();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearch = useDebounce(search);
    const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
    // Property Details
    const {
        data: propertyResponse,
        isLoading: propertyLoading,
    } = useSinglePropertyData(propertyId);
    // Reading History
    const {
        data: apiResponse,
        isLoading: readingLoading,
    } = usePropertyACEBReadingData({
        propertyId,
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
    });
    const property = propertyResponse?.data;
    const apiData = apiResponse?.data || [];
    const totalPages = apiResponse?.totalPages || 1;
    const totalRecords = apiResponse?.totalRecords || 0;
    const isLoading = propertyLoading || readingLoading;
    
    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/aceb-area"
                            className="p-2 rounded-lg border hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {property?.propertyCode || "Property"} - Electricity Reading
                            </h1>
                            <p className="text-sm text-gray-500">
                                Monthly electricity reading history
                            </p>
                        </div>
                    </div>
                    <Link to={`/aceb-area/${propertyId}/reading/create`}>
                        <button
                            className="theme-btn text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Reading
                        </button>
                    </Link>
                </div>
            </div>
            {/* TABLE */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[70vh]">
                {/* SEARCH */}
                <div className="px-3 py-2 border-b border-gray-400 flex justify-between">
                    <div className="relative w-80">
                        <input
                            className="border px-3 py-2 pr-10 rounded-lg w-full"
                            placeholder="Search Month..."
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

                {/* TABLE */}
                <div className="flex-1 overflow-auto">
                    <table className="w-max min-w-full">
                        <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                            <tr>
                                <th className="p-3 text-left">
                                    Month
                                </th>
                                <th className="p-3 text-left">
                                    Reading Date
                                </th>
                                <th className="p-3 text-left">
                                    Flat Total Units
                                </th>
                                <th className="p-3 text-left">
                                    Flat Total EB
                                </th>
                                <th className="p-3 text-left">
                                    Per Unit Cost
                                </th>
                                <th className="p-3 text-left">
                                    Actual Units
                                </th>
                                <th className="p-3 text-left">
                                    Actual EB
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
                                            key={item._id}
                                            className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                        >
                                            <td className="p-3 font-semibold">
                                                {item.month || "-"}
                                            </td>
                                            <td className="p-3">
                                                {formatDate(item.date) || "-"}
                                            </td>
                                            <td className="p-3">
                                                {item.flatTotalUnits ?? "-"}
                                            </td>
                                            <td className="p-3">
                                                {item.flatTotalEB ?? "-"}
                                            </td>
                                            <td className="p-3">
                                                {item.perUnitCost ?? "-"}
                                            </td>
                                            <td className="p-3">
                                                {item.actualTotalUnits ?? "-"}
                                            </td>
                                            <td className="p-3">
                                                {item.actualTotalEB ?? "-"}
                                            </td>
                                            {/* ACTIONS */}
                                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">
                                                <div className="flex justify-center gap-2">
                                                    {/* VIEW */}
                                                    <Link
                                                        to={`/aceb-area/${propertyId}/reading/view/${item._id}`}
                                                    >
                                                        <button
                                                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                                                            title="View Reading"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>

                                                    {/* EDIT */}
                                                    <Link
                                                        to={`/aceb-area/${propertyId}/reading/edit/${item._id}`}
                                                    >
                                                        <button
                                                            className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                                                            title="Edit Reading"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8}>
                                            <NoDataFound
                                                title="No Readings Found"
                                                description="No electricity reading has been added for this property."
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* PAGINATION */}
                <div className="border-t p-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing{" "}
                        {totalRecords === 0
                            ? 0
                            : (currentPage - 1) * rowsPerPage + 1}{" "}

                        -{" "}
                        {Math.min(
                            currentPage * rowsPerPage,
                            totalRecords
                        )}{" "}
                        of {totalRecords}
                    </span>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
}

export default ACEBReadingList;