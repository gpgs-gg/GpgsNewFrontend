
import React, { useState, useMemo } from "react";
import { Eye, Filter } from "lucide-react";

import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import useDebounce from "../hooks/useDebounce";
import { useEBCalculations } from "./services";

function EBCalculationData() {
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Expanded client details row
  const [expandedRow, setExpandedRow] = useState(null);

  const rowsPerPage = 10;

  // ============================================================
  // GET EB CALCULATIONS
  // ============================================================

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useEBCalculations();

  // API se actual data
  const apiData = apiResponse?.data || [];

  // ============================================================
  // SEARCH
  // ============================================================

  const debouncedSearch = useDebounce(search);

  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return apiData;
    }

    const searchValue = debouncedSearch.toLowerCase().trim();

    return apiData.filter((item) => {
      // Property Code
      const propertyMatch =
        item.PropertyCode?.toLowerCase().includes(searchValue);

      // EB Dates
      const dateMatch =
        item.EBStartDate?.toLowerCase().includes(searchValue) ||
        item.EBEndDate?.toLowerCase().includes(searchValue);

      // Clients
      const clientMatch = item.clients?.some((client) => {
        return (
          client.ClientName?.toLowerCase().includes(searchValue) ||
          client.RoomNo?.toLowerCase().includes(searchValue) ||
          client.BedNo?.toLowerCase().includes(searchValue) ||
          client.ClientID?.toString()
            .toLowerCase()
            .includes(searchValue)
        );
      });

      return propertyMatch || dateMatch || clientMatch;
    });
  }, [apiData, debouncedSearch]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalRecords = filteredData.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalRecords / rowsPerPage)
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  // ============================================================
  // SEARCH PAGE RESET
  // ============================================================

  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
    setExpandedRow(null);
  };

  // ============================================================
  // RESET
  // ============================================================

  const handleReset = () => {
    setSearch("");
    setCurrentPage(1);
    setExpandedRow(null);
  };

  // ============================================================
  // EXPAND / COLLAPSE CLIENT DETAILS
  // ============================================================

  const handleExpandRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-5">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-2xl font-bold">
                EB Calculation Details
              </h1>

              <p className="text-sm text-gray-500">
                Manage all EB Calculations
              </p>
            </div>

          </div>
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh]">

          {/* ====================================================
              SEARCH
          ==================================================== */}

          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">

            <div className="relative w-80">

              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search EB Calculation..."
                value={search}
                onChange={(e) =>
                  handleSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}

            </div>

            {/* FILTER BUTTON */}

            <div className="flex gap-2">

              {search && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500 flex items-center gap-2"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button>

            </div>

          </div>

          {/* ====================================================
              TABLE CONTENT
          ==================================================== */}

          <div className="flex-1 overflow-auto">

            <table className="w-max min-w-full">

              {/* ==================================================
                  TABLE HEADER
              ================================================== */}

              <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">

                <tr>

                  <th className="p-3 text-left">
                    Property Code
                  </th>

                  <th className="p-3 text-left">
                    EB Start Date
                  </th>

                  <th className="p-3 text-left">
                    EB End Date
                  </th>

                  <th className="p-3 text-left">
                    Clients
                  </th>

                  {/* <th className="p-3 text-left">
                    Total EB
                  </th> */}

                  {/* <th className="p-3 text-left">
                    Total EB Amount
                  </th> */}

                  <th className="p-3 text-left">
                    Created Date
                  </th>

                  {/* <th className="p-3 text-left">
                    Updated Date
                  </th> */}

                  <th className="sticky right-0 bg-gray-100 p-3 text-center shadow-md">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* ==================================================
                  TABLE BODY
              ================================================== */}

              <tbody>

                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoading ? (

                  <tr>
                    <td
                      colSpan={9}
                      className="p-10 text-center text-gray-500"
                    >
                      Loading EB Calculations...
                    </td>
                  </tr>

                ) : isError ? (

                  /* =================================================
                     ERROR
                  ================================================= */

                  <tr>
                    <td
                      colSpan={9}
                      className="p-10 text-center text-red-500"
                    >
                      Failed to load EB Calculations
                    </td>
                  </tr>

                ) : paginatedData.length > 0 ? (

                  /* =================================================
                     DATA
                  ================================================= */

                  paginatedData.map((item) => {

                    // =================================================
                    // TOTAL EB
                    // =================================================

                    const totalEB =
                      item.clients?.reduce(
                        (sum, client) =>
                          sum +
                          (Number(client.TotalClientEB) || 0),
                        0
                      ) || 0;

                    // =================================================
                    // TOTAL EB AMOUNT
                    // =================================================

                    const totalEBAmt =
                      item.clients?.reduce(
                        (sum, client) =>
                          sum +
                          (Number(client.EBAmt) || 0),
                        0
                      ) || 0;

                    return (
                      <React.Fragment key={item._id}>

                        {/* =================================================
                            MAIN ROW
                        ================================================= */}

                        <tr
                          className="border-t border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                        >

                          {/* PROPERTY CODE */}

                          <td className="p-3 font-semibold">
                            {item.PropertyCode || "-"}
                          </td>

                          {/* EB START DATE */}

                          <td className="p-3">
                            {item.EBStartDate || "-"}
                          </td>

                          {/* EB END DATE */}

                          <td className="p-3">
                            {item.EBEndDate || "-"}
                          </td>

                          {/* CLIENT COUNT */}

                          <td className="p-3">

                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {item.clients?.length || 0}
                            </span>

                          </td>

                          {/* TOTAL EB */}

                          {/* <td className="p-3">
                            {Math.round(totalEB)}
                          </td> */}

                          {/* TOTAL EB AMOUNT */}

                          {/* <td className="p-3 font-semibold">
                            ₹{Math.round(totalEBAmt)}
                          </td> */}

                          {/* CREATED DATE */}

                          <td className="p-3">
                            {formatDate(item.createdAt)}
                          </td>

                          {/* UPDATED DATE */}

                          {/* <td className="p-3">
                            {formatDate(item.updatedAt)}
                          </td> */}

                          {/* ACTIONS */}

                          <td className="sticky right-0 z-20 bg-white p-3 shadow-md">

                            <div className="flex justify-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleExpandRow(item._id)
                                }
                                className={`px-2 rounded-lg transition ${expandedRow === item._id
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  }`}
                                title={
                                  expandedRow === item._id
                                    ? "Hide Client Details"
                                    : "View Client Details"
                                }
                              >
                              <div className="flex justify-center items-center gap-2">
                                 <Eye size={16} /> View
                              </div>
                              </button>

                            </div>

                          </td>

                        </tr>

                        {/* =================================================
                            CLIENT DETAILS EXPANDED ROW
                        ================================================= */}

                        {/* =================================================
    CLIENT DETAILS EXPANDED ROW
================================================= */}

                        {expandedRow === item._id && (
                          <tr className="bg-gray-50 border-t border-gray-200">
                            <td colSpan={9} className="p-4">

                              <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">

                                {/* =================================================
            PROPERTY / COMMON EB SUMMARY
        ================================================= */}

                                <div className="p-4 border-b border-gray-300">

                                  <div className="flex justify-between items-center">
                                  </div>


                                  {/* =================================================
              COMMON / PROPERTY VALUES
          ================================================= */}

                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-3">

                                    {/* FLAT TOTAL EB */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        Flat Total EB
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        {Math.round(Number(item.clients?.[0]?.FlatTotalEB) || 0)}
                                      </p>
                                    </div>


                                    {/* FLAT TOTAL UNITS */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        Flat Total Units
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.FlatTotalUnits) || 0
                                        )}
                                      </p>
                                    </div>


                                    {/* EB TO BE RECOVERED */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        EB To Be Recovered
                                      </p>
                                      <p className="font-semibold text-red-600 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.EBToBeRecovered) || 0
                                        )}
                                      </p>
                                    </div>
                                    {/* PROPERTY FREE EB */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        Total Free EB
                                      </p>
                                      <p className="font-semibold text-green-600 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.PropertyFreeEB) || 0
                                        )}
                                      </p>
                                    </div>




                                    {/* PER UNIT COST */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        Per Unit Cost
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        ₹
                                        {Number(
                                          item.clients?.[0]?.PerUnitCost
                                          || 0).toFixed(2)}
                                      </p>
                                    </div>


                                    {/* AC TOTAL EB */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        AC Total EB
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.ACTotalEB) || 0
                                        )}
                                      </p>
                                    </div>


                                    {/* AC TOTAL UNITS */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        AC Total Units
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.ACTotalUnits) || 0
                                        )}
                                      </p>
                                    </div>


                                    {/* COMMON EB */}
                                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                      <p className="text-xs text-gray-500">
                                        Common EB
                                      </p>
                                      <p className="font-semibold text-gray-800 mt-1">
                                        {Math.round(
                                          Number(item.clients?.[0]?.CommonEB) || 0
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>


                                {/* =================================================
            CLIENT DETAILS
        ================================================= */}

                                {item.clients?.length > 0 ? (

                                  <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                      <thead className="bg-gray-100">

                                        <tr>

                                          <th className="p-3 text-left">
                                            Client Name
                                          </th>

                                          <th className="p-3 text-left">
                                            Room No
                                          </th>

                                          <th className="p-3 text-left">
                                            Bed No
                                          </th>

                                          <th className="p-3 text-left">
                                            AC Room
                                          </th>

                                          {/* <th className="p-3 text-left">
                                            DOJ
                                          </th> */}

                                          <th className="p-3 text-left">
                                            Total Days
                                          </th>

                                          <th className="p-3 text-left">
                                            CEB
                                          </th>

                                          <th className="p-3 text-left">
                                            AC EB
                                          </th>

                                          <th className="p-3 text-left">
                                            Adj EB
                                          </th>

                                          <th className="p-3 text-left">
                                            Total Client EB
                                          </th>

                                          {/* <th className="p-3 text-left">
                                            EB Amount
                                          </th> */}

                                          <th className="p-3 text-left">
                                            Comments
                                          </th>

                                        </tr>

                                      </thead>


                                      <tbody>

                                        {item.clients.map((client, index) => (

                                          <tr
                                            key={client.ClientID || index}
                                            className="border-t border-gray-200 hover:bg-gray-50"
                                          >



                                            {/* CLIENT NAME */}
                                            <td className="p-3 font-semibold">
                                              {client.ClientName || "-"}
                                            </td>



                                            {/* ROOM */}
                                            <td className="p-3">
                                              {client.RoomNo || "-"}
                                            </td>


                                            {/* BED */}
                                            <td className="p-3">
                                              {client.BedNo || "-"}
                                            </td>


                                            {/* AC ROOM */}
                                            <td className="p-3">
                                              {client.ACRoom || "-"}
                                            </td>


                                            {/* DOJ */}
                                            {/* <td className="p-3">
                                              {client.ebDoj
                                                ? formatDate(client.ebDoj)
                                                : "-"}
                                            </td> */}


                                            {/* TOTAL DAYS */}
                                            <td className="p-3">
                                              {client.TotalDays ?? "-"}
                                            </td>


                                            {/* CEB */}
                                            <td className="p-3">
                                              {Math.round(
                                                Number(client.CEB) || 0
                                              )}
                                            </td>


                                            {/* AC EB */}
                                            <td className="p-3">
                                              {Math.round(
                                                Number(client.ACEB) || 0
                                              )}
                                            </td>


                                            {/* ADJUSTED EB */}
                                            <td className="p-3">
                                              {Math.round(
                                                Number(client.AdjEB) || 0
                                              )}
                                            </td>


                                            {/* TOTAL CLIENT EB */}
                                            <td className="p-3 font-semibold">
                                              {Math.round(
                                                Number(client.TotalClientEB) || 0
                                              )}
                                            </td>


                                            {/* EB AMOUNT */}
                                            {/* <td className="p-3 font-semibold">
                                              ₹
                                              {Math.round(
                                                Number(client.EBAmt) || 0
                                              )}
                                            </td> */}


                                            {/* COMMENTS */}
                                            <td className="p-3">
                                              {client.Comments1 || "-"}
                                            </td>

                                          </tr>

                                        ))}

                                      </tbody>

                                    </table>

                                  </div>

                                ) : (

                                  <div className="p-5 text-center text-gray-500">
                                    No client details found
                                  </div>

                                )}

                              </div>

                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })

                ) : (

                  /* =================================================
                     NO DATA
                  ================================================= */

                  <tr>

                    <td colSpan={9}>

                      <NoDataFound
                        title="No EB Calculations Found"
                        description="Try searching different keywords"
                      />

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ======================================================
              PAGINATION
          ====================================================== */}

          <div className="border-t p-3 flex justify-between items-center">

            <span className="text-sm text-gray-500">

              Showing{" "}

              {totalRecords === 0
                ? 0
                : (currentPage - 1) * rowsPerPage + 1}

              {" - "}

              {Math.min(
                currentPage * rowsPerPage,
                totalRecords
              )}

              {" of "}

              {totalRecords}

            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                setExpandedRow(null);
              }}
            />

          </div>

        </div>

      </div>
    </>
  );
}

export default EBCalculationData;
