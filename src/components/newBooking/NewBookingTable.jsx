import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useCancelNewBooking, useClientFromNewBooking, useDeleteNewBookingData, useNewBooking, useToggleClientLogin, useUpdateNewBooking, useUpdateNewBookingForBooked } from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import ConfirmModal from "../common/ConfirmModal";
import TableSkeleton from "../../components/common/TableSkelton";
import NewBookingFilter from "./NewBookingFilter";
import useDebounce from "../hooks/useDebounce";
import { FaEllipsisV } from "react-icons/fa";
const NewBookingTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const [filterLabels, setFilterLabels] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const rowsPerPage = 10;
  const { data: newBooking, isLoading } = useNewBooking({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    ...filters,
  });
  const { mutate: toggleClientLogin, isPendingToggleClientLogin } = useToggleClientLogin();
  const { mutate: updateNewBookingForBooked, isPending } = useUpdateNewBookingForBooked();
  const { mutate: deleteNewBooking, isPending: isLoadingDelete } = useDeleteNewBookingData();
  const {
    mutate: createClientFromBooking,
    isPending: isCreateClientLoading,
  } = useClientFromNewBooking();
  const {
    mutate: cancelBooking,
    isPending: isCancelBookingLoading,
  } = useCancelNewBooking();


  // Safely get bookings data
  // Safely get bookings data
  const bookings = newBooking?.data || [];
  const totalPages = newBooking?.totalPages || 1;
  const totalRecords = newBooking?.totalRecords || 0;
  // Filter logic - fixed to include all fields properly

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);
    setResetTrigger((prev) => prev + 1);
  };
  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFilterLabels((prev) => prev.filter((item) => item.key !== key));

    setCurrentPage(1);
  }

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
  // Open Delete Confirmation Modal
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    if (!deleteId) return;

    deleteNewBooking(deleteId, {
      onSuccess: (response) => {
        toast.dismiss()
        toast.success(response?.message || "Booking deleted successfully");
        setShowDeleteModal(false);
        setDeleteId(null);
      },

      onError: (error) => {
        toast.dismiss()
        toast.error(
          error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
        );
        setShowDeleteModal(false);
        setDeleteId(null);
      },
    });
  };

  const handlePaymentVerification = (item) => {
    // Verify karna hai
    if (!item.loginEnabled) {
      if (item.status !== "Booked") {
        toast.dismiss();
        toast.error("Booking must be marked as 'Booked'.");
        return;
      }

      createClientFromBooking(
        { bookingId: item._id },
        {
          onSuccess: (response) => {
            toast.dismiss();
            toast.success(
              response?.message ||
              response?.data?.message ||
              "Client created successfully"
            );
          },
          onError: (error) => {
            toast.dismiss();
            toast.error(
              error?.response?.data?.message ||
              "Failed to create client"
            );
          },
        }
      );
    }

    // Unverify karna hai
    else {
      cancelBooking(item._id, {
        onSuccess: (response) => {
          toast.dismiss();
          toast.success(
            response?.message ||
            response?.data?.message ||
            "Booking cancelled successfully"
          );
        },
        onError: (error) => {
          toast.dismiss();
          toast.error(
            error?.response?.data?.message ||
            "Failed to cancel booking"
          );
        },
      });
    }
  };

  const handleStatusToggle = (item) => {
    updateNewBookingForBooked(
      {
        id: item._id,
        data: {
          status: item.status === "Booked" ? "Not Booked" : "Booked",
        },
      },
      {
        onSuccess: (response) => {
          toast.dismiss()
          toast.success(
            response?.message ||
            response?.data?.message ||
            "Status updated successfully"
          );
        },
        onError: (error) => {
          toast.dismiss()
          toast.error(
            error?.response?.data?.message ||
            "Failed to update status"
          );
        },
      }
    );
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">New Bookings</h1>
              <p className="text-sm text-gray-500">
                Manage all client bookings
              </p>
            </div>

            <Link to="/new-bookings/create">
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
            {/* filter chips */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm hover:border-slate-300"
                >
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    {filter.title}
                  </span>

                  <span className="text-sm font-medium text-slate-800">
                    {filter.value}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
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
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Calling No</th>
                    <th className="p-3 text-center">Whatsapp No</th>
                    <th className="p-3 text-center">P.Property</th>
                    <th className="p-3 text-center">Location</th>
                    <th className="p-3 text-center">P.Bed</th>
                    <th className="p-3 text-center">P.Room</th>
                    <th className="p-3 text-center">Client DOJ</th>
                    <th className="p-3 text-center">Booking Amt Received</th>
                    <th className="p-3 text-center">Monthly Rent</th>
                    <th className="p-3 text-center">Deposit</th>

                    <th className="p-3 text-center">Proc. Fee</th>
                    <th className="p-3 text-center">T.Property</th>
                    <th className="p-3 text-center">T.Bed</th>
                    <th className="p-3 text-center">T.DOJ</th>
                    <th className="p-3 text-center">Total Amt</th>
                    <th className="p-3 text-center">Booking Amt</th>
                    <th className="p-3 text-center">Balance Amt</th>


                    {/* Sticky Header */}
                    <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-37.5 shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {bookings?.length > 0 ? (
                    bookings.map((item, index) => {

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

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={item.status === "Booked"}
                                  onChange={() => handleStatusToggle(item)}
                                />
                                <div className="w-11 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors">
                                  <div
                                    className={`h-4 w-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${item.status === "Booked"
                                      ? "translate-x-5"
                                      : "translate-x-0.5"
                                      }`}
                                  />
                                </div>
                              </label>

                              <span
                                className={`text-sm font-medium ${item.status === "Booked"
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
                            {item.propertyId?.propertyLocation ||
                              "-"}
                          </td>

                          <td className="p-3">
                            {item.bedId?.bedNo || "-"}
                          </td>
                          <td className="p-3">
                            {item.bedId?.roomNo || "-"}
                          </td>

                          <td className="p-3">
                            {item.clientDoj
                              ? formatDate(
                                item.clientDoj
                              )
                              : "-"}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={item.loginEnabled}
                                  onChange={() => handlePaymentVerification(item)}
                                  disabled={isPending}
                                />

                                <div className="w-11 h-5 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>

                                <div className="absolute left-0.5 top-0.5 w-5 h-4 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5"></div>
                              </label>

                              <span
                                className={`text-sm font-semibold ${item.loginEnabled
                                  ? "text-green-600"
                                  : "text-red-600"
                                  }`}
                              >
                                {item.loginEnabled ? "Received" : "Pending"}
                              </span>
                            </div>
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
                            {item.totalAmount?.toLocaleString(
                              "en-IN"
                            ) || 0}
                          </td>

                          <td className="p-3 text-green-600 font-medium">
                            ₹
                            {item.bookingAmount?.toLocaleString(
                              "en-IN"
                            ) || 0}
                          </td>

                          <td className="p-3 text-red-600 font-medium">
                            ₹
                            {item.balanceAmount?.toLocaleString(
                              "en-IN"
                            ) || 0}
                          </td>


                          {/* Sticky Actions Column */}
                          <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-center relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === item._id ? null : item._id,
                                  );
                                }}
                                className={`p-2 rounded-md transition-colors ${openMenuId === item._id
                                    ? "bg-blue-100 text-blue-600"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                  }`}
                              >
                                <FaEllipsisV />
                              </button>

                              {openMenuId === item._id && (
                                <div
                                  className="absolute right-22 top-8 w-44 bg-white border border-gray-300 rounded-lg shadow-xl z-[9999]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Link
                                    to={`/new-bookings/view/${item._id}`}
                                    className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 hover:bg-gray-100"
                                  >
                                    <span>👁</span>
                                    <span>View</span>
                                  </Link>

                                  <Link
                                    to={`/new-bookings/edit/${item._id}`}
                                    className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 hover:bg-gray-100"
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </Link>

                                  <button
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      handleDelete(item._id);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-red-600"
                                  >
                                    <span>🗑</span>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
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
          {bookings.length > 0 && (
            <div className="border-t p-3 flex justify-between items-center bg-white">
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
          )}
        </div>
      </div>


      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Booking"
        message="Are you sure you want to delete this booking?"
        loading={isLoadingDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />
      <NewBookingFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={bookings}
        onApply={(data, labels) => {
          setFilters(data);
          setFilterLabels(labels);
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />  
    </>
  );
};

export default NewBookingTable;  