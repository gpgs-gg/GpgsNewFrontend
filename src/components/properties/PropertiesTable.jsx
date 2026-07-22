import { useState, useMemo } from "react";
import {
  Eye,
  Pencil,
  Filter,
  Phone,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import PropertyFilter from "./PropertyFilter";
import NoDataFound from "../common/NoDataFound";
import { usePropertiesData } from "./services";
import { formatDate } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { PAGINATION } from "../../constants/appConfig";
import TableSkeleton from "../../components/common/TableSkelton";
import useDebounce from "../hooks/useDebounce";
import {
  useDeletePropertyData,
  useDeleteMultiplePropertiesData,
} from "./services/index";
import ConfirmModal from "../Common/ConfirmModal";
import { toast } from "react-toastify";

const PropertiesTable = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const debouncedSearch = useDebounce(search);
  const rowsPerPage = PAGINATION.PROPERTIES_PER_PAGE || 10;
  const { data: apiResponse, isLoading } = usePropertiesData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });
  // ✅ safe extraction
  const apiData = apiResponse?.data || [];
  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || 0;
  const paginatedData = apiData;
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState("single");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const { mutate: deleteProperty, isPending: deleting } =
    useDeletePropertyData();

  const { mutate: deleteMultipleProperties } =
    useDeleteMultiplePropertiesData();
  const isAllSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedProperties.includes(item._id));

  // One State for Filter chips
  const [filterLabels, setFilterLabels] = useState([]);
  // Handle Reset
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
  // Handle Delete

const handleDelete = () => {
  if (deleteType === "single") {
    deleteProperty(deleteId, {
      onSuccess: (data) => {
        toast.success(data?.message || "Property deleted successfully.");

        setDeleteId(null);
        setShowDeleteModal(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete property."
        );
      },
    });
  } else {
    deleteMultipleProperties(selectedProperties, {
      onSuccess: (data) => {
        toast.success(
          data?.message || "Selected properties deleted successfully."
        );

        setSelectedProperties([]);
        setShowDeleteModal(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message ||
            "Failed to delete selected properties."
        );
      },
    });
  }
};
  // Handle Select
  const handleSelect = (id) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };
  const handleSelectAll = () => {
    const currentPageIds = paginatedData.map((item) => item._id);

    const isAllSelected = currentPageIds.every((id) =>
      selectedProperties.includes(id),
    );

    if (isAllSelected) {
      // Remove only current page selections
      setSelectedProperties((prev) =>
        prev.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      // Add only missing ids
      setSelectedProperties((prev) => [
        ...new Set([...prev, ...currentPageIds]),
      ]);
    }
  };
  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">
                Properties Master
              </h1>
              <p className="text-sm text-gray-500">Manage all PG properties</p>
            </div>

            <Link to="/properties/create">
              <button className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                + Add Property
              </button>
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">
          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* Search */}

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
            {/* Reset Button */}
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
          {/* Show Delete Selected Button */}
          {selectedProperties.length > 0 && (
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
          )}
          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100">
                <tr>
                  <th className="p-3 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-red-600"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3 text-left">Property Code</th>
                  <th className="p-3 text-left">Beds Count</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">ConsumerId</th>
                  <th className="p-3 text-left">InternetVendorContact</th>
                  <th className="p-3 text-left">Property Start Date</th>
                  <th className="p-3 text-left">Property End Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              {isLoading ? (
                <TableSkeleton rows={8} columns={7} showStatus showActions />
              ) : (
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr
                        key={item._id}
                        className="border-t border-gray-300 hover:bg-gray-50"
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer accent-red-600"
                            checked={selectedProperties.includes(item._id)}
                            onChange={() => handleSelect(item._id)}
                          />
                        </td>
                        <td className="p-3 font-semibold">
                          {item.propertyCode}
                        </td>

                        <td className="p-3">{item.bedCount}</td>

                        <td className="p-3">{item.propertyLocation}</td>

                        <td className="p-3">{item?.internet?.consumerId}</td>

                        <td className="p-3">
                          <div className="flex flex-col gap-2">
                            {item?.internet?.contactNo1 && (
                              <div className="flex items-center gap-2">
                                <span>{item.internet.contactNo1}</span>
                                <a
                                  href={`tel:${item.internet.contactNo1}`}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Call"
                                >
                                  <IoIosCall size={19} />
                                </a>

                                <a
                                  href={`https://wa.me/91${item.internet.contactNo1}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-800"
                                  title="WhatsApp"
                                >
                                  <FaWhatsapp size={16} />
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          {formatDate(item?.agreement?.propertyStartDate)}
                        </td>

                        <td className="p-3">
                          {formatDate(item?.agreement?.propertyEndDate)}
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

                        <td className="p-3">
                          <div className="flex justify-center gap-2">
                            <Link to={`/properties/edit/${item._id}`}>
                              {/* <Link to={`/properties/view/${item._id}`}> */}
                              <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <Link to={`/properties/edit/${item._id}`}>
                              <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                                <Pencil size={16} />
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setDeleteType("single");
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
                      <td colSpan={7}>
                        <NoDataFound
                          title="No Properties Found"
                          description="Try searching different keywords"
                        />
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
      <PropertyFilter
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
            ? "Delete Property"
            : `Delete ${selectedProperties.length} Properties`
        }
        message={
          deleteType === "single"
            ? "This property will be permanently deleted."
            : `You are about to permanently delete ${selectedProperties.length} properties. This action cannot be undone.`
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

export default PropertiesTable;