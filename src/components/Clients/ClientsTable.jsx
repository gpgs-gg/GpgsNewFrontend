import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { useCancelNewBooking, useClientFromNewBooking, useClients } from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import { FaEllipsisV } from "react-icons/fa";
import BedShiftModal from "./BedShiftModal";
import BedHistoryModal from "./BedHistoryModal";

const ClientsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showBedShiftModal, setShowBedShiftModal] = useState(false);
  const [showBedHistoryModal, setShowBedHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState();
  const rowsPerPage = 10;
  const { data: clients, isPending: isClients } = useClients();
  const {
    mutate: createClientFromBooking,
    isPending: isCreateClientLoading,
  } = useClientFromNewBooking();


  const {
    mutate: cancelBooking,
    isPending: isCancelBookingLoading,
  } = useCancelNewBooking();

  // Safely get bookings data
  const bookings = clients?.data || [];

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

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener(
      "click",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, []);
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Clients Master</h1>
              <p className="text-sm text-gray-500">
                Manage all clients
              </p>
            </div>

            <Link to="/newbooking/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Create Clients
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
                      Sr No.
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Client Name
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Contact No
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Property
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Room No
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Bed No
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Rent Start Date
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Monthly Rent
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Deposit
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Parking Charges
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      NSD
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      NLD
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      CVD
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Total Amount
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Advance Amount
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Balance Amount
                    </th>

                    {/* Sticky Header */}
                    <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-[120px] shadow-[-4px_0_6px_rgba(0,0,0,0.1)] whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData?.length > 0 ? (
                    paginatedData.map((item, index) => {
                      const totalAmount =
                        (item?.bedId?.monthlyRent || 0) +
                        (item?.bedId?.depositAmount || 0) +
                        (item?.processingFees || 0) +
                        (item?.parkingCharges || 0);

                      const bookingAmount =
                        item?.advanceAmount || 0;

                      const balanceAmount =
                        totalAmount - bookingAmount;

                      const getClientStatus = (item) => {
                        const today = new Date();

                        if (item.isBookingCancelled) {
                          return {
                            text: "Cancelled",
                            className: "bg-red-100 text-red-600",
                          };
                        }

                        // Vacated highest priority
                        if (item.clientVacatingDate) {
                          const vacatedDate = new Date(
                            item.clientVacatingDate
                          );

                          if (vacatedDate <= today) {
                            return {
                              text: "Vacated",
                              className: "bg-gray-200 text-gray-700",
                            };
                          }
                        }

                        // Temporary
                        if (item.stayType === "T. Booked") {
                          return {
                            text: "T. Booked",
                            className: "bg-yellow-200 text-yellow-700",
                          };
                        }

                        // Permanent Notice
                        if (
                          item.stayType === "P. Booked" &&
                          item.noticeStartDate
                        ) {
                          return {
                            text: "Notice",
                            className: "bg-orange-200 text-orange-700",
                          };
                        }

                        return {
                          text: "P. Booked",
                          className: "bg-green-100 text-green-600",
                        };
                      };
                      return (
                        <tr
                          key={item._id}
                          className="border-t border-gray-300 hover:bg-gray-50"
                        >
                          {/* Sr No */}
                          <td className="p-3 font-medium">
                            {(currentPage - 1) * rowsPerPage +
                              index +
                              1}
                          </td>

                          {/* Client Name */}
                          <td className="p-3">
                            {item.fullName || "-"}
                          </td>
                          {/* Status */}
                          <td className="p-3 text-center">
                            {(() => {
                              const status = getClientStatus(item);

                              return (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                                >
                                  {status.text}
                                </span>
                              );
                            })()}
                          </td>
                          {/* Contact No */}
                          <td className="p-3 whitespace-nowrap">
                            {item.callingNo ===
                              item.whatsappNo ? (
                              item.callingNo || "-"
                            ) : (
                              <>
                                {item.callingNo}
                                <br />
                                {item.whatsappNo}
                              </>
                            )}
                          </td>

                          {/* Property */}
                          <td className="p-3">
                            {item.propertyId
                              ?.propertyCode || "-"}
                          </td>

                          {/* Room No */}
                          <td className="p-3">
                            {item.bedId?.roomNo || "-"}
                          </td>

                          {/* Bed No */}
                          <td className="p-3">
                            {item.bedId?.bedNo || "-"}
                          </td>

                          {/* Rent Start Date */}
                          <td className="p-3">
                            {item.rentStartDate
                              ? formatDate(
                                item.rentStartDate
                              )
                              : "-"}
                          </td>

                          {/* Monthly Rent */}
                          <td className="p-3">
                            ₹
                            {(
                              item?.bedId
                                ?.monthlyRent || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          {/* Deposit */}
                          <td className="p-3">
                            ₹
                            {(
                              item?.bedId
                                ?.depositAmount || 0
                            ).toLocaleString("en-IN")}
                          </td>

                          {/* Parking Charges */}
                          <td className="p-3">
                            ₹
                            {(
                              item?.parkingCharges || 0
                            ).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3">
                            {formatDate(item.noticeStartDate) || "-"}
                          </td>
                          <td className="p-3">
                            {formatDate(item.noticeLastDate) || "-"}
                          </td>
                          <td className="p-3">
                            {formatDate(item.ClientVactingDate) || "-"}
                          </td>
                          {/* Total Amount */}
                          <td className="p-3 font-medium">
                            ₹
                            {totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* Advance Amount */}
                          <td className="p-3 text-green-600 font-medium">
                            ₹
                            {bookingAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          {/* Balance Amount */}
                          <td className="p-3 text-red-600 font-medium">
                            ₹
                            {balanceAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === item._id
                                      ? null
                                      : item._id
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
                                  className="absolute right-30 top-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
                                >
                                  <Link
                                    to={`/clients/view/${item._id}`}
                                    className="flex items-center border-b border-gray-300 gap-3 px-4 py-3 hover:bg-gray-100"
                                  >
                                    <span>👁</span>
                                    <span>View</span>
                                  </Link>

                                  <Link
                                    to={`/clients/edit/${item._id}`}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-300 hover:bg-gray-100"
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </Link>

                                  <button
                                    onClick={() => {
                                      setSelectedClient(item);
                                      setShowBedShiftModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                  >
                                    <span>🛏</span>
                                    <span>Bed Shift</span>
                                  </button>
                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                  >
                                    <span>📢</span>
                                    <span>Notice</span>
                                  </button>

                                  <button
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                  >
                                    <span>💰</span>
                                    <span>FNF</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedClient(item);
                                      setShowBedHistoryModal(true);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                  >
                                    <span>📜</span>
                                    <span>Bed History</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          {/* <td className="p-3 sticky right-0 bg-white z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-center gap-3">
                              <Link
                                to={`/clients/view/${item._id}`}
                              >
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Eye size={18} />
                                </button>
                              </Link>

                              <Link
                                to={`/clients/edit/${item._id}`}
                              >
                                <button className="text-yellow-600 hover:text-yellow-800">
                                  <Pencil size={18} />
                                </button>
                              </Link>

                              <button
                                onClick={() =>
                                  handleDelete(item._id)
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={15}>
                        <NoDataFound
                          title="No Clients Found"
                          description="No client records available"
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

      <BedShiftModal
        isOpen={showBedShiftModal}
        onClose={() => {
          setShowBedShiftModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
      <BedHistoryModal
        isOpen={showBedHistoryModal}
        onClose={() =>
          setShowBedHistoryModal(false)
        }
        client={selectedClient}
      />
    </>
  );
};

export default ClientsTable;  