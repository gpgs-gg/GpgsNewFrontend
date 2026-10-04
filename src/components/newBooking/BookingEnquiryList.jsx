import React from "react";
import { X } from "lucide-react";
import { useBookingEnquiry } from "../BookingEnquiry/services";

const BookingEnquiryList = ({ isOpen, onClose }) => {
    const { data, isLoading } = useBookingEnquiry();

    if (!isOpen) return null;

    const enquiryData = Array.isArray(data?.data) ? data.data : [];

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Booking Enquiries
                        </h2>

                        <p className="mt-0.5 text-xs text-slate-500">
                            List of all booking enquiries
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-auto">
                    <table className="w-full min-w-[1200px] border-collapse text-sm">

                        <thead>
                            <tr className="border-b bg-slate-50">
                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    #
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Full Name
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    WhatsApp
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Calling Number
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Email
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Company / College
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Profile
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Joining Date
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Father
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Father Contact
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Mother
                                </th>

                                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                                    Mother Contact
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, index) => (
                                    <tr key={index} className="border-b">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <td key={i} className="px-4 py-4">
                                                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : enquiryData.length > 0 ? (
                                enquiryData.map((item, index) => (
                                    <tr
                                        key={item?._id || index}
                                        className="border-b transition hover:bg-slate-50"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                                            {index + 1}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                                            {item?.fullName || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.whatsappNumber || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.callingNumber || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">
                                            {item?.email || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-600">
                                            {item?.companyCollegeName || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.profile || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {formatDate(item?.joiningDate)}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.fatherName || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.fatherContact || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.motherName || "-"}
                                        </td>

                                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                            {item?.motherContact || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={12}
                                        className="px-4 py-12 text-center text-sm text-slate-500"
                                    >
                                        No booking enquiries found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t bg-slate-50 px-5 py-3">
                    <span className="text-xs text-slate-500">
                        Total Enquiries:{" "}
                        <span className="font-semibold text-slate-700">
                            {enquiryData.length}
                        </span>
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingEnquiryList;