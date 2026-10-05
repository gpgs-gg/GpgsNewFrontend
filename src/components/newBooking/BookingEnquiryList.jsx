import React, { useEffect, useState } from "react";
import { X, Search, ClipboardPen } from "lucide-react";
import { useBookingEnquiry } from "../BookingEnquiry/services";
import Pagination from "../common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../common/TableSkelton";
import { formatDate } from "../../utils/dateFormatter";
import useDebounce from "../hooks/useDebounce";

const BookingEnquiryList = ({ isOpen, onClose, onFillBookingForm, }) => {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
            const debouncedSearch = useDebounce(search);

    const rowsPerPage = 10;

    const { data, isLoading } = useBookingEnquiry({
        page: currentPage,
        limit: rowsPerPage,
        search : debouncedSearch,
    });

    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
            setSearch("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const enquiryData = Array.isArray(data?.data) ? data.data : [];
    const totalPages = data?.totalPages || 1;
    const totalRecords = data?.totalRecords || 0;


    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    const clearSearch = () => {
        setSearch("");
        setCurrentPage(1);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3">
                    <div>
                        <h2 className="text-xl font-bold uppercase text-gray-800">
                            Booking Enquiries
                        </h2>

                        <p className="text-sm text-gray-500">
                            Manage all booking enquiries
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* SEARCH */}
                <div className="flex items-center justify-between gap-3 border-b border-gray-300 px-3 py-2">
                    <div className="relative w-80">
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search enquiry..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm outline-none focus:border-gray-500"
                        />

                        {search ? (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                            >
                                <X size={17} />
                            </button>
                        ) : (
                            <Search
                                size={17}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                        )}
                    </div>

                    <div className="text-sm text-gray-500">
                        Total Enquiries:{" "}
                        <span className="font-semibold text-gray-700">
                            {totalRecords}
                        </span>
                    </div>
                </div>

                {/* TABLE */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[1400px]">
                        <thead className="sticky top-0 z-30 whitespace-nowrap bg-gray-100">
                            <tr>
                                <th className="sticky left-0 z-20 bg-gray-100 p-3 text-left">
                                    #
                                </th>

                                <th className="p-3 text-left">Full Name</th>

                                <th className="p-3 text-center">
                                    WhatsApp
                                </th>

                                <th className="p-3 text-center">
                                    Calling Number
                                </th>

                                <th className="p-3 text-left">Email</th>

                                <th className="p-3 text-left">
                                    Company / College
                                </th>

                                <th className="p-3 text-center">Profile</th>

                                <th className="p-3 text-center">
                                    Joining Date
                                </th>

                                <th className="p-3 text-left">Father</th>

                                <th className="p-3 text-center">
                                    Father Contact
                                </th>

                                <th className="p-3 text-left">Mother</th>

                                <th className="p-3 text-center">
                                    Mother Contact
                                </th>
                                <th className="sticky right-0 z-20 bg-gray-100 p-3 text-left">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        {isLoading ? (
                            <TableSkeleton rows={8} columns={12} />
                        ) : (
                            <tbody>
                                {enquiryData.length > 0 ? (
                                    enquiryData.map((item, index) => (
                                        <tr
                                            key={item?._id || index}
                                            className="whitespace-nowrap border-t border-gray-300 hover:bg-gray-50"
                                        >
                                            {/* INDEX */}
                                            <td className="sticky left-0 z-10 bg-white p-3 text-left text-gray-500">
                                                {(currentPage - 1) *
                                                    rowsPerPage +
                                                    index +
                                                    1}
                                            </td>

                                            {/* FULL NAME */}
                                            <td className="p-3 font-semibold text-gray-800">
                                                {item?.fullName || "-"}
                                            </td>

                                            {/* WHATSAPP */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item?.whatsappNumber || "-"}
                                            </td>

                                            {/* CALLING NUMBER */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item?.callingNumber || "-"}
                                            </td>

                                            {/* EMAIL */}
                                            <td className="p-3 text-gray-600">
                                                {item?.email || "-"}
                                            </td>

                                            {/* COMPANY / COLLEGE */}
                                            <td className="p-3 text-gray-600">
                                                {item?.companyCollegeName || "-"}
                                            </td>

                                            {/* PROFILE */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item?.profile || "-"}
                                            </td>

                                            {/* JOINING DATE */}
                                            <td className="p-3 text-center text-gray-600">
                                                {formatDate(item?.joiningDate)}
                                            </td>

                                            {/* FATHER */}
                                            <td className="p-3 text-gray-600">
                                                {item?.fatherName || "-"}
                                            </td>

                                            {/* FATHER CONTACT */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item?.fatherContact || "-"}
                                            </td>

                                            {/* MOTHER */}
                                            <td className="p-3 text-gray-600">
                                                {item?.motherName || "-"}
                                            </td>

                                            {/* MOTHER CONTACT */}
                                            <td className="p-3 text-center text-gray-600">
                                                {item?.motherContact || "-"}
                                            </td>
                                            <td className="sticky right-0 z-10 bg-white p-3 text-left text-gray-500">
                                                <button
                                                    type="button"
                                                    className="px-3 py-2 rounded-lg theme-btn flex items-center gap-2"
                                                    onClick={() => onFillBookingForm(item)}
                                                >
                                                    <ClipboardPen size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={12} className="h-64">
                                            <div className="flex h-full items-center justify-center">
                                                <NoDataFound
                                                    title="No Booking Enquiries Found"
                                                    description="Try searching different keywords"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>

                {/* PAGINATION / FOOTER */}
                <div className="flex items-center justify-between border-t border-gray-300 bg-white p-3">
                    <span className="text-sm text-gray-500">
                        {totalRecords > 0
                            ? `Showing ${(currentPage - 1) * rowsPerPage + 1
                            } - ${Math.min(
                                currentPage * rowsPerPage,
                                totalRecords,
                            )} of ${totalRecords}`
                            : "Showing 0 - 0 of 0"}
                    </span>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setCurrentPage(page);
                        }}
                    />

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-gray-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingEnquiryList;