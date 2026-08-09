import { useState, useMemo } from "react";
import { FiCopy } from "react-icons/fi";
import { Eye, Pencil, Filter, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { formatDate } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { useBedsData } from "./services";
import { PAGINATION } from "../../constants/appConfig";
import useDebounce from "../hooks/useDebounce";
import { useBankTransactionData } from "./services";
import MapBankTransactionDrawer from "./MapBankTransactionDrawer";
import BankTransactionFilter from "./BankTranscationFilter";
import { toast } from "react-toastify";

const BankTransactionList = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = PAGINATION.BEDS_PER_PAGE || 10;
  const debouncedSearch = useDebounce(search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Filter chips state
  const [filterLabels, setFilterLabels] = useState([]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [defaultFilterData, setDefaultFilterData] = useState(null);
  // fetch data with pagination, search and filters
  const { data: apiResponse } = useBankTransactionData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    filters,
  });
  const apiData = apiResponse?.data || [];

  const totalPages = apiResponse?.totalPages || 1;

  const totalRecords = apiResponse?.totalRecords || 0;

  const paginatedData = apiData;
  const applyTransactionType = (type) => {
    setFilters((prev) => ({
      ...prev,
      transactionType: type,
    }));

    setFilterLabels((prev) => {
      const remaining = prev.filter((item) => item.key !== "transactionType");

      return [
        ...remaining,
        {
          key: "transactionType",
          label: `Type : ${type === "deposit" ? "Deposit" : "Withdrawal"}`,
        },
      ];
    });

    setCurrentPage(1);
  };
  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);
    setDefaultFilterData(null);

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
  const handleTodayTransactions = () => {
    const today = formatDate(new Date()); // should return YYYY-MM-DD

    const data = {
      fromDate: today,
      toDate: today,
      defaultFilter: true,
    };

    setFilters(data);
    setDefaultFilterData(data);
    setCurrentPage(1);
  };
  const convertToApiDate = (date) => {
    return date.toISOString().split("T")[0];
  };
  const today = convertToApiDate(new Date());

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.dismiss()
      toast.success(`${text} copied!`);
    } catch (error) {
      toast.error("Failed to copy.");
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
                Bank Transactions
              </h1>
              <p className="text-sm text-gray-500">Manage All Transactions</p>
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
          {/* SEARCH */}
          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* Search */}
            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search transaction..."
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

            {/* Filter Chips */}
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
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {/* todays transaction */}
            {/* <button
              onClick={handleTodayTransactions}
              className="theme-btn px-4 py-2 rounded-lg whitespace-nowrap"
            >
              Today's Transactions
            </button> */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyTransactionType("deposit")}
                className={`px-4 py-2 rounded-lg border ${filters.transactionType === "deposit"
                  ? "bg-green-600 text-white"
                  : "bg-white"
                  }`}
              >
                Deposit
              </button>

              <button
                onClick={() => applyTransactionType("withdrawal")}
                className={`px-4 py-2 rounded-lg border ${filters.transactionType === "withdrawal"
                  ? "bg-red-600 text-white"
                  : "bg-white"
                  }`}
              >
                Withdrawal
              </button>
            </div>
            {/* Buttons */}
            <div className="flex gap-2">
              {(Object.keys(filters).length > 0 ||
                filters.transactionType ||
                search) && (
                  <button
                    onClick={handleReset}
                    className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                  >
                    Reset
                  </button>
                )}

              <button
                onClick={() => {
                  setFilterOpen(true);
                }}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 whitespace-nowrap">
                <tr>
                  <th className="p-3 text-center">Date</th>
                  <th className="p-3 text-left">Narration</th>
                  <th className="p-3 text-center">Cheque / Ref No.</th>
                  <th className="p-3 text-right">Withdrawal</th>
                  <th className="p-3 text-right">Deposit</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Value Date</th>
                  <th className="p-3 text-center">Source</th>
                  <th className="p-3 text-center">Uploaded By</th>
                  <th className="p-3 text-center">Created At</th>
                  <th className="p-3 text-center">Link Payment</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <td className="p-3 text-center">
                        {formatDate(item.date)}
                      </td>

                      <td className="p-3 max-w-md">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 truncate"
                            title={item.narration}
                          >
                            {item.narration}
                          </div>
                        
                            <button
                              type="button"
                              onClick={() => handleCopy(item.narration)}
                              className="text-gray-500 hover:text-blue-600 transition-colors"
                              title="Copy narration"
                            >
                              <FiCopy size={16} />
                            </button>
                          
                        </div>
                      </td>

                      <td className="p-3 text-center">{item.chqNo || "-"}</td>

                      <td className="p-3 text-right text-red-600 font-medium">
                        {item.withdrawal
                          ? Number(item.withdrawal).toLocaleString("en-IN")
                          : "-"}
                      </td>

                      <td className="p-3 text-right text-green-600 font-medium">
                        {item.deposit
                          ? Number(item.deposit).toLocaleString("en-IN")
                          : "-"}
                      </td>

                      <td className="p-3 text-right font-semibold">
                        {Number(item.balance || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-3 text-center">
                        {formatDate(item.valueDate)}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                          {item.source}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {item.userId?.fullName || "-"}
                      </td>

                      <td className="p-3 text-center">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-3 text-center">
                     
                          <button
                            onClick={() => {
                              setSelectedTransaction(item);
                              setDrawerOpen(true);
                            }}
                            className={`px-3 py-1 rounded ${item?.isMapped ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"}  text-white text-sm `}
                          >
                            {item?.isMapped ? "Link Payment" : "Link Payment"} 
                          </button>
            
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 bg-blue-100 rounded hover:bg-blue-200">
                            <Eye size={16} />
                          </button>

                          <button className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                            <Pencil size={16} />
                          </button>


                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="h-64">
                      <div className="flex justify-center items-center h-full">
                        <NoDataFound
                          title="No Transactions Found"
                          description="Upload a bank statement to get started."
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
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
      <BankTransactionFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        filters={filters}
        onApply={(data, labels) => {
          setFilters(data);
          setFilterLabels(labels);
          setCurrentPage(1);
        }}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
      <MapBankTransactionDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default BankTransactionList;