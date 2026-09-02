import React, { useState, useMemo, useEffect } from "react";
import { Eye, Pencil, Filter, Trash2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import {
  useCancelNewBooking,
  useClientFromNewBooking,
  useClients,
} from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import { FaEllipsisV } from "react-icons/fa";
import BedShiftModal from "./BedShiftModal";
import BedHistoryModal from "./BedHistoryModal";
import ClientsFilter from "./ClientsFilter";
import ClientVacationModal from "./ClientVacationModal";
const ClientsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showBedShiftModal, setShowBedShiftModal] = useState(false);
  const [showClientVacationModal, setShowClientVacationModal] = useState(false);
  const [showBedHistoryModal, setShowBedHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState();
  const debouncedSearch = useDebounce(search, 500);
  const [filterLabels, setFilterLabels] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [editingVacation, setEditingVacation] = useState(null);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const rowsPerPage = 10;
  const { data: clients, isPending: isClients } = useClients({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });
  const { mutate: createClientFromBooking, isPending: isCreateClientLoading } =
    useClientFromNewBooking();

  const { mutate: cancelBooking, isPending: isCancelBookingLoading } =
    useCancelNewBooking();

  // Safely get bookings data
  const bookings = clients?.data || [];

  const totalPages = clients?.totalPages || 1;

  const totalRecords = clients?.totalRecords || 0;

  const paginatedData = bookings;

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters]);

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

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Client Master</h1>
              <p className="text-sm text-gray-500">Manage all clients</p>
            </div>

            {/* <Link to="/newbooking/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Create Clients
              </button>
            </Link> */}
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

            <div className="flex gap-2"></div>
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
                    {/* <th className="p-3 text-center whitespace-nowrap">
                      Sr No.
                    </th> */}
                    <th className="p-3 text-center whitespace-nowrap">
                      Status
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Stay Type
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      P. Info
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Client Name
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
                      Rent DOJ
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">EBDOJ</th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Monthly Rent
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Deposit
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Parking Charges
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">NSD</th>
                    <th className="p-3 text-center whitespace-nowrap">NLD</th>
                    <th className="p-3 text-center whitespace-nowrap">CVD</th>

                    <th className="p-3 text-center whitespace-nowrap">Vacations</th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Login Enabled
                    </th>
                    {/* <th className="p-3 text-center whitespace-nowrap">
                      Total Amount
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Advance Amount
                    </th>

                    <th className="p-3 text-center whitespace-nowrap">
                      Balance Amount
                    </th> */}

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

                      // const bookingAmount =
                      //   item?.advanceAmount || 0;

                      // const balanceAmount =
                      //   totalAmount - bookingAmount;

                      const getClientStatus = (item) => {
                        const today = new Date();

                        if (item.isBookingCancelled) {
                          return {
                            text: "Cancelled",
                            className: "bg-red-50 text-red-700 border border-red-200",
                          };
                        }

                        // Vacated highest priority
                        if (item.clientVacatingDate) {
                          const vacatedDate = new Date(item.clientVacatingDate);

                          if (vacatedDate <= today) {
                            return {
                              text: "RFH",
                            className: "bg-slate-100 text-slate-700 border border-slate-300",
                            };
                          }
                        }

                        // Permanent Notice
                        if (item.noticeStartDate) {
                          return {
                            text: "Notice",
                            className: "bg-amber-50 text-amber-700 border border-amber-200",
                          };
                        }

                        return {
                          text: "Active",
                          className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
                        };
                      };
                      return (
                        <tr
                          key={item._id}
                          className="border-t text-center border-gray-300 hover:bg-gray-50"
                        >
                          {/* Sr No */}
                          {/* <td className="p-3 font-medium">
                            {(currentPage - 1) * rowsPerPage +
                              index +
                              1}
                          </td> */}
                          <td className="p-3 text-center">

                            {/* Status */}
                            {(() => {
                              const fnfStatus = item?.fnf?.status;

                              if (fnfStatus && fnfStatus.trim() !== "") {
                                return (
                                  <span className="px-2.5 py-1 text-sm rounded-full font-semibold bg-gray-100 text-gray-700">
                                    {fnfStatus}
                                  </span>
                                );
                              }

                              const status = getClientStatus(item);

                              return (
                                <span
                                  className={`px-2.5 py-1 rounded-full text-sm font-semibold ${status.className}`}
                                >
                                  {status.text}
                                </span>
                              );
                            })()}

                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-md font-semibold ${item.bookingType === "Daily"
                                ? " text-indigo-700"
                                : item.stayType === "P. Booked"
                                  ? " text-emerald-700"
                                  : item.stayType === "T. Booked"
                                    ? " text-amber-700"
                                    : " text-gray-700"
                                }`}
                            >
                              {item.bookingType === "Daily"
                                ? "Daily"
                                : item.stayType || "-"}
                            </span>
                          </td>
                          <td className="p-3">
                            {item.stayType === "T. Booked" && item.permanentBooking ? (
                              <div className="relative group inline-block">
                                <Info
                                  size={18}
                                  className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
                                />

                                {/* Hover Details */}
                                <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 w-80">
                                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

                                    {/* Header */}
                                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                          Permanent Booking
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          Property & room details
                                        </p>
                                      </div>

                                      <span className="rounded-md bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700 border border-green-100">
                                        Permanent
                                      </span>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4">
                                      <div className="divide-y divide-gray-100">

                                        {/* Property */}
                                        <div className="flex items-center justify-between py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Property
                                          </span>
                                          <span className="text-sm font-semibold text-gray-900">
                                            {item.permanentBooking?.propertyCode || "-"}
                                          </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start justify-between gap-4 py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Location
                                          </span>
                                          <span className="max-w-[190px] text-right text-sm text-gray-800">
                                            {item.permanentBooking?.propertyLocation || "-"}
                                          </span>
                                        </div>

                                        {/* Room */}
                                        <div className="flex items-center justify-between py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Room No
                                          </span>
                                          <span className="text-sm font-medium text-gray-900">
                                            {item.permanentBooking?.roomNo || "-"}
                                          </span>
                                        </div>

                                        {/* Bed */}
                                        <div className="flex items-center justify-between py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Bed No
                                          </span>
                                          <span className="text-sm font-medium text-gray-900">
                                            {item.permanentBooking?.bedNo || "-"}
                                          </span>
                                        </div>

                                        {/* Rent */}
                                        <div className="flex items-center justify-between py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Monthly Rent
                                          </span>
                                          <span className="text-sm font-semibold text-gray-900">
                                            ₹{Number(item.permanentBooking?.monthlyRent || 0).toLocaleString("en-IN")}
                                          </span>
                                        </div>

                                        {/* Deposit */}
                                        <div className="flex items-center justify-between py-2.5">
                                          <span className="text-xs font-medium text-gray-500">
                                            Deposit
                                          </span>
                                          <span className="text-sm font-semibold text-gray-900">
                                            ₹{Number(item.permanentBooking?.depositAmount || 0).toLocaleString("en-IN")}
                                          </span>
                                        </div>

                                      </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                                      <p className="text-[11px] text-gray-400">
                                        Booking property information
                                      </p>
                                    </div>

                                  </div>
                                </div>
                              </div>
                            ) : (
                              "-"
                            )}
                          </td>
                          {/* Client Name */}
                          <td className="p-3 font-bold">{item.fullName || "-"}</td>
                          {/* Status */}

                          {/* Contact No */}
                          <td className="p-3 whitespace-nowrap">
                            {item.callingNo === item.whatsappNo ? (
                              item.callingNo || "-"
                            ) : (
                              <>
                                {item.callingNo}
                                <br />
                                {/* {item.whatsappNo} */}
                              </>
                            )}
                          </td>

                          {/* Property */}
                          <td className="p-3">
                            {item.propertyId?.propertyCode || "-"}
                          </td>

                          {/* Room No */}
                          <td className="p-3">{item.bedId?.roomNo || "-"}</td>

                          {/* Bed No */}
                          <td className="p-3">{item.bedId?.bedNo || "-"}</td>

                          {/* Rent Start Date */}
                          <td className="p-3">
                            {item.clientDoj ? formatDate(item.clientDoj) : "-"}
                          </td>
                          <td className="p-3">
                            {item.ebDoj ? formatDate(item.ebDoj) : "-"}
                          </td>

                          {/* Monthly Rent */}
                          <td className="p-3">
                            ₹
                            {(item?.monthlyRent || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          {/* Deposit */}
                          <td className="p-3">
                            ₹
                            {(item?.depositAmount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          {/* Parking Charges */}
                          <td className="p-3">
                            ₹
                            {(item?.parkingCharges || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>
                          <td className="p-3">
                            {formatDate(item.noticeStartDate) || "-"}
                          </td>
                          <td className="p-3">
                            {formatDate(item.noticeLastDate) || "-"}
                          </td>
                          <td className="p-3">
                            {formatDate(item.clientVacatingDate) || "-"}
                          </td>

                          <td className="p-3">
                            <div className="relative group inline-flex">
                              <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center rounded-full
               text-blue-600 hover:bg-blue-50 transition"
                              >
                                <Info size={17} />
                              </button>

                              <div
                                className="absolute  top-full left-1/2 -translate-x-1/2 mt-2
               hidden group-hover:block z-50 w-[350px]"
                              >
                                <div
                                  className="bg-white border border-gray-200 rounded-xl
                 shadow-xl overflow-auto p-2 text-sm max-h-[30vh]"
                                >
                                  {/* Header */}


                                  {item.vacations?.filter(
                                    (vacation) =>
                                      vacation.vacationStartDate1 ||
                                      vacation.vacationLastDate1 ||
                                      vacation.vacationStartDate2 ||
                                      vacation.vacationLastDate2
                                  ).length > 0 ? (
                                    <div className="space-y-3">

                                      {item.vacations
                                        .filter(
                                          (vacation) =>
                                            vacation.vacationStartDate1 ||
                                            vacation.vacationLastDate1 ||
                                            vacation.vacationStartDate2 ||
                                            vacation.vacationLastDate2
                                        )
                                        .map((vacation, index) => (
                                          <div
                                            key={vacation._id || index}
                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                          >
                                            {/* Month Header */}
                                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                                              <span className="font-semibold text-gray-700">
                                                {new Date(
                                                  vacation.year,
                                                  vacation.month - 1
                                                ).toLocaleString("en-IN", {
                                                  month: "long",
                                                  year: "numeric",
                                                })}
                                              </span>

                                              {/* Edit Button */}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingVacation(vacation);
                                                  setSelectedClient(item);
                                                  setShowClientVacationModal(true);
                                                }}
                                                className="flex items-center gap-1 px-2.5 py-1
             text-xs font-medium text-blue-600
             border border-blue-200 rounded-md
             hover:bg-blue-50 transition"
                                              >
                                                <Pencil size={13} />
                                               
                                              </button>
                                            </div>

                                            {/* Vacation Details */}
                                            <div className="p-3 space-y-2">

                                              {/* Vacation 1 */}
                                              {(vacation.vacationStartDate1 ||
                                                vacation.vacationLastDate1) && (
                                                  <div className="flex items-center gap-5">
                                                    <span className="font-medium text-gray-700">
                                                      Vacation 1
                                                    </span>

                                                    <span className="text-gray-600">
                                                      {vacation.vacationStartDate1
                                                        ? formatDate(
                                                          vacation.vacationStartDate1
                                                        )
                                                        : "-"}{" "}
                                                      <span className="text-gray-400">
                                                        →
                                                      </span>{" "}
                                                      {vacation.vacationLastDate1
                                                        ? formatDate(
                                                          vacation.vacationLastDate1
                                                        )
                                                        : "-"}
                                                    </span>
                                                  </div>
                                                )}

                                              {/* Vacation 2 */}
                                              {(vacation.vacationStartDate2 ||
                                                vacation.vacationLastDate2) && (
                                                  <div className="flex items-center gap-5">
                                                    <span className="font-medium text-gray-700">
                                                      Vacation 2
                                                    </span>

                                                    <span className="text-gray-600">
                                                      {vacation.vacationStartDate2
                                                        ? formatDate(
                                                          vacation.vacationStartDate2
                                                        )
                                                        : "-"}{" "}
                                                      <span className="text-gray-400">
                                                        →
                                                      </span>{" "}
                                                      {vacation.vacationLastDate2
                                                        ? formatDate(
                                                          vacation.vacationLastDate2
                                                        )
                                                        : "-"}
                                                    </span>
                                                  </div>
                                                )}

                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-center py-3">
                                      No vacation records found
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            className={`p-3 font-semibold ${item.loginEnabled
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {item.loginEnabled ? "Enabled" : "Disabled"}
                          </td>
                          {/* Total Amount */}
                          {/* <td className="p-3 font-medium">
                            ₹
                            {totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td> */}

                          {/* Advance Amount */}
                          {/* <td className="p-3 text-green-600 font-medium">
                            ₹
                            {bookingAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td> */}

                          {/* Balance Amount */}
                          {/* <td className="p-3 text-red-600 font-medium">
                            ₹
                            {balanceAmount.toLocaleString(
                              "en-IN"
                            )}
                          </td> */}

                          <td className={`p-3 sticky right-0 bg-white ${openMenuId === item._id ? "z-[9999]" : "z-20"
                            } shadow-[-4px_0_6px_rgba(0,0,0,0.05)]`}>

                            <div className="flex justify-center gap-2">
                              <Link
                                to={`/rent-ledger/client/${item?._id}`}
                                className="w-full flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 hover:border-gray-800 text-left"
                              >
                                <span>💰</span>
                                <span>Rent</span>
                              </Link>

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
                                <div className="absolute right-33 top-0 mt-2 w-fit bg-white font-bold border border-gray-300 rounded-lg shadow-xl z-9999">

                                  {item?.bookingType !== "Daily" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setSelectedClient(item);
                                          setShowBedShiftModal(true);
                                        }}
                                        className="w-full flex items-center gap-1 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                      >
                                        <span>🛏</span>
                                        <span>Bed Shift</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setSelectedClient(item);
                                          setShowBedHistoryModal(true);
                                        }}
                                        className="w-full flex items-center gap-1 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                      >
                                        <span>📜</span>
                                        <span>Bed History</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedClient(item);
                                          setShowClientVacationModal(true);
                                        }}
                                        className="w-full flex items-center gap-1 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left"
                                      >
                                        <span>🛏</span>
                                        <span>Vacation</span>
                                      </button>
                                    </>
                                  )}


                                  {/* <button className="w-full flex items-center gap-1 px-4 py-3 border-b border-gray-300 hover:bg-gray-100 text-left">
                                    <span>💰</span>
                                    <span>FNF</span>
                                  </button> */}

                                  {/* 
                                  <Link
                                    to={`/clients/view/${item._id}`}
                                    className="flex items-center border-b border-r border-gray-200 gap-1 px-4 py-3 hover:bg-gray-100"
                                  >
                                    <span>👁</span>
                                    <span>View</span>
                                  </Link> */}

                                  <Link
                                    to={`/clients/edit/${item._id}`}
                                    className="flex items-center gap-1 px-4 py-3 border-b border-r border-gray-200 hover:bg-gray-100"
                                  >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                  </Link>
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
          {totalRecords > 0 && (
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

      <BedShiftModal
        isOpen={showBedShiftModal}
        onClose={() => {
          setShowBedShiftModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
      <ClientVacationModal
        isOpen={showClientVacationModal}
        onClose={() => {
          setShowClientVacationModal(false);
          setSelectedClient(null);
          setEditingVacation(null);
        }}
        client={selectedClient}
        vacation={editingVacation}
      />
      <BedHistoryModal
        isOpen={showBedHistoryModal}
        onClose={() => setShowBedHistoryModal(false)}
        client={selectedClient}
      />

      <ClientsFilter
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

export default ClientsTable;