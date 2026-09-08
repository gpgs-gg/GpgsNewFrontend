import React, { useState, useEffect, useMemo } from "react";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { toast } from "react-toastify";
import { Eye, Pencil, Filter, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";

import { PAGINATION } from "../../constants/appConfig";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useUsersData, useDeleteUserData } from "./services";
import UserFilter from "./UserFilter";
import { useAuthorization } from "../../context/AuthorizationContext";

function UserTable() {
  const { canView, canAdd, canEdit, canDelete, canSingleView } =
    useAuthorization();
  const [search, setSearch] = useState("");
  // ============================================================
  // FILTER + PAGINATION PERSISTENCE
  // ============================================================

  const DEFAULT_USER_FILTERS = {
    userId: "",
    role: "",
    isActive: "",
  };

  // Persist filters in localStorage
  const {
    filters,
    setFilters,
    resetFilters,
    removeFilter: removePersistedFilter,
  } = usePersistedFilters("user_filters", DEFAULT_USER_FILTERS);

  // Persist current page in localStorage
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("user_page");

    return savedPage ? Number(savedPage) : 1;
  });

  // Save current page whenever it changes
  useEffect(() => {
    localStorage.setItem("user_page", String(currentPage));
  }, [currentPage]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const debouncedSearch = useDebounce(search);
  const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
  const { mutate: deleteUserData, isPending } = useDeleteUserData();
  const { data: apiResponse, isLoading } = useUsersData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });

  const apiData = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || 0;

  const paginatedData = apiData;
  // ============================================================
  // FILTER CHIPS
  // ============================================================

  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.userId) {
      labels.push({
        key: "userId",
        label: `User : ${filters.userId}`,
      });
    }

    if (filters.role) {
      labels.push({
        key: "role",
        label: `Role : ${filters.role}`,
      });
    }

    if (filters.isActive !== "") {
      labels.push({
        key: "isActive",
        label: `Status : ${
          filters.isActive === true || filters.isActive === "true"
            ? "Active"
            : "Inactive"
        }`,
      });
    }

    return labels;
  }, [filters]);
  const hasAppliedFilters = useMemo(() => {
    return filterLabels.length > 0;
  }, [filterLabels]);
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserData(id, {
        onSuccess: (data) => {
          toast.dismiss();
          toast.success(data.message);
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Delete failed");
        },
      });
    }
  };
  // ============================================================
  // RESET ALL FILTERS + SEARCH + PAGINATION
  // ============================================================

  const handleReset = () => {
    // Clear persisted filters
    resetFilters();

    // Clear search
    setSearch("");

    // Go back to first page
    setCurrentPage(1);

    // Tell UserFilter to clear its react-hook-form values
    setResetTrigger((prev) => prev + 1);
  };
  // ============================================================
  // REMOVE SINGLE FILTER
  // ============================================================

  const removeFilter = (key) => {
    // Remove filter from localStorage + state
    removePersistedFilter(key);

    // Removing a filter should always go to page 1
    setCurrentPage(1);
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">User List</h1>
              <p className="text-sm text-gray-500">Manage all Users</p>
            </div>

            {/* <Link to="/tickets/create">
                            <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                                + Add Ticket
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
                placeholder="Search User..."
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
            {/* ========================================================
      FILTER CHIPS
  ========================================================= */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100"
                >
                  <span className="mr-2 font-medium text-slate-700">
                    {filter.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove ${filter.label}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {/* ========================================================
      RESET + FILTER BUTTON
  ========================================================= */}

            <div className="flex gap-2">
              {hasAppliedFilters && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                >
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
            <table className="w-max min-w-full">
              <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                <tr>
                  {/* <th className="p-3 text-left">Employee ID</th> */}
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  {/* <th className="p-3 text-left">Booking ID</th> */}
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created Date</th>
                  <th className="p-3 text-left">Updated Date</th>
                  <th className="sticky right-0 bg-gray-100 p-3 text-center shadow-md">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {/* Employee ID */}
                      {/* <td className="p-3">{item.employeeId || "-"}</td> */}

                      {/* Name */}
                      <td className="p-3 font-semibold">{item?.name}</td>

                      {/* Email */}
                      <td className="p-3">{item.email}</td>
                      <td className="p-3">{item.role}</td>

                      {/* Booking ID */}
                      {/* <td className="p-3">{item.bookingId || "-"}</td> */}
                      {/* Role */}

                      {/* Status */}
                      <td className="p-3 text-left">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="p-3">
                        {formatDateAndTime(new Date(item.createdAt))}
                      </td>

                      {/* Updated */}
                      <td className="p-3">
                        {formatDateAndTime(new Date(item.updatedAt))}
                      </td>

                      {/* Actions */}
                      <td className="sticky right-0 z-20 bg-white p-3 shadow-md">
                        <div className="flex justify-center gap-2">
                          {canSingleView("users") && (
                            <Link to={`/users/view/${item._id}`}>
                              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                <Eye size={16} />
                              </button>
                            </Link>
                          )}

                          {canEdit("users") && (
                            <Link to={`/users/edit/${item._id}`}>
                              <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                <Pencil size={16} />
                              </button>
                            </Link>
                          )}

                          {canDelete("users") && (
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9}>
                      <NoDataFound
                        title="No Users Found"
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
              Showing{" "}
              {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
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

      <UserFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        // Send persisted filters to drawer
        initialFilters={filters}
        // Save filters when Apply is clicked
        onApply={(data) => {
          setFilters(data);

          // Applying filters always starts from page 1
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
    </>
  );
}

export default UserTable;