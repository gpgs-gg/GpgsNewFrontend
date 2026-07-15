import { useState, useMemo } from "react";
import { Eye, Pencil, Filter, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../Common/Pagination";
import NoDataFound from "../common/NoDataFound";
import { formatDate } from "../../utils/dateFormatter";
import { useForm } from "react-hook-form";
import { IoIosCall } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import BedFilter from "./BedFilter";
import { useBedsData } from "./services";

const BedsTable = () => {
  const { data: apiResponse } = useBedsData();

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
  }, [apiData, filters, search]);

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

  return (
    <>
      <div className="space-y-5">

        {/* HEADER */}


        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Bed Master</h1>
              <p className="text-sm text-gray-500">
                Manage all PG Beds
              </p>
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
                  <th className="p-3 text-center">Property Code</th>
                  <th className="p-3 text-center">Room No</th>
                  <th className="p-3 text-center">Bed No</th>
                  <th className="p-3 text-center">Gender</th>
                  <th className="p-3 text-center">Sharing Type</th>
                  <th className="p-3 text-center">Bath Attached</th>
                  <th className="p-3 text-center">AC Room</th>
                  <th className="p-3 text-center">Monthly Rent</th>
                  <th className="p-3 text-center">SDMF</th>
                  <th className="p-3 text-center">DA</th>
                  <th className="p-3 text-center">URHD</th>
                  <th className="p-3 text-center">URHA</th>
                  <th className="p-3 text-center">PRHD</th>
                  <th className="p-3 text-center">Status</th>
                  {/* <th className="p-3 text-center">Comment</th> */}
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>

                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-300 text-center hover:bg-gray-50"
                    >
                      <td className="p-3 text-center font-semibold">{item?.propertyId?.propertyCode}</td>
                      <td className="p-3 text-center">{item.roomNo}</td>
                      <td className="p-3 text-center">{item.bedNo}</td>
                      <td className="p-3 text-center">{item?.gender}</td>
                      <td className="p-3 text-center">{item?.sharingType}</td>
                      <td className="p-3 text-center">{item?.bathAttached}</td>
                      <td className="p-3 text-center">{item?.acRoom}</td>
                      <td className="p-3 text-center">{item?.monthlyRent}</td>
                      <td className="p-3 text-center">{item?.securityDepositMultiplicationFactor}</td>
                      <td className="p-3 text-center">{item?.depositAmount}</td>
                      <td className="p-3 text-center">
                        {formatDate(item?.upcomingRentHikeDate)}
                      </td>
                      <td className="p-3">{item?.upcomingRentHikeAmount}</td>
                      <td className="p-3">
                        {formatDate(item?.previousRentHikeDate)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      {/* <td className="p-3">{item?.comment}</td> */}
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Link to={`/bed/edit/${item._id}`}>
                            {/* <Link to={`/properties/view/${item._id}`}> */}
                            <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200">
                              <Eye size={16} />
                            </button>
                          </Link>
                          <Link to={`/bed/edit/${item._id}`}>
                            <button className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200">
                              <Pencil size={16} />
                            </button>
                          </Link>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={15} className="h-64">
                      <div className="flex items-center justify-center h-full">
                        <NoDataFound
                          title="No Properties Found"
                          description="Try searching different keywords"
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
      <BedFilter
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

export default BedsTable;