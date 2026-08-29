import React, { useState } from "react";
import { Eye, Pencil, Trash2, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../common/TableSkelton";
import ConfirmModal from "../Common/ConfirmModal";
import { toast } from "react-toastify";

import {
  useModulesData,
  useDeleteModuleData,
  useToggleModuleStatus,
} from "./services";

import { PAGINATION } from "../../constants/appConfig";
import useDebounce from "../hooks/useDebounce";

const ModuleTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [moduleType, setModuleType] = useState("");
  const [status, setStatus] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const debouncedSearch = useDebounce(search);

  const rowsPerPage = PAGINATION.MODULES_PER_PAGE || 10;

  const { data: apiResponse, isLoading } = useModulesData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    moduleType,
    isActive: status,
  });

  const apiData = apiResponse?.data || [];

  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || apiData.length;

  const { mutate: deleteModule, isPending: deleting } = useDeleteModuleData();

  const { mutate: toggleStatus, isPending: toggling } = useToggleModuleStatus();

  // =========================
  // Delete
  // =========================

  const handleDelete = () => {
    if (!deleteId) return;

    deleteModule(deleteId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Module deleted successfully.");

        setDeleteId(null);
        setShowDeleteModal(false);
      },

      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete module.",
        );
      },
    });
  };

  // =========================
  // Toggle Status
  // =========================

  const handleToggleStatus = (id) => {
    toggleStatus(id, {
      onSuccess: (data) => {
        toast.success(data?.message || "Module status updated successfully.");
      },

      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update module status.",
        );
      },
    });
  };

  // =========================
  // Reset Filters
  // =========================

  const handleReset = () => {
    setSearch("");
    setModuleType("");
    setStatus("");
    setCurrentPage(1);
  };

  const hasFilters = search || moduleType || status;

  return (
    <>
      <div className="space-y-5">
        {/* ================= HEADER ================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Modules Master</h1>

              <p className="text-sm text-gray-500">
                Manage system modules and actions
              </p>
            </div>

            <Link to="/modules/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add Module
              </button>
            </Link>
          </div>
        </div>

        {/* ================= TABLE ================= */}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* ================= SEARCH / FILTER ================= */}

          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* Search */}

            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search module..."
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

            {/* Filters */}

            <div className="flex items-center gap-2">
              {/* Module Type */}

              <select
                value={moduleType}
                onChange={(e) => {
                  setModuleType(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="MENU">Menu</option>
                <option value="ACTION">Action</option>
              </select>

              {/* Status */}

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              {/* Reset */}

              {hasFilters && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
                >
                  Reset
                </button>
              )}

              <button className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2">
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* ================= TABLE CONTENT ================= */}

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-3 text-center">Sr No</th>

                  <th className="p-3 text-left">Key</th>

                  <th className="p-3 text-left">Name</th>

                  <th className="p-3 text-left">Path</th>

                  <th className="p-3 text-center">Type</th>

                  <th className="p-3 text-center">View</th>

                  <th className="p-3 text-center">Add</th>

                  <th className="p-3 text-center">Edit</th>

                  <th className="p-3 text-center">Delete</th>

                  <th className="p-3 text-center">Single View</th>

                  <th className="p-3 text-center">Status</th>

                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton rows={8} columns={12} showStatus showActions />
              ) : (
                <tbody>
                  {apiData.length > 0 ? (
                    apiData.map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-t border-gray-300 hover:bg-gray-50"
                      >
                        <td className="p-3 text-center">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="p-3 font-semibold">{item.key}</td>

                        <td className="p-3">{item.name}</td>

                        <td className="p-3">{item.path}</td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.moduleType === "MENU"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {item.moduleType}
                          </span>
                        </td>

                        {/* View */}

                        <td className="p-3 text-center">
                          <PermissionBadge value={item.actions?.view} />
                        </td>

                        {/* Add */}

                        <td className="p-3 text-center">
                          <PermissionBadge value={item.actions?.add} />
                        </td>

                        {/* Edit */}

                        <td className="p-3 text-center">
                          <PermissionBadge value={item.actions?.edit} />
                        </td>

                        {/* Delete */}

                        <td className="p-3 text-center">
                          <PermissionBadge value={item.actions?.delete} />
                        </td>

                        {/* Single View */}

                        <td className="p-3 text-center">
                          <PermissionBadge value={item.actions?.singleView} />
                        </td>

                        {/* Status */}

                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(item._id)}
                            disabled={toggling}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}

                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            {/* View */}

                            <Link to={`/modules/view/${item._id}`}>
                              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                <Eye size={16} />
                              </button>
                            </Link>

                            {/* Edit */}

                            <Link to={`/modules/edit/${item._id}`}>
                              <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                <Pencil size={16} />
                              </button>
                            </Link>

                            {/* Delete */}

                            <button
                              onClick={() => {
                                setDeleteId(item._id);
                                setShowDeleteModal(true);
                              }}
                              disabled={deleting}
                              className="p-2 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12}>
                        <NoDataFound
                          title="No Modules Found"
                          description="Try searching different keywords"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* ================= PAGINATION ================= */}

          <div className="border-t p-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {totalRecords > 0
                ? `Showing ${(currentPage - 1) * rowsPerPage + 1} - ${Math.min(
                    currentPage * rowsPerPage,
                    totalRecords,
                  )} of ${totalRecords}`
                : "Showing 0 records"}
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ================= DELETE MODAL ================= */}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Module"
        message="This module will be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />
    </>
  );
};

// =========================
// Permission Badge
// =========================

const PermissionBadge = ({ value }) => {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
};

export default ModuleTable;
