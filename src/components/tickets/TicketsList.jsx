import { useState, useMemo } from "react";
import { Eye, Pencil, Filter, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useTicketsData } from "./services";
import { convertStringFormatDateTime, formatDate, formatDateAndTime } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import TicketsFilter from "./TicketsFilter";
import { IoClose } from "react-icons/io5";
import { TableFilePreview } from "../common/FilePreview";


const priorityColors = {
    Critical: "text-red-700",
    High: "text-red-500",
    Medium: " text-yellow-500",
    Low: " text-green-700",
};

const statusColors = {
    Open: "bg-red-100 text-red-700",
    Acknowledged: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "On Hold": "bg-orange-100 text-orange-700",
    Resolved: "bg-green-100 text-green-700",
    Closed: "bg-gray-200 text-gray-700",
    Cancelled: "bg-pink-100 text-pink-700",
    ReOpen: "bg-purple-100 text-purple-700",
};

const   TicketsList = () => {
    const { data: apiResponse } = useTicketsData();

    // ✅ safe extraction
    const apiData = apiResponse?.data || [];

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});
    const [resetTrigger, setResetTrigger] = useState(0);
    const [selectedTickets, setSelectedTickets] = useState(new Set());
    const [selectedColumns, setSelectedColumns] = useState(new Set());
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [previewFiles, setPreviewFiles] = useState([]);
    const rowsPerPage = 10;

    // ✅ filter & search logic
    const filteredData = useMemo(() => {
        return apiData?.filter((item) => {
            const matchesSearch =
                !search ||
                Object.values(item).some((value) =>
                    String(value).toLowerCase().includes(search.toLowerCase())
                );

            return (
                (!filters.propertyCode ||
                    item.propertyCode === filters.propertyCode) &&
                (!filters.Location ||
                    item.propertyLocation === filters.Location) &&
                (!filters.priority ||
                    item.priority === filters.priority) &&
                (!filters.status ||
                    item.status === filters.status) &&
                (!filters.department ||
                    item.department === filters.department) &&
                (!filters.category ||
                    item.category === filters.category) &&
                (!filters.assignee ||
                    item.assignee === filters.assignee) &&
                (!filters.manager ||
                    item.manager === filters.manager) &&
                (!filters.customerImpacted ||
                    item.customerImpacted === filters.customerImpacted) &&
                (!filters.escalated ||
                    item.escalated === filters.escalated) &&
                (
                    !filters.lateStatus ||
                    (filters.lateStatus === "LateAcknowledged" &&
                        item.lateAcknowledged === "Yes") ||
                    (filters.lateStatus === "LateResolved" &&
                        item.lateResolved === "Yes")
                ) &&
                matchesSearch
            );
        });
    }, [apiData, filters, search]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const paginatedData = useMemo(() => {
        return filteredData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        );
    }, [filteredData, currentPage]);


    const handleReset = () => {
        setFilters({});
        setSearch("");
        setCurrentPage(1);

        setResetTrigger((prev) => prev + 1);
    };

    const renderFilePreview = (urls) => {
        if (!urls) return null;

        const urlArray = urls
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url !== "");

        return (
            <div className="flex gap-2 justify-center">
                {urlArray.map((url, index) => {
                    const isPdf = url.toLowerCase().includes(".pdf");
                    const fileName = url.split("/").pop();

                    if (isPdf) {
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-center"
                            >
                                <i
                                    className="fas fa-file-pdf text-red-600 text-3xl cursor-pointer hover:scale-110 transition"
                                    title={fileName}
                                    onClick={() => setPreviewFiles([url])}
                                />
                            </div>
                        );
                    }

                    return (
                        <img
                            key={index}
                            src={url}
                            alt="preview"
                            className="w-12 h-12 rounded-lg object-cover border cursor-pointer hover:scale-110 transition"
                            title={fileName}
                            onClick={() => setPreviewFiles([url])}
                        />
                    );
                })}
            </div>
        );
    };

    const fullHeaders = [
        { label: "Ticket ID", key: "ticketId" },
        { label: "Date Created", key: "dateCreated" },
        { label: "Property Code", key: "propertyCode" },
        { label: "Title", key: "title" },
        { label: "Status", key: "status" },
        { label: "Customer Impacted", key: "customerImpacted" },
        { label: "Escalated", key: "escalated" },
        { label: "Target Date", key: "targetDate" },
        { label: "Category", key: "category" },
        { label: "Priority", key: "priority" },
        { label: "Department", key: "department" },
        { label: "Manager", key: "manager" },
        { label: "Assignee", key: "assignee" },
        { label: "Created By Id", key: "createdById" },
        { label: "Created By Name", key: "createdByName" },
        { label: "Updated By ID", key: "updatedById" },
        { label: "Updated By Name", key: "updatedByName" },
        { label: "Updated Date", key: "updatedDateTime" },
        { label: "Internal Comments", key: "internalComments" },
        { label: "Estimated Time", key: "estimatedTimeToResolve" },
        { label: "Actual Time", key: "actualTimeSpent" },
        { label: "Property Location", key: "propertyLocation" },
        { label: "Late Acknowledged", key: "lateAcknowledged" },
        { label: "Late Resolved", key: "lateResolved" },
    ];

    const handleSelectAll = () => {
        if (selectedTickets.size === paginatedData.length) {
            setSelectedTickets(new Set());
        } else {
            const allTicketIds = paginatedData.map(ticket => ticket.ticketId);
            setSelectedTickets(new Set(allTicketIds));
        }
    };

    const handleColumnSelect = (columnKey) => {
        setSelectedColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(columnKey)) {
                newSet.delete(columnKey);
            } else {
                newSet.add(columnKey);
            }
            return newSet;
        });
    };

    const handleSelectAllColumns = () => {
        if (selectedColumns.size === fullHeaders.length) {
            setSelectedColumns(new Set());
        } else {
            const allColumnKeys = fullHeaders.map(header => header.key);
            setSelectedColumns(new Set(allColumnKeys));
        }
    };
    // Export functionality
    const handleSelectedColoum = () => { // Get selected tickets data
        setShowColumnSelector(!showColumnSelector)
    };

    const handleExport = () => {
        const ticketsToExport = filteredData.filter(ticket =>
            selectedTickets.size > 0
                ? selectedTickets.has(ticket.ticketId)
                : true
        );

        // Get selected columns
        const columnsToExport = fullHeaders.filter(header =>
            selectedColumns.size > 0 ? selectedColumns.has(header.key) : true
        );

        if (ticketsToExport.length === 0) {
            toast.error("No tickets selected for export!")
            return;
        }
        if (columnsToExport.length === 0) {
            toast.error("No columns selected for export!")
            return;
        }

        // Prepare CSV content
        const headersRow = columnsToExport.map(header => header.label).join(',');

        const dataRows = ticketsToExport.map(ticket => {
            return columnsToExport.map(header => {
                let value = ticket[header.key] || '';
                // Handle special formatting for dates
                if (header.key === 'DateCreated' && value) {
                    value = formatDate(value);
                }
                // Handle commas in values by wrapping in quotes
                if (typeof value === "string") {
                    value = value.replace(/"/g, '""'); // quotes escape

                    if (
                        value.includes(",") ||
                        value.includes("\n") ||
                        value.includes("\r")
                    ) {
                        value = `"${value}"`;
                    }
                }
                return value;
            }).join(',');
        });

        const csvContent = [headersRow, ...dataRows].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tickets-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setShowColumnSelector(false)
    }

    return (
        <>
            <div className="space-y-5">

                {/* HEADER */}


                <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Tickets List</h1>
                            <p className="text-sm text-gray-500">
                                {`Total Tickets: ${filteredData.length}`}
                            </p>
                        </div>

                        <Link to="/tickets/create">
                            <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                + Add Ticket
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
                                placeholder="Search property..."
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




                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                onClick={handleSelectedColoum}
                                className="px-1 py-1  text-black whitespace-nowrap  flex items-center gap-2"
                            >
                                <i className="fas fa-download"></i>
                                Export {selectedTickets.size > 0 ? `(${selectedTickets.size} selected)` : '(All)'}
                            </button>

                            {/* <button 
                                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
                                >
                                    <i className="fas fa-columns"></i>
                                    Select Columns
                                </button>  */}

                            {selectedTickets.size > 0 && (
                                <span className="text-sm text-gray-600">
                                    {selectedTickets.size} ticket(s) selected
                                </span>
                            )}
                        </div>

                        {showColumnSelector && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 overflow-hidden">
                                    <div className="p-4 border-b">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold">Select Columns to Export</h3>
                                            <button
                                                onClick={() => setShowColumnSelector(false)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {/* <i className="fas fa-times"></i> */}
                                                <IoClose size={22} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 max-h-64 overflow-y-auto">
                                        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded">
                                            <input
                                                type="checkbox"
                                                checked={selectedColumns.size === fullHeaders.length}
                                                onChange={handleSelectAllColumns}
                                                className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                                            />
                                            <label className="font-medium">Select All Columns</label>
                                        </div>

                                        {fullHeaders.map((header) => (
                                            <div key={header.key} className="flex items-center gap-2 mb-2 p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedColumns?.has(header.key)}
                                                    onChange={() => handleColumnSelect(header.key)}
                                                    className="h-4 w-4 text-orange-600 rounded focus:ring-orange-500"
                                                />
                                                <label>{header.label}</label>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-4 flex justify-center items-center border-t bg-gray-50">
                                        <button
                                            onClick={handleExport}
                                            className="px-4 py-2 bg-orange-500  text-white rounded hover:bg-orange-600"
                                        >
                                            <pre> Export</pre>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        <table className="min-w-[1400px] w-full">

                            <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                                <tr>
                                    <th className="sticky  left-0  bg-gray-100 p-3 text-left shadow-md">
                                        <input
                                            type="checkbox"
                                            checked={selectedTickets.size === paginatedData.length && paginatedData.length > 0}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                    </th>
                                    <th className="sticky  left-0  bg-gray-100 p-3 text-left shadow-md">Ticket ID</th>
                                    <th className="p-3 text-left">Date Created</th>
                                    <th className="p-3 text-left">Property Code</th>
                                    <th className="p-3 text-left">Title</th>
                                    <th className="p-3 text-center">Status</th>
                                    <th className="p-3 text-left">Priority</th>
                                    <th className="p-3 text-center">Attachment</th>
                                    <th className="p-3 text-center">Customer Impacted</th>
                                    <th className="p-3 text-center">Escalated</th>
                                    <th className="p-3 text-center">Target Date</th>
                                    <th className="p-3 text-left">Category</th>
                                    <th className="p-3 text-left">Assignee</th>
                                    <th className="p-3 text-left">Department</th>
                                    <th className="p-3 text-left">Created By Id</th>
                                    <th className="p-3 text-left">Created By Name</th>
                                    <th className="p-3 text-left">Updated By ID</th>
                                    <th className="p-3 text-left">Updated By Name</th>
                                    <th className="p-3 text-left">Updated Date Time</th>
                                    <th className="p-3 text-left">Location</th>
                                    <th className="sticky right-0  bg-gray-100 p-3 text-center shadow-md">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                                        >
                                            <td className="sticky left-0 z-20 bg-white p-3 shadow-md">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTickets.has(item.ticketId)}
                                                    onChange={() => {
                                                        setSelectedTickets((prev) => {
                                                            const newSet = new Set(prev);

                                                            if (newSet.has(item.ticketId)) {
                                                                newSet.delete(item.ticketId);
                                                            } else {
                                                                newSet.add(item.ticketId);
                                                            }

                                                            return newSet;
                                                        });
                                                    }}
                                                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                />
                                            </td>
                                            <td className="sticky  left-0 z-20  bg-white p-3 font-semibold shadow-md">{item.ticketId}</td>

                                            <td className="p-3">
                                                {formatDateAndTime(new Date(item.dateCreated))}
                                            </td>

                                            <td className="p-3">{item.propertyCode}</td>

                                            <td className="p-3">
                                                <div>
                                                    <div className="font-medium">
                                                        {item.title
                                                            ? item.title.length > 25
                                                                ? `${item.title.substring(0, 25)}...`
                                                                : item.title
                                                            : "N/A"}
                                                    </div>

                                                    <div className="text-xs text-gray-500 wrap-break-word max-w-75 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {item.description
                                                            ? item.description.length > 60
                                                                ? `${item.description.substring(0, 60)}...`
                                                                : item.description
                                                            : "No Description"}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-3 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                             <td className="p-3">
                                                <span
                                                    className={`px-2 py-1  text-xs font-semibold ${priorityColors[item.priority] || "bg-gray-100 text-gray-700"
                                                        }`}
                                                >
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <TableFilePreview files={item.attachment} />
                                            </td>
                                            <td className="p-3">{item.customerImpacted}</td>
                                            <td className="p-3">{item.escalated}</td>
                                            <td className="p-3"> {formatDate(item.targetDate)}</td>
                                            <td className="p-3">{item.category}</td>

                                           

                                            <td className="p-3">{item.assignee}</td>
                                            <td className="p-3">{item.department}</td>
                                            <td className="p-3">{item.createdById}</td>
                                            <td className="p-3">{item.createdByName}</td>
                                            <td className="p-3">{item.updatedById}</td>
                                            <td className="p-3">{item.updatedByName}</td>
                                            <td className="p-3">{item.updatedDateTime}</td>
                                            <td className="p-3">{item.propertyLocation}</td>



                                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">
                                                <div className="flex justify-center gap-2">
                                                    <Link to={`/tickets/view/${item._id}`}>
                                                        <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>

                                                    <Link to={`/tickets/edit/${item._id}`}>
                                                        <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                                            <Pencil size={16} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10}>
                                            <NoDataFound
                                                title="No Tickets Found"
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
                            Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
                            {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
                            {filteredData.length}
                        </span>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />

                    </div>

                </div>
            </div>
            <TicketsFilter
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                apiData={apiData}
                onApply={(data) => setFilters(data)}
                handleReset={handleReset}
                resetTrigger={resetTrigger}
            />
        </>
    );
};

export default TicketsList;