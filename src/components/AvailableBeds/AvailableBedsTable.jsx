import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useAvailableBedsData, useCancelNewBooking, useClientFromNewBooking } from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";

const AvailableBedsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const rowsPerPage = 10;
  const { data: getAvailableBeds, isPending: isAvailableBeds } = useAvailableBedsData();
  const {
    mutate: createClientFromBooking,
    isPending: isCreateClientLoading,
  } = useClientFromNewBooking();
  const {
    mutate: cancelBooking,
    isPending: isCancelBookingLoading,
  } = useCancelNewBooking();

  // Safely get bookings data
  const bookings = getAvailableBeds?.data || [];

  // Filter logic - fixed to include all fields properly
  const filteredData = useMemo(() => {
    if (!bookings.length) return [];

    return bookings.filter((item) => {
      // Search matches across multiple fields
      const matchesSearch = !search ||
        (item.fullName && item.fullName.toLowerCase().includes(search.toLowerCase())) ||
        (item.callingNo && item.callingNo.toLowerCase().includes(search.toLowerCase())) ||
        (item.propertyId?.propertyCode && item.propertyId.propertyCode.toLowerCase().includes(search.toLowerCase())) ||
        (item.bedId?.bedNo && item.bedId.bedNo.toLowerCase().includes(search.toLowerCase())) ||
        (item.monthlyRent && item.monthlyRent.toString().includes(search)) ||
        (item.status && item.status.toLowerCase().includes(search.toLowerCase())) ||
        (item.temporaryPropertyId?.propertyCode && item.temporaryPropertyId.propertyCode.toLowerCase().includes(search.toLowerCase())) ||
        (item.temporaryBedId?.bedNo && item.temporaryBedId.bedNo.toLowerCase().includes(search.toLowerCase()));

      // Apply filters
      const matchesBookingType = !filters.bookingType || item.bookingType === filters.bookingType;
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesPropertyCode = !filters.propertyCode ||
        (item.propertyId?.propertyCode && item.propertyId.propertyCode === filters.propertyCode);

      return matchesSearch && matchesBookingType && matchesStatus && matchesPropertyCode;
    });
  }, [bookings, filters, search]);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleReset = () => {
    setFilters({});
    setSearch("");
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
            toast.dismiss()
            toast.success(
              response?.message ||
              response?.data?.message ||
              "Success"
            );
          },
          onError: (error) => {
            toast.dismiss()
            toast.error(
              error?.response?.data?.message
            );
          },
        }
      );
    } else {
      cancelBooking(item._id, {
        onSuccess: (response) => {
          toast.success(
            response?.message ||
            response?.data?.message ||
            "Booking cancelled successfully"
          );
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message
          );
        },
      });
    }
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">New Bookings</h1>
              <p className="text-sm text-gray-500">
                Manage all client bookings
              </p>
            </div>

            <Link to="/newbooking/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + New Booking
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

                    <th className="p-3 text-center whitespace-nowrap">
                      CVD
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      NLD
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      NSD
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      MFR
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      DA
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      URHD
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      URHA
                    </th>

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
                    {/* 
                    <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-[120px] shadow-[-4px_0_6px_rgba(0,0,0,0.1)] whitespace-nowrap">
                      Actions
                    </th> */}
                  </tr>
                </thead>

                <tbody>
                  {paginatedData?.length > 0 ? (
                    paginatedData.map((item, index) => {

                      const getRedFlagStatus = (item) => {
                        const nld = item?.client?.noticeLastDate;
                        console.log(item)
                        if (!nld) return "-";

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const nldDate = new Date(nld);
                        nldDate.setHours(0, 0, 0, 0);

                        const diffDays =
                          (nldDate - today) /
                          (1000 * 60 * 60 * 24);

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
                            {item.propertyId
                              ?.propertyCode || "-"}
                          </td>

                          {/* Red Flag */}
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getRedFlagStatus(item) ===
                                "Red Flag"
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
                            {item.client
                              ?.clientVacatingDate
                              ? formatDate(
                                item.client
                                  .clientVacatingDate
                              )
                              : "-"}
                          </td>

                          {/* NLD */}
                          <td className="p-3 text-center">
                            {item.client
                              ?.clientVacatingDate
                              ? formatDate(
                                item.client
                                  .clientVacatingDate
                              )
                              : "-"}
                          </td>

                          {/* NSD */}
                          <td className="p-3 text-center">
                            {item.client?.noticeStartDate
                              ? formatDate(
                                item.client
                                  .noticeStartDate
                              )
                              : "-"}
                          </td>

                          {/* MFR */}
                          <td className="p-3 text-center">
                            ₹
                            {(
                              item.monthlyRent || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          {/* DA */}
                          <td className="p-3 text-center">
                            ₹
                            {(
                              item.depositAmount || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          {/* URHD */}
                          <td className="p-3 text-center">
                            {item.upcomingRentHikeDate
                              ? formatDate(
                                item.upcomingRentHikeDate
                              )
                              : "-"}
                          </td>

                          {/* URHA */}
                          <td className="p-3 text-center">
                            ₹
                            {(
                              item.upcomingRentHikeAmount ||
                              0
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
                            {item.client?.rentStartDate
                              ? formatDate(
                                item.client.rentStartDate
                              )
                              : "-"}
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
              </table>
            </div>
          </div>

          {/* PAGINATION */}
          {filteredData.length > 0 && (
            <div className="border-t p-3 flex justify-between items-center bg-white">
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
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Filters</h2>
              <button
                onClick={() => setFilterOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Type
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.bookingType || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      bookingType: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">All Types</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.status || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      status: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Booked">Booked</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Code
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.propertyCode || ""}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      propertyCode: e.target.value || undefined,
                    })
                  }
                >
                  <option value="">All Properties</option>
                  {bookings && bookings.length > 0 &&
                    [...new Set(bookings.map(b => b.propertyId?.propertyCode).filter(Boolean))].map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setFilters({});
                  setFilterOpen(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailableBedsTable;  