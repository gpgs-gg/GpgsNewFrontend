import { useState, useMemo } from "react";
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
import BedFilter from "../beds/BedFilter";
import MapBankTransactionDrawer from "./MapBankTransactionDrawer";

const BankTransactionList = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = PAGINATION.BEDS_PER_PAGE || 10;
  const debouncedSearch = useDebounce(search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: apiResponse, isLoading } = useBankTransactionData();
  const apiData = apiResponse?.data || [];

  const totalPages = apiResponse?.totalPages || 1;
  const totalRecords = apiResponse?.totalRecords || 0;

  const paginatedData = apiData;

  const handleReset = () => {
    setFilters({});
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };

  return (
    <>
      <div className="space-y-5">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Bank Transactions</h1>
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
                        <div className="truncate" title={item.narration}>
                          {item.narration}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        {item.chqNo || "-"}
                      </td>

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

                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 bg-blue-100 rounded hover:bg-blue-200">
                            <Eye size={16} />
                          </button>

                          <button className="p-2 bg-yellow-100 rounded hover:bg-yellow-200">
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTransaction(item);
                              setDrawerOpen(true);
                            }}
                            className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                          >
                            Link Payment
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
      <BedFilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        onApply={(data) => {
          setFilters(data);
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