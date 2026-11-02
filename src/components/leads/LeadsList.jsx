import { useState, useEffect, useMemo } from "react";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import NoDataFound from "../common/NoDataFound";
import {
  useBulkTransferLeads,
  useDeleteLeadData,
  useGlobalSettings,
  useLeadsData,
  useUpdateGlobalSettings,
} from "./services";
import useDebounce from "../hooks/useDebounce";
import LeadsFilter from "./LeadsFilter";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import LeadMobileCard from "./LeadMobileCard";
import {
  convertStringFormatDate,
  formatDate,
  formatDateAndTime,
} from "../../utils/dateFormatter";
import { useCurrentUser } from "../../auth/services";
import { toast } from "react-toastify";
import Select from "react-select";
import TableSkeleton from "../common/TableSkelton";
import { selectStyles } from "../../utils/selectStyles";
import ConfirmModal from "../common/ConfirmModal";
import { useAuthorization } from "../../context/AuthorizationContext";
import { useAuth } from "../../context/authContext";
import { useEmployeeDetailsData } from "../EmployeeDetails/Services";

const statusColors = {
  New: "bg-blue-100 text-blue-700",
  Followup: "bg-yellow-100 text-yellow-700",
  Visited: "bg-purple-100 text-purple-700",
  Booked: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const LeadsList = () => {
  const DEFAULT_LEAD_FILTERS = {
    TeamCode: "",
    LeadSource: "",
    LeadStatus: "",
    Assignee: "",
    FieldMember: "",
    Reason: "",
    Gender: "",
    DateFrom: "",
    DateTo: "",
    FollowupDate: "",
    default: false,
    defaultFilter: false,
  };

  const { data: employeeData } = useEmployeeDetailsData({
    page: 1,
    limit: 1000,
  });

  const { filters, setFilters, removeFilter, resetFilters } =
    usePersistedFilters("leads_filters", DEFAULT_LEAD_FILTERS);
  const { mutate: deleteLead } = useDeleteLeadData();
  const { data: currentUser } = useCurrentUser();
  const [search, setSearch] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [transferComment, setTransferComment] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("leads_page");

    return savedPage ? Number(savedPage) : 1;
  });

  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    localStorage.setItem("leads_page", String(currentPage));
  }, [currentPage]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = 10;
  const debouncedSearch = useDebounce(search);
  const { data: globalSettings } = useGlobalSettings();
  const { mutate: updateGlobalSettings, isPending } = useUpdateGlobalSettings();

  const { data: apiResponse, isLoading } = useLeadsData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    ...filters,
  });

  const { canAdd, canEdit, canDelete, canSingleView } = useAuthorization();

  const canAddLead = canAdd("pg_leads");
  const canEditLead = canEdit("pg_leads");
  const canDeleteLead = canDelete("pg_leads");
  const canViewLead = canSingleView("pg_leads");

  const showActions = canViewLead || canEditLead || canDeleteLead;

  const apiData = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || 0;
  const { mutate: bulkTransferLeads, isPending: isTransferPending } =
    useBulkTransferLeads();
  const handleReset = () => {
    resetFilters();
    localStorage.removeItem("leads_page");
    setSearch("");
    setCurrentPage(1);
    setResetTrigger((prev) => prev + 1);
  };

  const AssigneeOptions =
    employeeData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];
  const handleDefaultFilter = () => {
    const today = convertStringFormatDate(new Date());

    setFilters({
      ...DEFAULT_LEAD_FILTERS,
      default: true,
      defaultFilter: true,
      DateFrom: today,
      DateTo: today,
      FollowupDate: today,
    });

    setCurrentPage(1);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteLead(deleteId, {
      onSuccess: () => {
        toast.success("Lead deleted successfully");
        setShowDeleteModal(false);
        setDeleteId(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to delete lead");
      },
    });
  };

  const handleAutoTransfer = () => {
    const isTeamAssignmentEnabled = globalSettings?.data?.teamAutoAssignment;

    if (!isTeamAssignmentEnabled) {
      toast.dismiss();
      toast.error(
        "Please enable Team Assignment first to turn on Auto Transfer",
      );
      return;
    }

    const newValue = !globalSettings?.data?.leadAutoTransfer;

    updateGlobalSettings(
      {
        leadAutoTransfer: newValue,
      },
      {
        onSuccess: () => {
          toast.dismiss();

          toast.success(
            newValue
              ? "Lead Auto Transfer Enabled Successfully"
              : "Lead Auto Transfer Disabled Successfully",
          );
        },

        onError: (error) => {
          toast.dismiss();

          toast.error(
            error?.response?.data?.message ||
            "Failed to update Lead Auto Transfer",
          );
        },
      },
    );
  };

  const handleTeamAssignment = () => {
    const newValue = !globalSettings?.data?.teamAutoAssignment;

    updateGlobalSettings(
      {
        teamAutoAssignment: newValue,

        // Team Assignment OFF => Auto Transfer OFF
        ...(newValue === false && {
          leadAutoTransfer: false,
        }),
      },
      {
        onSuccess: (response) => {
          toast.dismiss();
          toast.success("Team Assignment Updated Successfully");
        },

        onError: (error) => {
          toast.dismiss();
          toast.error(
            error?.response?.data?.message ||
            "Failed to update Team Assignment",
          );
        },
      },
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads((prev) => [
        ...new Set([...prev, ...apiData.map((item) => item._id)]),
      ]);
    } else {
      setSelectedLeads((prev) =>
        prev.filter((id) => !apiData.some((item) => item._id === id)),
      );
    }
  };

  const handleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id)
        ? prev.filter((leadId) => leadId !== id)
        : [...prev, id],
    );
  };

  const handleTransfer = () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    if (!selectedAssignee) {
      toast.error("Please select assignee");
      return;
    }

    if (!transferComment.trim()) {
      toast.error("Please enter transfer comment");
      return;
    }

    bulkTransferLeads(
      {
        leadIds: selectedLeads,
        assignee: selectedAssignee.value,
        comment: transferComment.trim(),
        UpdatedBy: currentUser?.user?.name,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("Leads transferred successfully");
          setSelectedLeads([]);
          setSelectedAssignee(null);
          setTransferComment("");
          setShowTransferModal(false);
        },

        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to transfer leads",
          );
        },
      },
    );
  };
  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.DateFrom) {
      labels.push({
        key: "DateFrom",
        label: `Date From: ${formatDate(filters.DateFrom)}`,
      });
    }

    if (filters.DateTo) {
      labels.push({
        key: "DateTo",
        label: `Date To: ${formatDate(filters.DateTo)}`,
      });
    }

    if (filters.FollowupDate) {
      labels.push({
        key: "FollowupDate",
        label: `Followup: ${formatDate(filters.FollowupDate)}`,
      });
    }

    if (filters.TeamCode) {
      labels.push({
        key: "TeamCode",
        label: `Team Code: ${filters.TeamCode}`,
      });
    }

    if (filters.LeadSource) {
      labels.push({
        key: "LeadSource",
        label: `Lead Source: ${filters.LeadSource}`,
      });
    }

    if (filters.LeadStatus) {
      labels.push({
        key: "LeadStatus",
        label: `Status: ${filters.LeadStatus}`,
      });
    }

    if (filters.Assignee) {
      labels.push({
        key: "Assignee",
        label: `Assignee: ${filters.Assignee}`,
      });
    }

    if (filters.FieldMember) {
      labels.push({
        key: "FieldMember",
        label: `Field Member: ${filters.FieldMember}`,
      });
    }

    if (filters.Gender) {
      labels.push({
        key: "Gender",
        label: `Gender: ${filters.Gender}`,
      });
    }

    if (filters.Reason) {
      labels.push({
        key: "Reason",
        label: `Reason: ${filters.Reason}`,
      });
    }

    return labels;
  }, [filters]);

  const hasActiveFilters = filterLabels.length > 0;

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
            {canAddLead && (
              <Link to="/leads/create">
                <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                  + Add Lead
                </button>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH, FILTER CHIPS AND FILTER BUTTONS */}
          <div className="border-b border-gray-200 px-3 py-2">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              {/* SEARCH */}
              <div className="relative w-full lg:w-80 lg:shrink-0">
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

              {/* FILTER CHIPS */}
              {hasActiveFilters && (
                <div className="w-full min-w-0 lg:flex-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                    {filterLabels.map((filter) => (
                      <div
                        key={filter.key}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm"
                      >
                        <span className="font-semibold text-slate-500">
                          {filter.label.split(":")[0]}:
                        </span>

                        <span className="max-w-32 truncate font-medium text-slate-800">
                          {filter.label.includes(":")
                            ? filter.label
                              .substring(filter.label.indexOf(":") + 1)
                              .trim()
                            : filter.label}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            removeFilter(filter.key);
                            setCurrentPage(1);
                          }}
                          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                          aria-label={`Remove ${filter.key} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REMAINING BUTTONS */}
              <div className="flex w-full flex-wrap items-center gap-2 lg:ml-auto lg:w-auto lg:shrink-0 lg:flex-nowrap">
                {/* ADMIN SETTINGS */}
                {isAdmin && (
                  <div className="flex w-full  justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2   lg:w-auto  lg:items-start">
                    {/* AUTO TRANSFER */}
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={
                            globalSettings?.data?.leadAutoTransfer || false
                          }
                          onChange={handleAutoTransfer}
                        />

                        <div className="w-9 h-4 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300" />

                        <div
                          className={`absolute top-0.5 left-0.5 w-4 h-3 bg-white rounded-full shadow transition-transform duration-300 ${globalSettings?.data?.leadAutoTransfer
                              ? "translate-x-4"
                              : "translate-x-0"
                            }`}
                        />
                      </div>

                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {isPending
                          ? "Updating..."
                          : !globalSettings?.data?.teamAutoAssignment
                            ? "Auto Trsfr Disabled"
                            : globalSettings?.data?.leadAutoTransfer
                              ? "Auto Trsfr ON"
                              : "Auto Trsfer OFF"}
                      </span>
                    </label>

                    {/* TEAM ASSIGNMENT */}
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={
                            globalSettings?.data?.teamAutoAssignment || false
                          }
                          onChange={handleTeamAssignment}
                          disabled={isPending}
                        />

                        <div className="w-9 h-4 bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors duration-300" />

                        <div
                          className={`absolute top-0.5 left-0.5 w-4 h-3 bg-white rounded-full shadow transition-transform duration-300 ${globalSettings?.data?.teamAutoAssignment
                              ? "translate-x-4"
                              : "translate-x-0"
                            }`}
                        />
                      </div>

                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {isPending
                          ? "Updating..."
                          : globalSettings?.data?.teamAutoAssignment
                            ? "Team Assign ON"
                            : "Team Assign OFF"}
                      </span>
                    </label>
                  </div>
                )}

                {/* TRANSFER */}
                {selectedLeads.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(true)}
                    className="flex-1 rounded-lg border border-orange-200 px-3 py-2.5 text-sm font-medium text-orange-500 hover:bg-orange-50 lg:flex-none"
                  >
                    Transfer ({selectedLeads.length})
                  </button>
                )}

                {/* TODAY'S LEADS */}
                <button
                  type="button"
                  onClick={handleDefaultFilter}
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium lg:flex-none ${filters.default
                      ? "border border-green-500 text-green-600"
                      : "border border-gray-300 text-gray-700"
                    }`}
                >
                  Today's Leads
                </button>

                {/* RESET */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 lg:flex-none"
                  >
                    Reset
                  </button>
                )}

                {/* FILTERS */}
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:flex-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Filter size={16} />
                    Filters
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            {/* MOBILE CARDS */}
            <div className="md:hidden h-full overflow-y-auto bg-gray-50 p-3 space-y-3">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm animate-pulse">
                    {/* HEADER */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <div className="mt-1 h-4 w-4 shrink-0 rounded bg-gray-200" />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-36 rounded bg-gray-200" />
                          <div className="h-3 w-24 rounded bg-gray-200" />
                        </div>
                      </div>

                      <div className="h-6 w-20 shrink-0 rounded-full bg-gray-200" />
                    </div>

                    {/* DETAILS */}
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-gray-100 pt-3">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <div key={index} className="min-w-0 space-y-2">
                          <div className="h-3 w-20 rounded bg-gray-200" />
                          <div className="h-4 w-28 max-w-full rounded bg-gray-200" />
                        </div>
                      ))}
                    </div>

                    {/* WORK LOGS */}
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <div className="mb-2 h-3 w-16 rounded bg-gray-200" />
                      <div className="h-4 w-full rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-20 rounded bg-gray-200" />
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
                      <div className="h-9 w-9 rounded-lg bg-gray-200" />
                      <div className="h-9 w-9 rounded-lg bg-gray-200" />
                      <div className="h-9 w-9 rounded-lg bg-gray-200" />
                    </div>
                  </div>
                ))
              ) : apiData.length > 0 ? (
                apiData.map((item) => (
                  <LeadMobileCard
                    key={item._id}
                    item={item}
                    selectedLeads={selectedLeads}
                    handleSelectLead={handleSelectLead}
                    showActions={showActions}
                    canViewLead={canViewLead}
                    canEditLead={canEditLead}
                    canDeleteLead={canDeleteLead}
                    handleDelete={handleDelete}
                    search={search}
                    filters={filters}
                  />
                ))
              ) : (
                <NoDataFound
                  title="No Leads Found"
                  description="Try searching different keywords"
                />
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block h-full overflow-auto">
              <table className="w-max min-w-full">
                <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                  <tr>
                    <th className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={
                          apiData.length > 0 &&
                          apiData.every((item) =>
                            selectedLeads.includes(item._id),
                          )
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
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
                    {/* <th className="p-3 text-left">Team Code</th> */}
                    <th className="p-3 text-left">Lead Source</th>
                    <th className="p-3 text-left">workLogs</th>
                    {/* <th className="p-3 text-left">Transfer History</th> */}
                    <th className="p-3 text-left">Assignee</th>
                    {showActions && (
                      <th className="sticky right-0 bg-gray-100 p-3 text-center">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                {isLoading ? (
                  <TableSkeleton rows={20} columns={20} />
                ) : (
                  <tbody>
                    {apiData.length > 0 ? (
                      apiData.map((item) => (
                        <tr
                          key={item._id}
                          className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(item._id)}
                              onChange={() => handleSelectLead(item._id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 font-semibold">{item.LeadNo}</td>

                          <td className="p-3">{formatDate(item.Date)}</td>
                          <td className="p-3">{item.ClientName}</td>

                          <td className="p-3">{item.Gender}</td>

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
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.LeadStatus] ||
                                "bg-gray-100 text-gray-700"
                                }`}
                            >
                              {item.LeadStatus}
                            </span>
                          </td>

                          <td className="p-3">{item.Reason}</td>

                          <td className="p-3">{item.FieldMember}</td>

                          {/* <td className="p-3">{item.TeamCode}</td> */}

                          <td className="p-3">{item.LeadSource}</td>

                          <td className="px-2">
                            <div className="group relative cursor-pointer">
                              {/* Short Text */}
                              <div className="truncate max-w-28 text-xs">
                                {item.workLogs?.length > 0
                                  ? [...item.workLogs].sort(
                                    (a, b) =>
                                      new Date(b.createdAt) -
                                      new Date(a.createdAt),
                                  )[0]?.message
                                  : "-"}
                              </div>

                              {/* Hover Popup */}
                              <div className="absolute right-0 top-4 hidden group-hover:block bg-white border shadow-xl rounded-lg p-3 w-80 max-h-62.5 overflow-y-auto whitespace-pre-line text-xs z-50">
                                {[...(item.workLogs || [])]
                                  .sort(
                                    (a, b) =>
                                      new Date(b.createdAt) -
                                      new Date(a.createdAt),
                                  )
                                  .map((log, index) => (
                                    <div
                                      key={log._id || index}
                                      className="mb-3"
                                    >
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

                          <td className="p-3">{item.Assignee}</td>

                          {showActions && (
                            <td className="sticky right-0 z-20 bg-white p-3 shadow-md">
                              <div className="flex justify-center gap-2">
                                {canViewLead && (
                                  <Link to={`/leads/edit/${item._id}`}>
                                    <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                      <Eye size={16} />
                                    </button>
                                  </Link>
                                )}

                                {canEditLead && (
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
                                )}

                                {canDeleteLead && (
                                  <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
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
                )}
              </table>
            </div>
          </div>
          {/* PAGINATION */}

          <div className="flex flex-col gap-2 border-t border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
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

      <LeadsFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(data) => {
          setFilters({
            ...DEFAULT_LEAD_FILTERS,
            ...data,
            default: false,
            defaultFilter: false,
          });

          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
        initialFilters={filters}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />
      {showTransferModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white w-[420px] rounded-xl shadow-xl p-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-semibold">Transfer Leads</h2>

                <p className="text-sm text-gray-500">
                  {selectedLeads.length} lead
                  {selectedLeads.length > 1 ? "s" : ""} selected
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedAssignee(null);
                  setTransferComment("");
                }}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            {/* ASSIGNEE */}
            <div className="mb-4">
              <div
                className={`select-group ${selectedAssignee ? "has-value" : ""
                  }`}
              >
                <label className="select-label form-label required-label">
                  Select Assignee
                </label>

                <Select
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  options={AssigneeOptions}
                  placeholder=""
                  isClearable
                  styles={selectStyles}
                />
              </div>
            </div>

            {/* COMMENT */}
            <div className="mb-5">
              <div className="form-group">
                <textarea
                  value={transferComment}
                  onChange={(e) => setTransferComment(e.target.value)}
                  className="form-input resize-none"
                  placeholder=" "
                  rows={3}
                />

                <label className="form-label required-label">
                  Transfer Comment
                </label>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedAssignee(null);
                  setTransferComment("");
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !selectedAssignee ||
                  !transferComment.trim() ||
                  isTransferPending
                }
                onClick={handleTransfer}
                className="theme-btn text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {isTransferPending ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadsList;