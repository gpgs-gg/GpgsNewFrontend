import { useState, useEffect } from "react";
import { Eye, Pencil, Filter, MoreVertical, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { formatDate } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import BedFilter from "./BedFilter";
import {
  useBedsData,
  useDeleteBedData,
  useDeleteMultipleBedsData,
} from "./services";

import ConfirmModal from "../common/ConfirmModal";
import { PAGINATION } from "../../constants/appConfig";
import useDebounce from "../hooks/useDebounce";
import TableSkeleton from "../../components/common/TableSkelton";
import { toast } from "react-toastify";
const BedsTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [filterLabels, setFilterLabels] = useState([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = PAGINATION.BEDS_PER_PAGE || 10;
  const debouncedSearch = useDebounce(search);

  const { data: apiResponse, isLoading } = useBedsData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });
  const apiData = apiResponse?.data || [];

  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || 0;

  const paginatedData = apiData;
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState("single");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { mutate: deleteBed, isPending: deleting } = useDeleteBedData();

  const { mutate: deleteMultipleBeds } = useDeleteMultipleBedsData();

  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedBeds.includes(item._id));

  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };
  // for removing filter chips
  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFilterLabels((prev) => prev.filter((item) => item.key !== key));

    setCurrentPage(1);
  };

  const handleDelete = () => {
    if (deleteType === "single") {
      deleteBed(deleteId, {
        onSuccess: (response) => {
          toast.success(response?.message || "Bed deleted successfully.");

          setDeleteId(null);
          setShowDeleteModal(false);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete bed.",
          );
        },
      });
    } else {
      deleteMultipleBeds(selectedBeds, {
        onSuccess: (response) => {
          toast.success(
            response?.message || "Selected beds deleted successfully.",
          );

          setSelectedBeds([]);
          setShowDeleteModal(false);
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete selected beds.",
          );
        },
      });
    }
  };

  const handleSelect = (id) => {
    setSelectedBeds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = paginatedData.map((item) => item._id);

    const isAllSelected = currentPageIds.every((id) =>
      selectedBeds.includes(id),
    );

    if (isAllSelected) {
      setSelectedBeds((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      setSelectedBeds((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // OUTSIDE-CLICK HANDALING
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
              <h1 className="text-2xl font-bold uppercase">Bed Master</h1>
              <p className="text-sm text-gray-500">Manage all PG Beds</p>
            </div>

            <Link to="/bed/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add Bed
              </button>
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* search */}
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
            {/* filter chips */}
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
            {/* reset n filter  */}
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
          {selectedBeds.length > 0 && (
            <button
              onClick={() => {
                setDeleteType("bulk");
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100"
            >
              <Trash2 size={18} />

              <span>Delete Selected</span>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">
                {selectedBeds.length}
              </span>
            </button>
          )}
          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto ">
            <table className="w-full">
              <thead className="z-30 sticky top-0 bg-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-3 text-left whitespace-nowrap sticky left-0 z-20 bg-gray-100">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-red-600"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left whitespace-nowrap sticky left-7.5 z-20 bg-gray-100">
                    Property Code
                  </th>
                  <th className="p-3 text-center">Room No</th>
                  <th className="p-3 text-center">Bed No</th>
                  <th className="p-3 text-center">Gender</th>
                  <th className="p-3 text-center">Sharing Type</th>
                  <th className="p-3 text-center">Bath Attached</th>
                  <th className="p-3 text-center">AC Room</th>
                  <th className="p-3 text-center">Monthly Rent</th>
                  <th className="p-3 text-center">SDMF</th>
                  <th className="p-3 text-center">DA</th>
                  <th className="p-3 text-center">Free EB</th>
                  <th className="p-3 text-center">URHD</th>
                  <th className="p-3 text-center">URHA</th>
                  <th className="p-3 text-center">PRHD</th>
                  <th className="p-3 text-center">Status</th>
                  {/* <th className="p-3 text-center">Comment</th> */}
                  <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-37.5 shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
                    Actions
                  </th>
                </tr>
              </thead>
              {isLoading ? (
                <TableSkeleton rows={8} columns={13} showStatus showActions />
              ) : (
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr
                        key={item._id}
                        className="border-t border-gray-300 whitespace-nowrap text-center hover:bg-gray-50"
                      >
                        <td className="p-3 text-center sticky bg-white left-0 z-10">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-red-600"
                            checked={selectedBeds.includes(item._id)}
                            onChange={() => handleSelect(item._id)}
                          />
                        </td>
                        <td className="p-3 sticky left-[30px] z-10 bg-white text-center font-semibold">
                          {item?.propertyId?.propertyCode}
                        </td>
                        <td className="p-3 text-center">{item.roomNo}</td>
                        <td className="p-3 text-center">{item.bedNo}</td>
                        <td className="p-3 text-center">{item?.gender}</td>
                        <td className="p-3 text-center">{item?.sharingType}</td>
                        <td className="p-3 text-center">
                          {item?.bathAttached}
                        </td>
                        <td className="p-3 text-center">{item?.acRoom}</td>
                        <td className="p-3 text-center">{item?.monthlyRent}</td>
                        <td className="p-3 text-center">
                          {item?.securityDepositMultiplicationFactor}
                        </td>
                        <td className="p-3 text-center">
                          {item?.depositAmount}
                        </td>
                        <td className="p-3 text-center">
                          {item?.freeEbAsPerBed}
                        </td>
                        <td className="p-3 text-center">
                          {formatDate(item?.upcomingRentHikeDate)}
                        </td>
                        <td className="p-3">{item?.upcomingRentHikeAmount}</td>
                        <td className="p-3">
                          {formatDate(item?.previousRentHikeDate)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {/* <td className="p-3">{item?.comment}</td> */}
                        {/* action */}
                        <td
                          className={`p-3 sticky right-0 bg-white ${
                            openMenuId === item._id ? "z-[9999]" : "z-20"
                          } shadow-[-4px_0_6px_rgba(0,0,0,0.05)]`}
                        >
                          <div className="flex font-bold justify-center relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setOpenMenuId(
                                  openMenuId === item._id ? null : item._id,
                                );
                              }}
                              className={`p-2 rounded-md transition-colors ${
                                openMenuId === item._id
                                  ? "bg-blue-100 text-blue-600"
                                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                              }`}
                            >
                              <MoreVertical size={20} />
                            </button>

                            {openMenuId === item._id && (
                              <div
                                className="absolute right-12 top-8 w-44 bg-white border border-gray-300 rounded-lg shadow-xl z-[9999]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* View */}
                                <Link
                                  to={`/bed/view/${item._id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 hover:bg-gray-100"
                                >
                                  <span>👁</span>
                                  <span>View</span>
                                </Link>

                                {/* Edit */}
                                <Link
                                  to={`/bed/edit/${item._id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 hover:bg-gray-100"
                                >
                                  <span>✏️</span>
                                  <span>Edit</span>
                                </Link>

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setDeleteType("single");
                                    setDeleteId(item._id);
                                    setShowDeleteModal(true);
                                  }}
                                  disabled={deleting}
                                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-100 text-red-600 disabled:opacity-50"
                                >
                                  <span>🗑</span>
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={16} className="h-64">
                        <div className="flex items-center justify-center h-full">
                          <NoDataFound
                            title="No Properties Found"
                            description="Try searching different keywords"
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* PAGINATION */}
          <div className="border-t p-3 flex justify-between items-center">
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
      <BedFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        onApply={(data, labels) => {
          setFilters(data);
          setFilterLabels(labels);
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        title={
          deleteType === "single"
            ? "Delete Bed"
            : `Delete ${selectedBeds.length} Beds`
        }
        message={
          deleteType === "single"
            ? "This bed will be permanently deleted."
            : `You are about to permanently delete ${selectedBeds.length} beds. This action cannot be undone.`
        }
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />
    </>
  );
};

export default BedsTable;