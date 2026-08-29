import React, { useState } from "react";
import { Eye, Pencil, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../common/TableSkelton";

import { useEmployeeDetailsData } from "../EmployeeDetails/Services/index";

import { useEmployeePermissionsData } from "./services/index";

import { PAGINATION } from "../../constants/appConfig";
import useDebounce from "../hooks/useDebounce";

const PermissionTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const rowsPerPage = PAGINATION.EMPLOYEES_PER_PAGE || 10;

  // =====================================================
  // GET EMPLOYEES
  // =====================================================

  const { data: employeeResponse, isLoading: employeesLoading } =
    useEmployeeDetailsData({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch,
    });

  const employees = employeeResponse?.data || [];

  const pagination = employeeResponse?.pagination || {};

  const totalPages = pagination.totalPages || 1;

  const totalRecords = pagination.total || 0;

  return (
    <>
      <div className="space-y-5">
        {/* ================= HEADER ================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">
                Employee Permissions
              </h1>

              <p className="text-sm text-gray-500">
                Manage employee module permissions and access
              </p>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* ================= SEARCH ================= */}

          <div className="px-3 py-2 border-b border-gray-400 flex justify-between">
            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search employee..."
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
          </div>

          {/* ================= TABLE CONTENT ================= */}

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-3 text-center">Sr No</th>

                  <th className="p-3 text-left">Employee ID</th>

                  <th className="p-3 text-left">Employee Name</th>

                  <th className="p-3 text-left">Department</th>

                  <th className="p-3 text-left">Designation</th>

                  <th className="p-3 text-center">Status</th>

                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              {employeesLoading ? (
                <TableSkeleton rows={8} columns={7} showStatus showActions />
              ) : (
                <tbody>
                  {employees.length > 0 ? (
                    employees.map((employee, index) => (
                      <PermissionRow
                        key={employee._id}
                        employee={employee}
                        index={index}
                        currentPage={currentPage}
                        rowsPerPage={rowsPerPage}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <NoDataFound
                          title="No Employees Found"
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
    </>
  );
};

// =====================================================
// PERMISSION ROW
// =====================================================

const PermissionRow = ({ employee, index, currentPage, rowsPerPage }) => {
  const { data: permissionResponse, isLoading } = useEmployeePermissionsData(
    employee._id,
  );

  const permissionData = permissionResponse?.data;

  const permissions = permissionData?.permissions || [];

  // -----------------------------------------------------
  // Count assigned modules
  // -----------------------------------------------------

  const assignedModules = permissions.filter(
    (permission) => permission.actions?.view,
  ).length;

  return (
    <tr className="border-t border-gray-300 hover:bg-gray-50">
      {/* Sr No */}

      <td className="p-3 text-center">
        {(currentPage - 1) * rowsPerPage + index + 1}
      </td>

      {/* Employee ID */}

      <td className="p-3 font-semibold">{employee.employeeId || "-"}</td>

      {/* Employee Name */}

      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
            {employee.employeeName?.charAt(0)?.toUpperCase() || "E"}
          </div>

          <span>{employee.employeeName || "-"}</span>
        </div>
      </td>

      {/* Department */}

      <td className="p-3">{employee.department || "-"}</td>

      {/* Designation */}

      <td className="p-3">{employee.designation || "-"}</td>

      {/* Status */}

      <td className="p-3 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            employee.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {employee.status || "Unknown"}
        </span>
      </td>

      {/* Actions */}

      <td className="p-3">
        <div className="flex justify-center gap-2">
          {/* View */}

          <Link to={`/permissions/employee/${employee._id}`}>
            <button
              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
              title="View Permissions"
            >
              <Eye size={16} />
            </button>
          </Link>

          {/* Edit */}

          <Link to={`/permissions/employee/${employee._id}`}>
            <button
              className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
              title="Edit Permissions"
            >
              <Pencil size={16} />
            </button>
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default PermissionTable;
