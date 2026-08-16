import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Filter,
  Search,
  Pencil,
  Trash2,
  Eye,
  MoveRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import TableSkeleton from "../../components/common/TableSkelton";
import {
  useMasterData,
  useDeleteMasterData,
} from "./services/index";
import Pagination from "../Common/Pagination";
import useDebounce from "../hooks/useDebounce";
import ConfirmModal from "../Common/ConfirmModal";
// import OptionsFilter from "./OptionsFilter";
import { toast } from "react-toastify";

const OptionsTable = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({});

  const [filterLabels, setFilterLabels] = useState([]);

  const [resetTrigger, setResetTrigger] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);

  const rowsPerPage = 10;
  const debouncedSearch = useDebounce(search);
  const { data: masterData, isLoading } = useMasterData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });

  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: deleteMaster, isPending: deleting } = useDeleteMasterData();
  const apiData = masterData?.data || [];

  const totalPages = masterData?.totalPages || 1;

  const totalRecords = masterData?.totalRecords || 0;
  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFilterLabels((prev) => prev.filter((item) => item.key !== key));

    setCurrentPage(1);
  };
  const handleDelete = () => {
    if (!deleteId) return;

    deleteMaster(deleteId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Master data deleted successfully.");
        setDeleteId(null);
        setShowDeleteModal(false);
      },

      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete master data.",
        );
      },
    });
  };
  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };
  return (
    <>
      <div className="space-y-5">
        {/* Header */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">dYNAMIC oPTIONS</h1>

              <p className="text-sm text-gray-500">
                Manage all global dropdown options
              </p>
            </div>
            <Link to="/options/create">
              <button className="theme-btn text-white px-4 py-2 hover:bg-gray-700 rounded-lg">
                + Add Options
              </button>
            </Link>
          </div>
        </div>

        {/* Table */}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* Search */}

          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* serach */}
            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search category , Descri..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {search && (
                <button
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
            {/* Show Added Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  <span className="mr-2 font-medium text-slate-700">
                    {filter.label}
                  </span>
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove ${filter.label}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {/* Reset Button */}
            <div className="flex gap-2">
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                >
                  Reset
                </button>
              )}

              {/* <button
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button> */}
            </div>
          </div>
          {/* Show Delete Selected Button */}
          {/* {selectedProperties.length > 0 && (
            <button
              onClick={() => {
                setDeleteType("bulk");
                setShowDeleteModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition-all duration-200 hover:bg-red-100 hover:border-red-300 hover:shadow"
            >
              <Trash2 size={18} />
              <span>Delete Selected</span>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">
                {selectedProperties.length}
              </span>
            </button>
          )} */}

          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-20">
                <tr>
                  <th className="p-3 text-left">Category</th>

                  <th className="p-3 text-center">Total Options</th>

                  {/* <th className="p-3 text-center">Active Options</th> */}

                  <th className="p-3 text-left">Description</th>

                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      <TableSkeleton rows={8} columns={13} />
                    </td>
                  </tr>
                ) : apiData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center">
                      No Records Found
                    </td>
                  </tr>
                ) : (
                  apiData.map((category) => {
                    const totalOptions = category.items?.length || 0;

                    const activeOptions =
                      category.items?.filter((item) => item.isActive).length ||
                      0;

                    return (
                      <tr
                        key={category._id}
                        className="border-t border-gray-300 hover:bg-gray-50 transition"
                      >
                        {/* Category */}
                        <td className="p-3">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {category.categoryName}
                            </p>

                            {/* <p className="text-xs text-gray-500">
                            {category.categoryKey}
                          </p> */}
                          </div>
                        </td>

                        {/* Total Options */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              setExpandedRow(
                                expandedRow === category._id
                                  ? null
                                  : category._id,
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-md  bg-white px-3 py-1.5 text-sm font-medium text-gray-900 mb-2  transition-all duration-200 "
                          >
                            <span>
                              {expandedRow === category._id
                                ? "Hide"
                                : `Options (${totalOptions})`}
                            </span>

                            {expandedRow === category._id ? (
                              <ChevronDown
                                size={16}
                                className="transition-transform duration-200"
                              />
                            ) : (
                              <ChevronRight size={16}
                                className="transition-transform duration-200"
                              />
                            )}
                          </button>

                          {/* Expanded Row */}
                          {expandedRow === category._id && (
                            <div className="flex justify-center   rounded-2xl italic items-start text-start">
                              <div className="space-y-2">
                                {category.items?.length > 0 ? (
                                  category.items.map((item, index) => (
                                    <div
                                      key={item._id || index}
                                      className="rounded-md border-gray-200 px-3 py-1 text-sm "
                                    >
                                      {item.label}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    No options found.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Active Options */}
                        {/* <td className="p-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold">
                            {activeOptions}
                          </span>
                        </td> */}

                        {/* Description */}
                        {/* Description */}
                        <td className="p-3">
                          <div className="group relative max-w-xs">
                            <p className="line-clamp-2 text-sm text-gray-600">
                              {category.description || "-"}
                            </p>

                            {category.description && (
                              <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-80 rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-xl group-hover:block">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Link to={`/options/edit/${category._id}`}>
                              {/* <Link to={`/properties/view/${item._id}`}> */}
                              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <button
                              onClick={() =>
                                navigate(`/options/edit/${category._id}`)
                              }
                              className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(category._id);
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}

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
      {/* <OptionsFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={(filters, labels) => {
          setFilters(filters);
          setFilterLabels(labels);
          setCurrentPage(1);
        }}
        resetTrigger={resetTrigger}
        apiData={apiData}
      /> */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete this options data"
        message="This data category will be permanently deleted. This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        loading={deleting}
      />
    </>
  );
};

export default OptionsTable;