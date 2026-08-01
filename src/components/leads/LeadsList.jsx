import { useState } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useDeleteLeadData, useLeadAutoTransfer, useLeadsData, useUpdateLeadAutoTransfer } from "./services";
import useDebounce from "../hooks/useDebounce";
import LeadsFilter from "./LeadsFilter";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { convertStringFormatDate, formatDate, formatDateAndTime } from "../../utils/dateFormatter";
import { useCurrentUser } from "../../auth/services";
import { toast } from "react-toastify";

const statusColors = {
    New: "bg-blue-100 text-blue-700",
    Followup: "bg-yellow-100 text-yellow-700",
    Visited: "bg-purple-100 text-purple-700",
    Booked: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
};

const LeadsList = () => {
    const { mutate: deleteLead } = useDeleteLeadData();
    const { data: currentUser } = useCurrentUser();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [defaultFilterData, setDefaultFilterData] = useState(null);
    const [resetTrigger, setResetTrigger] = useState(0);
    const rowsPerPage = 10;
    const debouncedSearch = useDebounce(search);
    const { data: autoTransfer } = useLeadAutoTransfer();
    const { mutate: updateLeadAutoTransfer, isPending } = useUpdateLeadAutoTransfer();

    const { data: apiResponse } = useLeadsData({
        page: currentPage,
        limit: rowsPerPage,
        search: debouncedSearch,
        ...filters,
    });

    const apiData = apiResponse?.data || [];
    const totalPages = apiResponse?.totalPages || 1;
    const totalRecords = apiResponse?.totalRecords || 0;

    const handleReset = () => {
        setFilters({});
        setSearch("");
        setCurrentPage(1);
        setResetTrigger(prev => prev + 1);
    };

    const handleDefaultFilter = () => {
        const today = convertStringFormatDate(new Date());

        const data = {
            default: true,
            DateFrom: today,
            DateTo: today,
            FollowupDate: today,
            // Assignee: currentUser,
            defaultFilter: true,
        };

        setFilters(data);
        setDefaultFilterData(data);
        setCurrentPage(1);

    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            deleteLead(id);
        }
    };


    const handleAutoTransfer = () => {
        updateLeadAutoTransfer(
            !autoTransfer?.data?.leadAutoTransfer,
            {
                onSuccess: (response) => {
                    toast.dismiss()
                    toast.success(
                        response?.message || "Lead Auto Transfer Updated Successfully"
                    );
                },

                onError: (error) => {
                      toast.dismiss()
                    toast.error(
                        error?.response?.data?.message ||
                        "Failed to update Lead Auto Transfer"
                    );
                },
            }
        );
    };


    return (
        <>
            <div className="space-y-5">

                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Leads List</h1>
                            <p className="text-sm text-gray-500">
                                {`Total Leads: ${totalRecords}`}
                            </p>
                        </div>

                        <Link to="/leads/create">
                            <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                + Add Lead
                            </button>
                        </Link>

                    </div>
                </div>


                <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">


                    <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">

                        <div className="relative w-80">
                            <input
                                className="border px-3 py-2 pr-10 rounded-lg w-full"
                                placeholder="Search lead..."
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
<label className="inline-flex items-center cursor-pointer gap-2">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={autoTransfer?.data?.leadAutoTransfer || false}
                                    onChange={handleAutoTransfer}
                                    disabled={isPending}
                                />

                                {/* Track */}
                                <div className="w-9 h-5 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300"></div>

                                {/* Knob */}
                                <div
                                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${autoTransfer?.data?.leadAutoTransfer
                                            ? "translate-x-4"
                                            : "translate-x-0"
                                        }`}
                                />
                            </div>

                            <span className="text-xs font-medium">
                                {isPending
                                    ? "Updating..."
                                    : autoTransfer?.data?.leadAutoTransfer
                                        ? "Auto Transfer ON"
                                        : "Auto Transfer OFF"}
                            </span>
                        </label>
                            <button
                                onClick={handleDefaultFilter}
                                className={` ${filters.default ? "border border-green-500 text-green-500" : "border"} border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2`}

                            >
                                Today's Leads
                            </button>

                            {Object.keys(filters).length > 0 && (
                                <button
                                    onClick={handleReset}
                                    className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
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


                    <div className="flex-1 overflow-auto">

                        <table className="w-max min-w-full">

                            <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">

                                <tr>

                                    <th className="p-3 text-left">Lead ID</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Client Name</th>
                                    <th className="p-3 text-left">Gender</th>
                                    <th className="p-3 text-left">Calling No</th>
                                    <th className="p-3 text-left">WhatsApp No</th>
                                    <th className="p-3 text-left">Followup Date</th>
                                    <th className="p-3 text-center">Lead Status</th>
                                    <th className="p-3 text-left">Reason</th>
                                    <th className="p-3 text-left">Field Member</th>
                                    <th className="p-3 text-left">Team Code</th>
                                    <th className="p-3 text-left">Lead Source</th>
                                    <th className="p-3 text-left">workLogs</th>
                                    <th className="p-3 text-left">Transfer History</th>
                                    <th className="p-3 text-left">Assignee</th>
                                    <th className="sticky right-0 bg-gray-100 p-3 text-center">Actions</th>

                                </tr>

                            </thead>


                            <tbody>

                                {apiData.length > 0 ? (

                                    apiData.map((item) => (

                                        <tr
                                            key={item._id}
                                            className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                        >
                                            <td className="p-3 font-semibold">
                                                {item.LeadNo}
                                            </td>

                                            <td className="p-3">
                                                {formatDate(item.Date)}
                                            </td>
                                            <td className="p-3">
                                                {item.ClientName}
                                            </td>

                                            <td className="p-3">
                                                {item.Gender}
                                            </td>


                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {item.CallingNo}

                                                    <a href={`tel:${item.CallingNo}`}>
                                                        <IoIosCall className="text-green-600" />
                                                    </a>

                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {item.WhatsAppNo}

                                                    <a
                                                        href={`https://wa.me/${item.WhatsAppNo}`}
                                                        target="_blank"
                                                    >
                                                        <FaWhatsapp className="text-green-500" />
                                                    </a>

                                                </div>
                                            </td>

                                            <td className="p-3">
                                                {formatDate(item.FollowupDate)}
                                            </td>

                                            <td className="p-3 text-center">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.LeadStatus] || "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {item.LeadStatus}
                                                </span>

                                            </td>

                                            <td className="p-3">
                                                {item.Reason}
                                            </td>

                                            <td className="p-3">
                                                {item.FieldMember}
                                            </td>

                                            <td className="p-3">
                                                {item.TeamCode}
                                            </td>

                                            <td className="p-3">
                                                {item.LeadSource}
                                            </td>

                                            <td className="px-2">
                                                <div className="group relative cursor-pointer">

                                                    {/* Short Text */}
                                                    <div className="truncate max-w-28 text-xs">
                                                        {item.workLogs?.length > 0
                                                            ? [...item.workLogs]
                                                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.message
                                                            : "-"
                                                        }
                                                    </div>


                                                    {/* Hover Popup */}
                                                    <div className="absolute right-0 top-4 hidden group-hover:block bg-white border shadow-xl rounded-lg p-3 w-80 max-h-62.5 overflow-y-auto whitespace-pre-line text-xs z-50">
                                                        {[...(item.workLogs || [])]
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
                                            </td>

                                            <td className="px-2">
                                                <div className="group relative cursor-pointer">

                                                    {/* Short Text */}
                                                    <div className="truncate max-w-36 text-xs">
                                                        {item.TransferHistory}
                                                    </div>

                                                    {/* Hover Popup */}
                                                    <div className="absolute left-0 top-4.5 hidden group-hover:block bg-white border shadow-xl rounded-lg p-2 w-64 max-h-62.5 overflow-y-auto whitespace-pre-line text-xs z-50">
                                                        {item.TransferHistory}
                                                    </div>

                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {item.Assignee}
                                            </td>
                                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">

                                                <div className="flex justify-center gap-2">


                                                    <Link to={`/leads/view/${item._id}`}>
                                                        <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>


                                                    <Link
                                                        to={`/leads/edit/${item._id}`}
                                                        state={{
                                                            search,
                                                            filters,
                                                        }}
                                                    >
                                                        <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                                            <Pencil size={16} />
                                                        </button>
                                                    </Link>


                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>


                                                </div>

                                            </td>


                                        </tr>

                                    ))

                                ) : (
                                    <tr>
                                        <td colSpan={23}>
                                            <NoDataFound
                                                title="No Leads Found"
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
                            Showing {(currentPage - 1) * rowsPerPage + 1} -
                            {Math.min(currentPage * rowsPerPage, totalRecords)}
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


            <LeadsFilter
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                apiData={apiData}
                onApply={(data) => {
                    setFilters(data);
                    setCurrentPage(1);
                }}
                handleReset={handleReset}
                resetTrigger={resetTrigger}
                defaultFilterData={defaultFilterData}
            />


        </>
    );

};

export default LeadsList;