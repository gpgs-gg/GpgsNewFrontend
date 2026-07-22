import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import {
  useAvailableBedsData,
  useCancelNewBooking,
  useClientFromNewBooking,
} from "./services";
import TableSkeleton from "../../components/common/TableSkelton";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import AvailableBedsFilter from "./AvailableBedsFilter";
const AvailableBedsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterLabels, setFilterLabels] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const debouncedSearch = useDebounce(search);
  const rowsPerPage = 10;
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

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters]);

  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);
    setResetTrigger((prev) => prev + 1);
  };
  // remove filter chips
  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFilterLabels((prev) => prev.filter((item) => item.key !== key));

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
      console.log("Delete booking with id:", id);
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
  const handleApplyFilters = (filterData, labels) => {
    setFilters(filterData);
    setFilterLabels(labels);
    setCurrentPage(1);
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase ">Available Beds</h1>
              <p className="text-sm text-gray-500">
                Manage all client bookings
              </p>
            </div>

            {/* <Link to="/newbooking/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + New Booking
              </button>
            </Link> */}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* search */}
            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search booking..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {filter.title}
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {filter.value}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {/* reset */}
            <div className="flex gap-2">
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2 hover:bg-gray-50"
                >
                  Reset
                </button>
              )}
              <button
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="overflow-auto h-full">
              <table className="w-full whitespace-nowrap border-collapse">
                <thead className="sticky top-0 bg-gray-100 z-20">
                  <tr>
                    <th className="p-3 text-center whitespace-nowrap">
                      Property Code
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
                          console.log(item);
                          if (!nld) return "-";

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const nldDate = new Date(nld);
                          nldDate.setHours(0, 0, 0, 0);

                          const diffDays =
                            (nldDate - today) / (1000 * 60 * 60 * 24);

                          return diffDays <= 15 ? "Red Flag" : "-";
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

                            {/* Red Flag */}
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getRedFlagStatus(item) === "Red Flag"
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
                              {item.client?.clientVacatingDate
                                ? formatDate(item.client.clientVacatingDate)
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
            <div className="border-t p-3 flex justify-between items-center bg-white">
              <span className="text-sm text-gray-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} -
                {Math.min(currentPage * rowsPerPage, totalRecords)} of
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
        onApply={handleApplyFilters}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
    </>
  );
};

export default AvailableBedsTable;