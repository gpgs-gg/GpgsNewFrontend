import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useCancelNewBooking, useClientFromNewBooking, useNewBooking } from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";

const NewBookingTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const rowsPerPage = 10;
  const { data: newBooking, isPending: isNewBooking } = useNewBooking();
 const {
  mutate: createClientFromBooking,
  isPending: isCreateClientLoading,
} = useClientFromNewBooking();
const {
  mutate: cancelBooking,
  isPending: isCancelBookingLoading,
} = useCancelNewBooking();

  // Safely get bookings data
  const bookings = newBooking?.data || [];

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
          <th className="p-3 text-center">Sr No.</th>
          <th className="p-3 text-center">Client Name</th>
          <th className="p-3 text-center">Calling No</th>
          <th className="p-3 text-center">Whatsapp No</th>

          <th className="p-3 text-center">Perm Property</th>
          <th className="p-3 text-center">Perm Bed</th>
          <th className="p-3 text-center">Client DOJ</th>

          <th className="p-3 text-center">Monthly Rent</th>

          <th className="p-3 text-center">Deposit</th>

          <th className="p-3 text-center">Proc. Fee</th>

          <th className="p-3 text-center">Temp Property</th>

          <th className="p-3 text-center">Temp Bed</th>

          <th className="p-3 text-center">Temp DOJ</th>

          <th className="p-3 text-center">Total Amt</th>

          <th className="p-3 text-center">Booking Amt</th>

          <th className="p-3 text-center">Balance Amt</th>

          <th className="p-3 text-center">Status</th>
              
          {/* Sticky Header */}
          <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-37.5 shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {paginatedData?.length > 0 ? (
          paginatedData.map((item, index) => {
            const totalAmount =
              (item.monthlyRent || 0) +
              (item.depositAmount || 0) +
              (item.processingFees || 0) +
              (item.parkingCharges || 0);

            const bookingAmount = item.monthlyRent || 0;

            const balanceAmount =
              totalAmount - bookingAmount;

            return (
              <tr
                key={item._id}
                className="border-t border-gray-300 hover:bg-gray-50"
              >
                <td className="p-3 font-medium">
                  {(currentPage - 1) *
                    rowsPerPage +
                    index +
                    1}
                </td>

                <td className="p-3">
                  {item.fullName || "-"}
                </td>

                <td className="p-3">
                  {item.callingNo || "-"}
                </td>

                <td className="p-3">
                  {item.whatsappNo || "-"}
                </td>

                <td className="p-3">
                  {item.propertyId?.propertyCode ||
                    "-"}
                </td>

                <td className="p-3">
                  {item.bedId?.bedNo || "-"}
                </td>

                <td className="p-3">
                  {item.clientDoj
                    ? formatDate(
                        item.clientDoj
                      )
                    : "-"}
                </td>

                <td className="p-3">
                  ₹
                  {(
                    item.monthlyRent || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="p-3">
                  ₹
                  {(
                    item.depositAmount || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="p-3">
                  ₹
                  {(
                    item.processingFees || 0
                  ).toLocaleString("en-IN")}
                </td>

                <td className="p-3">
                  {item
                    .temporaryPropertyId
                    ?.propertyCode || "-"}
                </td>

                <td className="p-3">
                  {item.temporaryBedId?.bedNo ||
                    "-"}
                </td>

                <td className="p-3">
                  {item.temporaryClientDoj
                    ? formatDate(
                        item.temporaryClientDoj
                      )
                    : "-"}
                </td>

                <td className="p-3 font-medium">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="p-3 text-green-600 font-medium">
                  ₹
                  {bookingAmount.toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="p-3 text-red-600 font-medium">
                  ₹
                  {balanceAmount.toLocaleString(
                    "en-IN"
                  )}
                </td>

           <td className="p-3 text-center">
  <div className="flex items-center justify-center gap-2">
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={item.status === "Booked"}
        onChange={() => handleStatusToggle(item)}
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors">
        <div
          className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${
            item.status === "Booked"
              ? "translate-x-5"
              : "translate-x-0.5"
          }`}
        />
      </div>
    </label>

    <span
      className={`text-sm font-medium ${
        item.status === "Booked"
          ? "text-green-600"
          : "text-red-600"
      }`}
    >
      {item.status === "Booked"
        ? "Booked"
        : "Not Booked"}
    </span>
  </div>
</td>

                {/* Sticky Actions Column */}
                <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-center gap-2">
                    <Link
                      to={`/new-booking/view/${item._id}`}
                    >
                      <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                        <Eye size={16} />
                      </button>
                    </Link>

                    <Link
                      to={`/new-booking/edit/${item._id}`}
                    >
                      <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                        <Pencil size={16} />
                      </button>
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(item._id)
                      }
                      className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={18}>
              <NoDataFound
                title="No Bookings Found"
                description="No booking records available"
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

export default NewBookingTable;  