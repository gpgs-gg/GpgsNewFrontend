import React from 'react'

import { useState } from "react";
import { Eye, Pencil, Filter, Trash2, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";

import { PAGINATION } from "../../constants/appConfig";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useACEBAreaData } from "./services";
import ACEBFilter from './ACEBFilter';
function ACEBAreaList() {

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);
    const debouncedSearch = useDebounce(search);
    const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
    //  const { mutate: deleteUserData, isPending } = useDeleteUserData();
    const { data: apiResponse, isLoading } = useACEBAreaData({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        filters,
    });
    const apiData = apiResponse?.data || [];
    const totalPages = apiResponse?.totalPages || 1;
    const totalRecords = apiResponse?.totalRecords || 0;
    const paginatedData = apiData;
    // const handleDelete = (id) => {
    //     if (window.confirm("Are you sure you want to delete this user?")) {
    //         deleteUserData (id, {
    //             onSuccess: (data) => {
    //                 toast.dismiss();
    //                 toast.success(data.message);
    //             },
    //             onError: (error) => {
    //                 toast.error(error.response?.data?.message || "Delete failed");
    //             },
    //         });
    //     }
    // };
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
                            <h1 className="text-2xl font-bold">AC Electricity Management </h1>
                            <p className="text-sm text-gray-500">
                                Manage Property Electricity Readings
                            </p>
                        </div>
                        <Link to="/aceb-area/create">
                            <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                + Add Property
                            </button>
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
                                placeholder="Search Property..."
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
                    <div className="flex-1 overflow-auto">
                        <table className="w-max min-w-full">
                            <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                                <tr>
                                    <th className="p-3 text-left">Property code</th>
                                    <th className="p-3 text-left">Location</th>
                                    <th className="p-3 text-left">Rooms</th>
                                    <th className="p-3 text-left">Last Reading</th>

                                    <th className="sticky right-0 bg-gray-100 p-3 text-center shadow-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                        >
                                            {/* Employee ID */}
                                            <td className="p-3">
                                                {item.propertyId?.propertyCode || "-"}
                                            </td>
                                            {/* Name */}
                                            <td className="p-3 font-semibold">
                                                {item?.propertyId?.propertyLocation}
                                            </td>
                                            <td className="p-3">
                                                {Array.isArray(item.areas) ? item.areas.length : 0}
                                            </td>
                                            <td className="p-3">
                                                {item.lastMonth}
                                            </td>
                                            {/* Actions */}
                                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">
                                                <div className="flex justify-center gap-2">
                                                    {/* <Link to={`/users/view/${item._id}`}>
                                                        <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link> */}

                                                    <Link to={`/aceb-area/edit/${item._id}`}>
                                                        <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                                            <Pencil size={16} />
                                                        </button>
                                                    </Link>
                                                    {/* <button
                                                        onClick={() =>
                                                            handleDelete(item._id)
                                                        }
                                                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button> */}

                                                    <Link to={`/aceb-area/reading/${item._id}`}>
                                                        <button
                                                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                                                            title="Electricity Reading"
                                                        >
                                                            <Zap size={16} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9}>
                                            <NoDataFound
                                                title="No Property Found"
                                                description="Try searching different keywords"
                                            />
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
            {/* <ACEBFilter
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                apiData={apiData}
                onApply={(data) => setFilters(data)}
                handleReset={handleReset}
                resetTrigger={resetTrigger}
            /> */}
        </>
    );
}

export default ACEBAreaList