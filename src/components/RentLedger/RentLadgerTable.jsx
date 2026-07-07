
import { useState, useMemo } from "react";
import { Eye, Pencil, Filter, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { formatDate } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import RentLadgerFiilter from "./RentLadgerFiilter";
import { useParams } from "react-router-dom";
import { useRentHistoryData } from "./services";
const RentLadgerTable = () => {
  const { clientId } = useParams();
  const { data: apiResponse } = useRentHistoryData(clientId);
  // API response
  const client = apiResponse?.data?.[0]?.clientId ?? {};
  const property = apiResponse?.data?.[0]?.propertyId ?? {};
  const bed = apiResponse?.data?.[0]?.bedId ?? {};
  // ✅ safe extraction
  const apiData = apiResponse?.data || [];
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);
  const rowsPerPage = 10;
  // ✅ filter & search logic
  const filteredData = useMemo(() => {
    return apiData?.filter((item) => {
      console.log(item)
      const matchesSearch =
        !search ||
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        );


      return (
        (!filters.propertyCode ||
          item.propertyCode === filters.propertyCode) &&
        (!filters.propertyLocation ||
          item.propertyLocation === filters.propertyLocation) &&
        (!filters.bedCount ||
          String(item.bedCount) === String(filters.bedCount)) &&
        (!filters.status ||
          item.status === filters.status) &&
        matchesSearch
      );
    });
  }, [apiData, filters, search, clientId]);



  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredData, currentPage]);


  const handleReset = () => {
    setFilters({});
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };
  const currentMonth = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const currentYear = new Date().getFullYear();
  return (
    <>
      <div className="space-y-5">

        {/* HEADER */}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
          <div className="flex items-center justify-between mb-2  ">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.fullName} ( Payment History & Details )
              </h1>

              {!clientId && (
                <p className="text-sm text-gray-500 mt-1">
                  Manage all PG Rent
                </p>
              )}
            </div>
          </div>

          {clientId && client && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Client Name
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {client.fullName}
                </p>
              </div> */}

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Contact No.
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {client.callingNo}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date of Joining
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatDate(client.clientDoj)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Property Code
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {property?.propertyCode ?? "-"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Room / Bed
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {bed?.roomNo} / {bed?.bedNo}
                </p>
              </div>

            </div>
          )}
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
                  <th className="p-3 text-center">Property</th>
                  <th className="p-3 text-center">Pay Status</th>
                  <th className="p-3 text-center">Month</th>
                  <th className="p-3 text-center">Year</th>
                  {/* <th className="p-3 text-center">Stay Type</th> */}
                  <th className="p-3 text-center">Current Due</th>
                  <th className="p-3 text-center">Total Received</th>
                  <th className="p-3 text-center">Total Receivable</th>
                  <th className="p-3 text-center">Rent Amount</th>
                  <th className="p-3 text-center">Days Count</th>
                  <th className="p-3 text-center">EB Amount</th>
                  <th className="p-3 text-center">Adj. EB</th>
                  <th className="p-3 text-center">Previous Due</th>
                  <th className="p-3 text-center">Parking Charges</th>
                  <th className="p-3 text-center">Deposit</th>
                  <th className="p-3 text-center">Processing Fee</th>
                  <th className="p-3 text-center">Adj. Amount</th>
                  <th className="p-3 text-center">Flat EB</th>
                  <th className="p-3 text-center">Monthly Rent</th>

                  <th className="p-3 text-center">Payment Comments</th>
                  <th className="p-3 text-center">Remarks</th>

                  {/* Sticky Header */}
                  <th className="p-3 text-center sticky right-0 bg-gray-100 z-30 min-w-37.5 shadow-[-4px_0_6px_rgba(0,0,0,0.1)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (

                    <tr
                      key={item._id}
                      className={`border-t border-gray-200 whitespace-nowrap text-center
    ${item.monthName === currentMonth && item.year === currentYear  && item.paymentStatus !== "Shifted"
                          ? "bg-green-100 hover:bg-green-100"
                          : "hover:bg-gray-50"
                        }`}
                    >

                      <td className="p-3 font-bold">{item.propertyId?.propertyCode}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold
                             ${item.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-700"
                              : item.paymentStatus === "Partial"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.paymentStatus === "Shifted"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>

                      <td className="p-3 font-bold">{item.monthName}</td>
                      <td className="p-3">{item.year}</td>
                      {/* <td className="p-3">{item.stayType}</td> */}
                      <td
                        className={`p-3 font-semibold ${item.currentDue > 0
                          ? "text-red-600"
                          : item.currentDue < 0
                            ? "text-green-600"
                            : "text-gray-700"
                          }`}
                      >
                        ₹{item.currentDue}
                      </td>
                      <td className="p-3 text-green-600">₹{item.totalReceived}</td>
                      <td className="p-3 font-semibold">₹{item.totalReceivable}</td>
                      <td className="p-3">₹{item.rentAmt}</td>
                      <td className="p-3">{item.daysCount}</td>
                      <td className="p-3">₹{item.ebAmt}</td>
                      <td className="p-3">₹{item.adjEB}</td>
                      <td className="p-3">₹{item.previousDue}</td>
                      <td className="p-3">₹{item.parkingCharges}</td>
                      <td className="p-3">₹{item.depositAmount}</td>
                      <td className="p-3">₹{item.processingFees}</td>
                      <td className="p-3">₹{item.adjAmt}</td>
                      <td className="p-3">₹{item.flatEB}</td>
                      <td className="p-3">₹{item.monthlyRent}</td>


                      {/* <td className="p-3">₹{item.parkingChargesReceived}</td> */}
                      {/* <td className="p-3">₹{item.parkingChargesDue}</td> */}

                      {/* <td className="p-3">₹{item.processingFeesReceived}</td> */}
                      {/* <td className="p-3">₹{item.processingFeesDue}</td> */}

                      {/* <td className="p-3">₹{item.depositAmountReceived}</td> */}
                      {/* <td className="p-3">₹{item.depositAmountDue}</td> */}



                      {/* <td className="p-3">
                        {item.rentDOJ ? formatDate(item.rentDOJ) : "-"}
                      </td>

                      <td className="p-3">
                        {item.ebDOJ ? formatDate(item.ebDOJ) : "-"}
                      </td> */}


                      <td className="p-3">{item.paymentComments || "-"}</td>

                      <td className="p-3">{item.remarks || "-"}</td>

                      {/* Sticky Actions Column */}
                      <td
                        className={`p-3 sticky right-0 z-10 shadow-[-4px_0_6px_rgba(0,0,0,0.05)] ${item.monthName === currentMonth && Number(item.year) === currentYear && item.paymentStatus !== "Shifted"
                            ? "bg-green-100"
                            : "bg-white"
                          }`}
                      >
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/rent-ledger/view/${item._id}`}
                          >
                            <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                              <Eye size={16} />
                            </button>
                          </Link>

                          <Link
                            to={`/rent-ledger/edit/${item._id}`}
                          >
                            <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          {/* 
                          <button
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            className="p-2 bg-red-100 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button> */}
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="h-64">
                      <div className="flex items-center justify-center h-full">
                        <NoDataFound
                          title="No Rent History Found"
                          description="No rent history available for this client."
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
              {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
              {filteredData.length}
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

          </div>

        </div>
      </div>

      <RentLadgerFiilter
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        apiData={apiData}
        onApply={(data) => setFilters(data)}
        handleReset={handleReset}
        resetTrigger={resetTrigger}
      />
    </>
  );
};

export default RentLadgerTable;