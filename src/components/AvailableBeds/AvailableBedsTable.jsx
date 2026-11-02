import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../common/Pagination";
import NoDataFound from "../common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import {
  useAvailableBedsData,
  useCancelNewBooking,
  useClientFromNewBooking,
} from "./services";
import TableSkeleton from "../common/TableSkelton";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import AvailableBedsFilter from "./AvailableBedsFilter";
import AvailableBedsMobileCard from "./AvailableBedsMobileCard";
const AvailableBedsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("available_beds_page");

    return savedPage ? Number(savedPage) : 1;
  });
  useEffect(() => {
    localStorage.setItem("available_beds_page", String(currentPage));
  }, [currentPage]);

  const [filterOpen, setFilterOpen] = useState(false);

  const DEFAULT_AVAILABLE_BEDS_FILTERS = {
    propertyId: "",
    propertyCode: "",
    propertyLocation: [],
    roomNo: "",
    bedNo: "",
    sharingType: [],
    acRoom: "",
    bathAttached: "",
    availableFrom: "",
    redFlag: "",
    monthlyRentMin: "",
    monthlyRentMax: "",
    depositAmountMin: "",
    depositAmountMax: "",
    clientName: "",
    hasCvd: false,
    sortByRent: false,
    gender: "",
  };

  const { filters, setFilters, removeFilter, resetFilters } =
    usePersistedFilters(
      "available_beds_filters",
      DEFAULT_AVAILABLE_BEDS_FILTERS,
    );

  const [resetTrigger, setResetTrigger] = useState(0);
  const debouncedSearch = useDebounce(search);
  const rowsPerPage = 20;
  const { data: getAvailableBeds, isPending: isAvailableBeds } =
    useAvailableBedsData({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch,
      filters,
    });
  const apiData = getAvailableBeds?.data || [];
  const { mutate: createClientFromBooking, isPending: isCreateClientLoading } =
    useClientFromNewBooking();
  const { mutate: cancelBooking, isPending: isCancelBookingLoading } =
    useCancelNewBooking();

  // Safely get bookings data
  const bookings = getAvailableBeds?.data || [];
  const paginatedData = getAvailableBeds?.data || [];

  const totalPages = getAvailableBeds?.totalPages || 1;

  const totalRecords = getAvailableBeds?.totalRecords || 0;
  const totalCount = getAvailableBeds?.totalRecords || 0;
  const IACount = getAvailableBeds?.IACount || 0;
  const redFlag = getAvailableBeds?.redFlag || 0;

  const handleReset = () => {
    resetFilters();

    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };

  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.propertyId) {
      labels.push({
        key: "propertyId",
        title: "Property",
        value: filters.propertyCode || filters.propertyId,
      });
    }

    if (filters.propertyLocation?.length > 0) {
      labels.push({
        key: "propertyLocation",
        title: "Location",
        value: filters.propertyLocation.join(", "),
      });
    }

    if (filters.gender) {
      labels.push({
        key: "gender",
        title: "Gender",
        value: filters.gender,
      });
    }
    if (filters.hasCvd) {
      labels.push({
        key: "hasCvd",
        title: "CVD",
        value: "Yes",
      });
    }

    if (filters.sortByRent) {
      labels.push({
        key: "sortByRent",
        title: "Rent",
        value: "Low → High",
      });
    }

    if (filters.roomNo) {
      labels.push({
        key: "roomNo",
        title: "Room",
        value: filters.roomNo,
      });
    }

    if (filters.bedNo) {
      labels.push({
        key: "bedNo",
        title: "Bed",
        value: filters.bedNo,
      });
    }

    if (filters.sharingType?.length > 0) {
      labels.push({
        key: "sharingType",
        title: "Sharing",
        value: filters.sharingType.join(", "),
      });
    }

    if (filters.acRoom) {
      labels.push({
        key: "acRoom",
        title: "AC",
        value: filters.acRoom,
      });
    }

    if (filters.bathAttached) {
      labels.push({
        key: "bathAttached",
        title: "Bath",
        value: filters.bathAttached,
      });
    }

    if (filters.availableFrom) {
      labels.push({
        key: "availableFrom",
        title: "Available",
        value: filters.availableFrom,
      });
    }

    if (filters.redFlag) {
      labels.push({
        key: "redFlag",
        title: "Red Flag",
        value: filters.redFlag === "Yes" ? "Yes" : "No",
      });
    }

    if (filters.monthlyRentMin) {
      labels.push({
        key: "monthlyRentMin",
        title: "Rent ≥",
        value: filters.monthlyRentMin,
      });
    }

    if (filters.monthlyRentMax) {
      labels.push({
        key: "monthlyRentMax",
        title: "Rent ≤",
        value: filters.monthlyRentMax,
      });
    }

    if (filters.depositAmountMin) {
      labels.push({
        key: "depositAmountMin",
        title: "Deposit ≥",
        value: filters.depositAmountMin,
      });
    }

    if (filters.depositAmountMax) {
      labels.push({
        key: "depositAmountMax",
        title: "Deposit ≤",
        value: filters.depositAmountMax,
      });
    }

    if (filters.clientName) {
      labels.push({
        key: "clientName",
        title: "Client",
        value: filters.clientName,
      });
    }

    return labels;
  }, [filters]);
  const handleRemoveFilter = (key) => {
    removeFilter(key);
    setCurrentPage(1);
  };
  // Get status color - fixed for all statuses
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700";

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-red-100 text-red-700";
      case "booked":
        return "bg-blue-100 text-blue-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get booking type color
  const getBookingTypeColor = (type) => {
    if (!type) return "bg-gray-100 text-gray-700";
    return type.toLowerCase() === "permanent"
      ? "bg-purple-100 text-purple-700"
      : "bg-orange-100 text-orange-700";
  };

  // Handle delete function
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      // Add your delete API call here
      // Example: await deleteBooking(id);
    }
  };
  const handleStatusToggle = (item) => {
    if (item.status !== "Booked") {
      createClientFromBooking(
        { bookingId: item._id },
        {
          onSuccess: (response) => {
            toast.dismiss();
            toast.success(
              response?.message || response?.data?.message || "Success",
            );
          },
          onError: (error) => {
            toast.dismiss();
            toast.error(error?.response?.data?.message);
          },
        },
      );
    } else {
      cancelBooking(item._id, {
        onSuccess: (response) => {
          toast.success(
            response?.message ||
              response?.data?.message ||
              "Booking cancelled successfully",
          );
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message);
        },
      });
    }
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex  gap-3 md:flex-row md:justify-between md:items-center">
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase">
                Available Beds
              </h1>
              <p className="text-sm text-gray-500">
                Manage all client bookings
              </p>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:flex lg:items-center">
              <span className="text-xs sm:text-sm font-semibold text-green-600 whitespace-nowrap">
                IA: {IACount}
              </span>

              <span className="text-xs sm:text-sm font-semibold text-red-600 whitespace-nowrap">
                RF: {redFlag}
              </span>

              <span className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
                Total: {totalCount}
              </span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH, FILTER CHIPS AND FILTER BUTTONS */}
          <div className="border-b border-gray-200 px-3 py-3">
            <div className="flex  flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
              {/* SEARCH */}
              <div className="relative w-full lg:w-80 lg:shrink-0">
                <input
                  className="border px-3 py-2 pr-10 rounded-lg w-full"
                  placeholder="Search booking..."
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
                <div className="w-full min-w-0 lg:flex-1">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                    {filterLabels.map((filter) => (
                      <div
                        key={filter.key}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs shadow-sm"
                      >
                        <span className="font-semibold text-slate-500">
                          {filter.title}:
                        </span>

                        <span className="max-w-28 truncate font-medium text-slate-800">
                          {filter.value}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(filter.key)}
                          className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                          aria-label={`Remove ${filter.title} filter`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESET AND FILTER BUTTONS */}
              <div className="flex w-full items-center gap-2 lg:ml-auto lg:w-auto lg:shrink-0">
                {filterLabels.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 lg:flex-none"
                  >
                    Reset
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:flex-none"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Filter size={16} />
                    Filters
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {/* MOBILE CARD VIEW */}
            <div className="h-full overflow-y-auto space-y-3 p-3 md:hidden">
              {isAvailableBeds ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-3 h-5 w-2/3 rounded bg-gray-200" />
                    <div className="mb-3 h-16 rounded-lg bg-gray-100" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 rounded bg-gray-100" />
                      <div className="h-10 rounded bg-gray-100" />
                    </div>
                    <div className="mt-3 h-16 rounded bg-gray-100" />
                  </div>
                ))
              ) : paginatedData?.length > 0 ? (
                paginatedData.map((item) => (
                  <AvailableBedsMobileCard key={item._id} item={item} />
                ))
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white py-10">
                  <NoDataFound
                    title="No Beds Found"
                    description="No records available"
                  />
                </div>
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden h-full overflow-auto md:block">
              <table className="w-full whitespace-nowrap border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-20">
                  <tr>
                    <th className="p-3 text-center whitespace-nowrap">
                      Property Code
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Gender
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Red Flag
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Sharing
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      AC Room
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Available From
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">CVD</th>

                    <th className="p-3 text-center whitespace-nowrap">NLD</th>

                    <th className="p-3 text-center whitespace-nowrap">NSD</th>

                    <th className="p-3 text-center whitespace-nowrap">MFR</th>

                    <th className="p-3 text-center whitespace-nowrap">DA</th>

                    <th className="p-3 text-center whitespace-nowrap">URHD</th>

                    <th className="p-3 text-center whitespace-nowrap">URHA</th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Bath Attached
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Bed No
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Room No
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Existing Client Name
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Rent DOJ
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Location
                    </th>
                    {/* 
                    <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-[120px] shadow-[-4px_0_6px_rgba(0,0,0,0.1)] whitespace-nowrap">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                {isAvailableBeds ? (
                  <TableSkeleton rows={20} columns={17} />
                ) : (
                  <tbody>
                    {paginatedData?.length > 0 ? (
                      paginatedData.map((item, index) => {
                        const getRedFlagStatus = (item) => {
                          const nld = item?.client?.noticeLastDate;
                          // NLD nahi hai => Red Flag
                          if (!nld) {
                            return "Red Flag";
                          }
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const nldDate = new Date(nld);
                          nldDate.setHours(0, 0, 0, 0);
                          const diffDays =
                            (nldDate - today) / (1000 * 60 * 60 * 24);
                          // NLD 15 days ke andar hai ya date cross ho chuki hai
                          if (diffDays <= 15) {
                            return "Red Flag";
                          }
                          return "-";
                        };
                        const getBedAvailableFrom = (item) => {
                          const cvd = item?.client?.clientVacatingDate;

                          // No CVD
                          if (!cvd) {
                            return "Immediate Available";
                          }

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const cvdDate = new Date(cvd);
                          cvdDate.setHours(0, 0, 0, 0);

                          // CVD today or past
                          if (cvdDate <= today) {
                            return "Immediate Available";
                          }

                          // Future CVD
                          return "CVD";
                        };
                        return (
                          <tr
                            key={item._id}
                            className="border-t border-gray-300 hover:bg-gray-50"
                          >
                            {/* Property Code */}
                            <td className="p-3 text-center">
                              {item.propertyId?.propertyCode || "-"}
                            </td>
                            <td className="p-3 text-center">
                              {item.gender || "-"}
                            </td>

                            {/* Red Flag */}
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  getRedFlagStatus(item) === "Red Flag"
                                    ? "bg-red-100 text-red-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {getRedFlagStatus(item)}
                              </span>
                            </td>

                            {/* Sharing */}
                            <td className="p-3 text-center">
                              {item.sharingType || "-"}
                            </td>

                            {/* AC Room */}
                            <td className="p-3 text-center">
                              {item.acRoom || "-"}
                            </td>

                            {/* Available From */}
                            <td className="p-3 text-center">
                              {getBedAvailableFrom(item)}
                            </td>

                            {/* CVD */}
                            <td className="p-3 text-center">
                              {item.client?.clientVacatingDate
                                ? formatDate(item.client.clientVacatingDate)
                                : "-"}
                            </td>

                            {/* NLD */}
                            <td className="p-3 text-center">
                              {item.client?.noticeLastDate
                                ? formatDate(item.client.noticeLastDate)
                                : "-"}
                            </td>

                            {/* NSD */}
                            <td className="p-3 text-center">
                              {item.client?.noticeStartDate
                                ? formatDate(item.client.noticeStartDate)
                                : "-"}
                            </td>

                            {/* MFR */}
                            <td className="p-3 text-center">
                              ₹{(item.monthlyRent || 0).toLocaleString("en-IN")}
                            </td>

                            {/* DA */}
                            <td className="p-3 text-center">
                              ₹
                              {(item.depositAmount || 0).toLocaleString(
                                "en-IN",
                              )}
                            </td>

                            {/* URHD */}
                            <td className="p-3 text-center">
                              {item.upcomingRentHikeDate
                                ? formatDate(item.upcomingRentHikeDate)
                                : "-"}
                            </td>

                            {/* URHA */}
                            <td className="p-3 text-center">
                              ₹
                              {(
                                item.upcomingRentHikeAmount || 0
                              ).toLocaleString("en-IN")}
                            </td>

                            {/* Bath Attached */}
                            <td className="p-3 text-center">
                              {item.bathAttached || "-"}
                            </td>

                            {/* Bed No */}
                            <td className="p-3 text-center">
                              {item.bedNo || "-"}
                            </td>

                            {/* Room No */}
                            <td className="p-3 text-center">
                              {item.roomNo || "-"}
                            </td>
                            <td className="p-3 text-center">
                              {item.client?.fullName || "-"}
                            </td>

                            {/* Rent DOJ */}
                            <td className="p-3 text-center">
                              {item.client?.clientDoj
                                ? formatDate(item.client.clientDoj)
                                : "-"}
                            </td>
                            <td className="p-3 text-center">
                              {item.propertyId?.propertyLocation || "-"}
                            </td>
                            {/* Sticky Actions
                          <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-center gap-2">
                              <Link
                                to={`/clients/view/${item.client?._id}`}
                              >
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye size={16} />
                                </button>
                              </Link>

                              <Link
                                to={`/clients/edit/${item.client?._id}`}
                              >
                                <button className="text-yellow-600 hover:text-yellow-800">
                                  <Pencil size={16} />
                                </button>
                              </Link>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    item.client?._id
                                  )
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td> */}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={17}>
                          <NoDataFound
                            title="No Beds Found"
                            description="No records available"
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
          {totalRecords > 0 && (
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
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <AvailableBedsFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        initialFilters={filters}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
    </>
  );
};

export default AvailableBedsTable;