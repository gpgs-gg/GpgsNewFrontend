import React, { useMemo, useState } from "react";
import { CalendarDays, ArrowUpRight, Search, X, RotateCcw } from "lucide-react";

import { useBedsData } from "./services";
import useDebounce from "../../components/hooks/useDebounce";
import { formatDate } from "../../utils/dateFormatter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Convert date to Indian timezone and get YYYY-MM-DD
const getIndianDateKey = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

const getDaysLeft = (date) => {
  const dateKey = getIndianDateKey(date);

  if (!dateKey) return null;

  const [year, month, day] = dateKey.split("-").map(Number);

  const target = Date.UTC(year, month - 1, day);
  const nowKey = getIndianDateKey(new Date());

  const [todayYear, todayMonth, todayDay] = nowKey.split("-").map(Number);

  const today = Date.UTC(todayYear, todayMonth - 1, todayDay);

  return Math.round((target - today) / 86400000);
};

function OurDashboard() {
  const [showRentHikeList, setShowRentHikeList] = useState(false);
  const [uniquePropertyOnly, setUniquePropertyOnly] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const debouncedSearch = useDebounce("", 500);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBedsData({
    page: 1,
    limit: 100,
    search: debouncedSearch,
  });

  const responseData = apiResponse?.data;

  const beds = Array.isArray(responseData)
    ? responseData
    : Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(apiResponse?.beds)
        ? apiResponse.beds
        : [];

  // Default list: rent hikes due in the next 90 days.
  const upcomingBeds = useMemo(() => {
    return beds
      .filter((bed) => {
        const days = getDaysLeft(bed.upcomingRentHikeDate);

        return days !== null && days >= 0 && days <= 90;
      })
      .sort((a, b) =>
        getIndianDateKey(a.upcomingRentHikeDate).localeCompare(
          getIndianDateKey(b.upcomingRentHikeDate),
        ),
      );
  }, [beds]);

  // Apply property code + Indian calendar date filters.
  const filteredUpcomingBeds = useMemo(() => {
    const searchValue = propertySearch.trim().toLowerCase();

    const toDateKey = (date) => {
      if (!date) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    const fromDateKey = toDateKey(fromDate);
    const endDateKey = toDateKey(toDate);

    const filteredBeds = upcomingBeds.filter((bed) => {
      const propertyCode = String(
        bed.propertyId?.propertyCode || "",
      ).toLowerCase();

      const hikeDate = getIndianDateKey(bed.upcomingRentHikeDate);

      const matchesProperty =
        !searchValue || propertyCode.includes(searchValue);

      const matchesFromDate = !fromDateKey || hikeDate >= fromDateKey;

      const matchesToDate = !endDateKey || hikeDate <= endDateKey;

      return matchesProperty && matchesFromDate && matchesToDate;
    });

    // Switch ON: only one bed per property
    if (uniquePropertyOnly) {
      const seenProperties = new Set();

      return filteredBeds.filter((bed) => {
        const propertyCode = bed.propertyId?.propertyCode || "Unknown";

        if (seenProperties.has(propertyCode)) return false;

        seenProperties.add(propertyCode);
        return true;
      });
    }

    return filteredBeds;
  }, [upcomingBeds, propertySearch, fromDate, toDate, uniquePropertyOnly]);

  const resetFilters = () => {
    setPropertySearch("");
    setFromDate(null);
    setToDate(null);
    setUniquePropertyOnly(false);
  };

  const loading = isLoading || isFetching;

  return (
    <main className="grid grid-cols-1 md:grid-cols-4 gap-2">
      <div className="w-full max-w-lg">
        {/* Upcoming Rent Hike Card */}
        <section className="overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Upcoming Rent Hike Property & Beds
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Rent hikes in the next 3 months
                </p>
              </div>
            </div>

            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-700">
              3 Months
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-3xl font-bold text-rose-800">
                {loading ? "..." : upcomingBeds.length}
              </p>

              <p className="mt-1 text-xs text-slate-600">Beds to review</p>
            </div>

            <button
              type="button"
              onClick={() => setShowRentHikeList((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              {showRentHikeList ? "Hide Details" : "View Details"}

              <ArrowUpRight
                size={15}
                className={`transition-transform duration-300 ${
                  showRentHikeList ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-red-600">
              <span>Failed to load beds.</span>

              <button
                type="button"
                onClick={() => refetch()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        {/* Rent Hike List */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showRentHikeList
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {/* Filters */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                {/* Property Code */}
                <div className="">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      placeholder="Enter property code..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />

                    {propertySearch && (
                      <button
                        type="button"
                        onClick={() => setPropertySearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Clear property search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* From Date */}
                <div>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);

                      if (date && toDate && date > toDate) {
                        setToDate(null);
                      }
                    }}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    maxDate={toDate || undefined}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select from date"
                    isClearable
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    wrapperClassName="w-full"
                  />
                </div>

                {/* To Date */}
                <div>
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    selectsEnd
                    startDate={fromDate}
                    endDate={toDate}
                    minDate={fromDate || undefined}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select to date"
                    isClearable
                    popperPlacement="left"
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    wrapperClassName="w-full"
                  />
                </div>

                <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Unique Properties
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={uniquePropertyOnly}
                    aria-label="Show unique properties only"
                    onClick={() => setUniquePropertyOnly((prev) => !prev)}
                    className={`relative inline-flex h-4 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
                      uniquePropertyOnly ? "bg-rose-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute left-0.5 h-3 w-3 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                        uniquePropertyOnly ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span
                    className={`text-[10px] font-bold ${
                      uniquePropertyOnly ? "text-rose-600" : "text-slate-400"
                    }`}
                  >
                  
                  </span>
                </label>
              </div>

              {/* Result Count + Reset */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {!loading && !error && (
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {filteredUpcomingBeds.length}
                    </span>{" "}
                    of {upcomingBeds.length} beds
                  </p>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              </div>

              {/* Beds List */}
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {loading ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Loading beds...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-xs text-red-500">
                    Failed to load rent hike details.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredUpcomingBeds.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching rent hike beds found.
                  </div>
                ) : (
                  filteredUpcomingBeds.map((bed) => (
                    <div
                      key={bed._id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {bed.propertyId?.propertyCode || "Property"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Room: {bed.roomNo || "—"} · Bed: {bed.bedNo || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Hike Date</p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(bed.upcomingRentHikeDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Hike Amount</p>

                        <p className="mt-1 text-sm font-bold text-emerald-600">
                          ₹
                          {Number(
                            bed.upcomingRentHikeAmount || 0,
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

       <div className="w-full max-w-lg">
        {/* Upcoming Rent Hike Card */}
        <section className="overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-green-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 text-green-600">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Incomplete Property Docs
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Rent hikes in the next 3 months
                </p>
              </div>
            </div>

            <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
              3 Months
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-3xl font-bold text-green-800">
                {loading ? "..." : upcomingBeds.length}
              </p>

              <p className="mt-1 text-xs text-slate-600">Beds to review</p>
            </div>

            <button
              type="button"
              onClick={() => setShowRentHikeList((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-green-700 hover:bg-rose-50"
            >
              {showRentHikeList ? "Hide Details" : "View Details"}

              <ArrowUpRight
                size={15}
                className={`transition-transform duration-300 ${
                  showRentHikeList ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-green-600">
              <span>Failed to load beds.</span>

              <button
                type="button"
                onClick={() => refetch()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        {/* Rent Hike List */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showRentHikeList
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              {/* Filters */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                {/* Property Code */}
                <div className="">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      placeholder="Enter property code..."
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    />

                    {propertySearch && (
                      <button
                        type="button"
                        onClick={() => setPropertySearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Clear property search"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* From Date */}
                <div>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);

                      if (date && toDate && date > toDate) {
                        setToDate(null);
                      }
                    }}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    maxDate={toDate || undefined}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select from date"
                    isClearable
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    wrapperClassName="w-full"
                  />
                </div>

                {/* To Date */}
                <div>
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    selectsEnd
                    startDate={fromDate}
                    endDate={toDate}
                    minDate={fromDate || undefined}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select to date"
                    isClearable
                    popperPlacement="left"
                    className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    wrapperClassName="w-full"
                  />
                </div>

                <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Unique Properties
                  </span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={uniquePropertyOnly}
                    aria-label="Show unique properties only"
                    onClick={() => setUniquePropertyOnly((prev) => !prev)}
                    className={`relative inline-flex h-4 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 ${
                      uniquePropertyOnly ? "bg-rose-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none absolute left-0.5 h-3 w-3 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                        uniquePropertyOnly ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span
                    className={`text-[10px] font-bold ${
                      uniquePropertyOnly ? "text-rose-600" : "text-slate-400"
                    }`}
                  >
                  
                  </span>
                </label>
              </div>

              {/* Result Count + Reset */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {!loading && !error && (
                  <p className="text-xs text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-800">
                      {filteredUpcomingBeds.length}
                    </span>{" "}
                    of {upcomingBeds.length} beds
                  </p>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RotateCcw size={13} />
                  Reset Filters
                </button>
              </div>

              {/* Beds List */}
              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {loading ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Loading beds...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-xs text-red-500">
                    Failed to load rent hike details.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : filteredUpcomingBeds.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No matching rent hike beds found.
                  </div>
                ) : (
                  filteredUpcomingBeds.map((bed) => (
                    <div
                      key={bed._id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {bed.propertyId?.propertyCode || "Property"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Room: {bed.roomNo || "—"} · Bed: {bed.bedNo || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Hike Date</p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(bed.upcomingRentHikeDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Hike Amount</p>

                        <p className="mt-1 text-sm font-bold text-emerald-600">
                          ₹
                          {Number(
                            bed.upcomingRentHikeAmount || 0,
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
   

    </main>
  );
}

export default OurDashboard;
