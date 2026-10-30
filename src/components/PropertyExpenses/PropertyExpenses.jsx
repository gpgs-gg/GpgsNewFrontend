import { useState, useMemo, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  Search,
  Filter,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import NoDataFound from "../common/NoDataFound";
import TableSkeleton from "../common/TableSkelton";
import Pagination from "../common/Pagination";
import usePersistedFilters from "../hooks/usePersistedFilters";
import { PAGINATION } from "../../constants/appConfig";
import { useCallback } from "react";
import { toast } from "react-toastify";
import PropertyExpenseModal from "./PropertyExpenseModal";
import { Pencil } from "lucide-react";
import {
  useExpensesByPropertyId,
  useCreatePropertyExpense,
  useUpdatePropertyExpense,
  useDeletePropertyExpense,
} from "./services";
import PropertyExpenseFilter from "./PropertyExpenseFilter";
const DEFAULT_EXPENSE_FILTERS = {
  expenseType: "",
  fromDate: "",
  toDate: "",
};

const PropertyExpenses = () => {
  const { propertyId } = useParams();

  const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
  const { filters, setFilters, resetFilters, removeFilter } =
    usePersistedFilters(
      `property_expense_filters_${propertyId}`,
      DEFAULT_EXPENSE_FILTERS,
    );
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem(
      `property_expense_page_${propertyId}`,
    );

    return savedPage ? Number(savedPage) : 1;
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(DEFAULT_EXPENSE_FILTERS);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const {
    data: expenseResponse,
    isLoading,
    isFetching,
  } = useExpensesByPropertyId({
    propertyId,
    page: currentPage,
    limit: rowsPerPage,
    search,
    filters,
  });

  const expenses = expenseResponse?.data || [];
  const totalPages = expenseResponse?.pagination?.totalPages || 1;
  const totalAmount = expenseResponse?.summary?.totalExpenses || 0;

  const createExpenseMutation = useCreatePropertyExpense();
  const updateExpenseMutation = useUpdatePropertyExpense();
  const deleteExpenseMutation = useDeletePropertyExpense();
  const [deleteExpense, setDeleteExpense] = useState(null);
  const openCreateModal = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };

  useEffect(() => {
    localStorage.setItem(
      `property_expense_page_${propertyId}`,
      String(currentPage),
    );
  }, [currentPage, propertyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [propertyId]);

  /*
   * Connect your property expense API here.
   *
   * Replace this array with the API response for propertyId.
   * Replace false with the API's actual loading state.
   */

  const filterLabels = useMemo(() => {
    const labels = [];

    if (filters.expenseType) {
      labels.push({
        key: "expenseType",
        label: `Expense Category: ${filters.expenseType}`,
      });
    }

    if (filters.fromDate) {
      labels.push({
        key: "fromDate",
        label: `From: ${filters.fromDate}`,
      });
    }

    if (filters.toDate) {
      labels.push({
        key: "toDate",
        label: `To: ${filters.toDate}`,
      });
    }

    return labels;
  }, [filters]);

  const hasActiveFilters = filterLabels.length > 0;

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchValue = search.trim().toLowerCase();

      const matchesSearch = [
        expense.category,
        expense.description,
        expense.amount,
        expense.createdBy,
        expense.expenseDate,
        expense.paymentMode,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchValue),
      );

      const matchesType =
        !filters.expenseType ||
        expense.category
          ?.toLowerCase()
          .includes(filters.expenseType.toLowerCase());

      const expenseDate = expense.expenseDate
        ? new Date(expense.expenseDate).toISOString().slice(0, 10)
        : "";

      const matchesFromDate =
        !filters.fromDate || (expenseDate && expenseDate >= filters.fromDate);

      const matchesToDate =
        !filters.toDate || (expenseDate && expenseDate <= filters.toDate);

      return matchesSearch && matchesType && matchesFromDate && matchesToDate;
    });
  }, [expenses, search, filters]);

  const totalRecords = filteredExpenses.length;

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredExpenses.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredExpenses, currentPage, rowsPerPage]);

  const handleReset = () => {
    resetFilters();
    setDraftFilters(DEFAULT_EXPENSE_FILTERS);
    setSearch("");
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const handleRemoveFilter = (key) => {
    removeFilter(key);
    setCurrentPage(1);
  };

  const handleApplyFilters = (data) => {
    setFilters(data);
    setDraftFilters(data);
    setCurrentPage(1);
  };

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  const handleExpenseSubmit = async (data) => {
    try {
      const payload = {
        propertyId,
        category: data.expenseCategory,
        expenseDate: data.expenseDate
          ? data.expenseDate.toISOString().split("T")[0]
          : "",
        amount: Number(data.amount),
        paymentMode: data.paymentMode,
        comment: data.comment?.trim() || "",
      };

      if (editingExpense?._id) {
        await updateExpenseMutation.mutateAsync({
          id: editingExpense._id,
          data: payload,
        });
        toast.dismiss();
        toast.success("Property expense updated successfully");
      } else {
        await createExpenseMutation.mutateAsync(payload);
        toast.dismiss();
        toast.success("Property expense added successfully");
      }

      closeExpenseModal();
    } catch (error) {
      console.error(
        "Property expense save error:",
        error.response?.data || error,
      );
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to save property expense",
      );
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteExpense?._id) return;

    try {
      await deleteExpenseMutation.mutateAsync(deleteExpense._id);
      toast.dismiss();
      toast.success("Property expense deleted successfully");
      setDeleteExpense(null);
    } catch (error) {
      console.error(
        "Property expense delete error:",
        error.response?.data || error,
      );
      toast.dismiss();
      toast.error(
        error.response?.data?.message || "Failed to delete property expense",
      );
    }
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/properties"
                className="p-2 rounded-lg border hover:bg-gray-100"
                title="Back to properties"
              >
                <ArrowLeft size={18} />
              </Link>

              <div>
                <h1 className="text-2xl font-bold uppercase">
                  Property Expenses
                </h1>
                <p className="text-sm text-gray-500">
                  Manage expenses for this property
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="theme-btn inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white hover:bg-gray-700"
            >
              <Plus size={17} />
              Add Property Expense
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH, FILTER CHIPS AND FILTER BUTTON */}
          <div className="px-3 py-2 border-b border-gray-400 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search property expenses..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
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
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-end rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
              <span className="text-sm font-medium text-gray-600">
                Total Expenses:
              </span>
              <span className="ml-2 text-base font-semibold text-gray-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            {/* FILTER CHIPS */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm"
                >
                  <span className="mr-2 font-medium text-slate-700">
                    {filter.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveFilter(filter.key)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove ${filter.label}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* RESET AND FILTER BUTTONS */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={openFilters}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="sticky top-0 z-20 bg-gray-100">
                <tr>
                  <th className="p-3 text-left min-w-[60px]">Sr. No.</th>
                  <th className="p-3 text-left min-w-[150px]">Date</th>
                  <th className="p-3 text-left min-w-[180px]">
                    Expense Category
                  </th>
                  <th className="p-3 text-left min-w-[100px]">Payment Mode</th>
                  {/* <th className="p-3 text-left min-w-[300px]">Comments</th> */}
                  <th className="p-3 text-right min-w-[90px]">Amount</th>
                  <th className="p-3 text-left min-w-[250px]">Work Log</th>
                  {/* <th className="p-3 text-left min-w-[300px]">Description</th> */}

                  {/* <th className="p-3 text-left min-w-[80px]">Created By</th> */}
                  <th className="p-3 text-left min-w-[100px]">Action</th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton rows={8} columns={6} />
              ) : (
                <tbody>
                  {paginatedExpenses.length > 0 ? (
                    paginatedExpenses.map((expense, index) => (
                      <tr
                        key={expense._id || index}
                        className="border-t border-gray-300 hover:bg-gray-50"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="p-3">
                          {expense.expenseDate ? (
                            <span className="font-bold">
                              {new Date(expense.expenseDate).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="p-3">{expense.category || "-"}</td>

                        {/* <td className="p-3 whitespace-pre-line">
                          {expense.description || "-"}
                        </td> */}

                        <td className="p-3">
                          {expense.paymentMode ? (
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                expense.paymentMode === "Cash"
                                  ? "bg-green-100 text-green-700"
                                  : expense.paymentMode === "Bank"
                                    ? "bg-blue-100 text-blue-700"
                                    : expense.paymentMode === "UPI"
                                      ? "bg-purple-100 text-purple-700"
                                      : expense.paymentMode === "Cheque"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  expense.paymentMode === "Cash"
                                    ? "bg-green-500"
                                    : expense.paymentMode === "Bank"
                                      ? "bg-blue-500"
                                      : expense.paymentMode === "UPI"
                                        ? "bg-purple-500"
                                        : expense.paymentMode === "Cheque"
                                          ? "bg-amber-500"
                                          : "bg-gray-500"
                                }`}
                              />
                              {expense.paymentMode}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="p-3 text-right font-medium">
                          ₹{Number(expense.amount || 0).toLocaleString("en-IN")}
                        </td>
                        {/* Work Log */}
                        <td className="p-3">
                          {expense.workLogs?.length > 0 ? (
                            <div className="group relative max-w-[230px]">
                              <p className="truncate cursor-pointer text-sm text-gray-700">
                                {expense.workLogs[expense.workLogs.length - 1]
                                  .message || "-"}
                              </p>

                              {/* Full work log history on hover */}
                              <div className="invisible absolute left-0 top-full z-50 mt-1 w-[350px] max-w-[400px] rounded-lg border border-gray-200 bg-white p-3 opacity-0 shadow-xl transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                                <h4 className="mb-2 border-b pb-2 text-sm font-semibold text-gray-800">
                                  Work Log History
                                </h4>

                                <div className="max-h-60 space-y-3 overflow-y-auto">
                                  {[...expense.workLogs]
                                    .reverse()
                                    .map((log, index) => (
                                      <div
                                        key={log._id || index}
                                        className="border-b border-gray-100 pb-2 last:border-0"
                                      >
                                        <p className="text-xs text-gray-500">
                                          {log.createdBy || "System"} •{" "}
                                          {log.createdAt
                                            ? new Date(
                                                log.createdAt,
                                              ).toLocaleString("en-IN")
                                            : "-"}
                                        </p>

                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                                          {log.message || "-"}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No work logs
                            </span>
                          )}
                        </td>
                        {/* <td className="p-3">
                          {expense.comment ? (
                            <div className="group relative max-w-[280px]">
                              <p className="truncate text-sm text-gray-700 cursor-pointer">
                                {expense.comment}
                              </p>

                            
                              <div className="invisible absolute left-0 top-full z-50 mt-1 w-max max-w-[400px] whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 opacity-0 shadow-xl transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                                {expense.comment}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </td> */}

                        {/* <td className="p-3">{expense.createdBy || "-"}</td> */}

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(expense)}
                              className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                              title="Edit expense"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteExpense(expense)}
                              disabled={deleteExpenseMutation.isPending}
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
                      <td colSpan={6}>
                        <NoDataFound
                          title="No Expenses Found"
                          description="No expenses are available for this property."
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* PAGINATION AND TOTAL */}
          <div className="border-t p-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex flex-wrap gap-4">
              <span className="text-sm text-gray-500">
                Showing{" "}
                {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
                {Math.min(currentPage * rowsPerPage, totalRecords)} of{" "}
                {totalRecords}
              </span>

              <span className="text-sm text-gray-500">
                Total expenses: {totalRecords}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* <span className="text-sm font-semibold">
                Total: ₹{totalAmount.toLocaleString("en-IN")}
              </span> */}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <PropertyExpenseModal
        isOpen={expenseModalOpen}
        onClose={closeExpenseModal}
        onSubmit={handleExpenseSubmit}
        initialData={editingExpense}
        isSaving={
          createExpenseMutation.isPending || updateExpenseMutation.isPending
        }
      />
      <ConfirmModal
        isOpen={!!deleteExpense}
        title="Delete Property Expense"
        message={
          deleteExpense
            ? `Are you sure you want to permanently delete the "${deleteExpense.category || "Expense"}" expense? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteExpense}
        onCancel={() => {
          if (deleteExpenseMutation.isPending) return;
          setDeleteExpense(null);
        }}
      />
      <PropertyExpenseFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
        handleReset={handleReset}
        initialFilters={filters}
        apiData={expenses}
      />
    </>
  );
};

export default PropertyExpenses;