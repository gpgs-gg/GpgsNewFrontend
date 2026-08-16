import React, { useEffect, useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import { useSalaryDetailsData } from "./services/index";

import TableSkeleton from "../../components/common/TableSkelton";
import NoDataFound from "../common/NoDataFound";
import Pagination from "../Common/Pagination";

// ============================================================
// CONSTANTS
// ============================================================

const ROWS_PER_PAGE = 12;

const CURRENT_DATE = new Date();

const CURRENT_MONTH = CURRENT_DATE.getMonth() + 1;
const CURRENT_YEAR = CURRENT_DATE.getFullYear();

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 5 }, (_, index) => CURRENT_YEAR - 2 + index);

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getMonthName = (month) => {
  if (!month) return "";

  return new Date(2000, Number(month) - 1, 1).toLocaleString("en-IN", {
    month: "short",
  });
};

// ============================================================
// ATTENDANCE HELPERS
// ============================================================

/**
 * Calculate total payable attendance days.
 *
 * Attendance status:
 * 1   = Full day
 * 0.5 = Half day
 * 0   = Absent
 *
 * Example:
 * [1, 1, 1, 0.5, 1] => 4.5
 */
// const calculateTotalPresentDays = (attendance = []) => {
//   return attendance.reduce((total, record) => {
//     const status = Number(record?.status);

//     if (status === 1) {
//       return total + 1;
//     }

//     if (status === 0.5) {
//       return total + 0.5;
//     }

//     return total;
//   }, 0);
// };

// ============================================================
// SALARY TABLE
// ============================================================
const calculateTotalPresentDays = (attendance = [], month, year) => {
  const totalPresentDays = attendance.reduce((total, record) => {
    const status = Number(record?.status);

    if (status === 1) {
      return total + 1;
    }

    if (status === 0.5) {
      return total + 0.5;
    }

    return total;
  }, 0);

  const actualMonthDays = new Date(Number(year), Number(month), 0).getDate();

  // Every month is treated as 30 days for salary
  if (actualMonthDays < 30) {
    return totalPresentDays === actualMonthDays ? 30 : totalPresentDays;
  }

  // 30/31 day months
  return Math.min(totalPresentDays, 30);
};
const SalaryTable = ({ params = {}, onView }) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedMonth, setSelectedMonth] = useState(
    Number(params?.month) || CURRENT_MONTH,
  );

  const [selectedYear, setSelectedYear] = useState(
    Number(params?.year) || CURRENT_YEAR,
  );

  // ==========================================================
  // MONTH INFORMATION
  // ==========================================================

  const selectedMonthName = getMonthName(selectedMonth);

  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonth,
    0,
  ).getDate();

  const DAYS = useMemo(() => {
    return Array.from({ length: daysInSelectedMonth }, (_, index) => index + 1);
  }, [daysInSelectedMonth]);

  // ==========================================================
  // SYNC URL / PARAMS
  // ==========================================================

  useEffect(() => {
    if (params?.month) {
      setSelectedMonth(Number(params.month));
    }

    if (params?.year) {
      setSelectedYear(Number(params.year));
    }
  }, [params?.month, params?.year]);

  // ==========================================================
  // RESET PAGINATION WHEN MONTH / YEAR CHANGES
  // ==========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  // ==========================================================
  // SALARY API
  // ==========================================================

  const queryParams = useMemo(
    () => ({
      ...params,
      month: selectedMonth,
      year: selectedYear,
      page: currentPage,
      limit: ROWS_PER_PAGE,
    }),
    [params, selectedMonth, selectedYear, currentPage],
  );

  const { data, isLoading, isFetching } = useSalaryDetailsData(queryParams);

  // ==========================================================
  // SALARY DATA
  // ==========================================================

  const salaries = useMemo(() => {
    return data?.data || [];
  }, [data]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalPages = data?.pagination?.totalPages || 1;

  const totalRecords = data?.pagination?.total || 0;

  const showingFrom =
    totalRecords === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;

  const showingTo = Math.min(currentPage * ROWS_PER_PAGE, totalRecords);

  // ==========================================================
  // GET DAY-WISE ATTENDANCE
  // ==========================================================

  /**
   * Attendance is already returned by /salaries.
   *
   * No separate attendance API call is required.
   *
   * salary.attendanceByDay:
   *
   * {
   *   1: { status: 1 },
   *   2: { status: 1 },
   *   3: { status: 0.5 },
   *   4: { status: 0 }
   * }
   */
  const getAttendanceStatus = (salary, day) => {
    return Number(salary?.attendanceByDay?.[day]?.status ?? 0);
  };

  // ==========================================================
  // GET TOTAL PRESENT DAYS
  // ==========================================================

  /**
   * Uses attendance returned from the salary API.
   *
   * Full day  = 1
   * Half day   = 0.5
   * Absent     = 0
   *
   * Example:
   * 22 full days + 1 half day = 22.5
   */
  // const getTotalPresentDays = (salary) => {
  //   return calculateTotalPresentDays(salary?.attendance);
  // };
  const getTotalPresentDays = (salary) => {
    return calculateTotalPresentDays(
      salary?.attendance,
      selectedMonth,
      selectedYear,
    );
  };
  const isThursday = (day, month, year) => {
    const date = new Date(year, month - 1, day);
    return date.getDay() === 4; // Thursday
  };
  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="min-h-screen w-auto bg-gray-50">
        {/* HEADER */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Salary Master</h1>

              <p className="text-sm text-gray-500">
                Manage employee salary details
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-[75vh] mt-2">
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <table className="w-max min-w-full border-collapse text-lg">
              <thead className="sticky top-0 z-40 bg-gray-100 whitespace-nowrap">
                <tr className="bg-[#111827] text-white">
                  {/* SR NO */}
                  <th
                    className="sticky left-0 z-40 bg-[#111827] border-r border-gray-600 px-2 py-2 text-center  font-bold whitespace-nowrap
      "
                  >
                    Sr
                  </th>

                  {/* EMPLOYEE ID */}
                  <th
                    className="sticky left-[42px] z-40 bg-[#111827]  border-r border-gray-600 px-2 py-2 text-left  font-bold whitespace-nowrap
      "
                  >
                    Employee ID
                  </th>

                  {/* EMPLOYEE NAME */}
                  <th
                    className="sticky left-[130px] z-40 bg-[#111827] border-r border-gray-600 px-3 py-2 text-left  font-bold whitespace-nowrap
        
      "
                  >
                    Employee Name
                  </th>

                  {/* DAYS */}
                  {DAYS.map((day) => {
                    const thursday = isThursday(
                      day,
                      selectedMonth,
                      selectedYear,
                    );

                    return (
                      <th
                        key={day}
                        className={`w-[36px] min-w-[36px] max-w-[36px] px-1 py-2 text-center  font-bold border-r border-gray-600 whitespace-nowrap
            ${thursday ? "bg-blue-700 text-white" : "bg-[#111827] text-white"}
          `}
                      >
                        {day}
                      </th>
                    );
                  })}

                  {/* TOTAL DAYS */}
                  <th
                    className="sticky right-0 z-40 bg-[#111827] border-l border-gray-600 px-3 py-2 text-center  font-bold whitespace-nowrap
      "
                  >
                    Total Days
                  </th>

                  {/* SALARY */}
                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Fix Salary
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Per Day
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Paid Leaves
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Payable Salary
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Paid Amount
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                    Comments
                  </th>

                  <th className="bg-[#111827] px-3 py-2 text-center  font-bold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <TableSkeleton
                rows={8}
                columns={3 + DAYS.length + 15}
                showActions
              />
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-auto bg-gray-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase">Salary Master</h1>

            <p className="text-sm text-gray-500">
              Manage employee salary details
              {selectedMonthName && ` - ${selectedMonthName} ${selectedYear}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="datepicker-group has-value">
              <label className="datepicker-label">Month & Year</label>

              <DatePicker
                selected={
                  selectedMonth && selectedYear
                    ? new Date(selectedYear, selectedMonth - 1, 1)
                    : null
                }
                onChange={(date) => {
                  if (!date) {
                    setSelectedMonth(null);
                    setSelectedYear(null);
                    return;
                  }

                  setSelectedMonth(date.getMonth() + 1);
                  setSelectedYear(date.getFullYear());
                }}
                showMonthYearPicker
                dateFormat="MMMM yyyy"
                isClearable
                placeholderText="Select month & year"
                className="custom-datepicker"
              />
            </div>

            {/* REFRESHING */}

            {isFetching && (
              <span className="text-sm text-gray-500">Refreshing...</span>
            )}

            {/* RECORD COUNT */}

            <span className="text-sm text-gray-500">
              {totalRecords} Records
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh] mt-2">
        {/* ===================================================
            TABLE CONTENT
        =================================================== */}

        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-max">
            {/* =================================================
                HEADER
            ================================================= */}

            <thead className="z-30">
              <tr className="bg-[#111827] text-white">
                {/* =========================
        SR NO
    ========================= */}
                <th
                  className="
        sticky top-0 left-0 z-50
        w-[44px] min-w-[44px] max-w-[44px]
        bg-[#111827]
        border-r border-gray-600
        px-1 py-2
        text-center
         font-bold
        whitespace-nowrap
      "
                >
                  Sr
                </th>

                {/* =========================
        EMPLOYEE ID
    ========================= */}
                <th
                  className="
        sticky top-0 left-[44px] z-50
        w-[90px] min-w-[90px] max-w-[90px]
        bg-[#111827]
        border-r border-gray-600
        px-2 py-2
        text-left
         font-bold
        whitespace-nowrap
      "
                >
                  Employee ID
                </th>

                {/* =========================
        EMPLOYEE NAME
    ========================= */}
                <th
                  className="
        sticky top-0 left-[134px] z-50
      
        bg-[#111827]
        border-r border-gray-600
        px-3 py-2
        text-left
         font-bold
        whitespace-nowrap
      "
                >
                  Employee Name
                </th>

                {/* =========================
        DAYS
    ========================= */}
                {DAYS.map((day) => {
                  const thursday = isThursday(day, selectedMonth, selectedYear);

                  return (
                    <th
                      key={day}
                      className={`
            sticky top-0 z-30
            w-[36px]
            min-w-[36px]
            max-w-[36px]
            h-[34px]
            px-1
            py-2
            text-center
            
            font-bold
            border-r border-gray-600
            whitespace-nowrap
            ${thursday ? "bg-[#111827] text-white" : "bg-[#111827] text-white"}
          `}
                    >
                      {day}
                    </th>
                  );
                })}

                {/* =========================
        TOTAL DAYS
    ========================= */}
                <th
                  className="
        sticky top-0 z-30
        bg-[#111827]
        border-l border-gray-600
        px-3 py-2
        text-center
         font-bold
        whitespace-nowrap
      "
                >
                  Total Days
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Fix Salary
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Per Day
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Paid Leaves
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Payable Salary
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Paid Amount
                </th>

                <th className="sticky top-0 z-30 bg-[#111827] px-3 py-2 text-left  font-bold whitespace-nowrap">
                  Comments
                </th>

                <th
                  className="
    sticky top-0 right-0 z-50
    w-[80px] min-w-[80px] max-w-[80px]
    bg-[#111827]
    border-l border-gray-600
    px-3 py-2
    text-center
     font-bold
    whitespace-nowrap
  "
                >
                  Actions
                </th>
              </tr>
            </thead>
            {/* =================================================
                BODY
            ================================================= */}

            <tbody>
              {salaries.length > 0 ? (
                salaries.map((salary, idx) => {
                  // ------------------------------------------
                  // CALCULATE PRESENT DAYS FROM ATTENDANCE
                  // ------------------------------------------

                  const totalPresentDays = getTotalPresentDays(salary);

                  return (
                    <tr
                      key={salary?._id || salary?.employeeId || idx}
                      className="
    group
    border-b border-gray-300
    bg-white
    hover:bg-gray-50 text-md
  "
                    >
                      {/* =================================================
                          SR NO
                      ================================================= */}

                      <td
                        className="
    sticky left-0 z-20
    bg-white
    group-hover:bg-gray-50
    border-r border-gray-300
    px-2 py-1.5
    text-center
   
    whitespace-nowrap
  "
                      >
                        {(currentPage - 1) * ROWS_PER_PAGE + idx + 1}
                      </td>
                      {/* =================================================
                          EMPLOYEE ID
                      ================================================= */}

                      <td
                        className="
    sticky left-[42px] z-20
    bg-white
    group-hover:bg-gray-50
    border-r border-gray-300
    px-2 py-1.5
   
    font-semibold
    whitespace-nowrap
  "
                      >
                        {salary.employeeId || "-"}
                      </td>

                      {/* =================================================
                          EMPLOYEE NAME
                      ================================================= */}

                      <td
                        className="
    sticky left-[130px] z-20
    bg-white
    group-hover:bg-gray-50
    border-r border-gray-300
    px-3 py-1.5
  
    whitespace-nowrap
  "
                      >
                        <div className="flex flex-col leading-tight">
                          <span className="text-md font-semibold text-gray-800">
                            {salary.employeeName || "-"}
                          </span>

                          {/* {salary.employee?.designation && (
                            <span className="text-[10px] text-gray-500 mt-0.5">
                              {salary.employee.designation}
                            </span>
                          )} */}
                        </div>
                      </td>

                      {/* =================================================
                          ATTENDANCE DAYS
                      ================================================= */}

                      {DAYS.map((day) => {
                        const status = getAttendanceStatus(salary, day);

                        const thursday = isThursday(
                          day,
                          selectedMonth,
                          selectedYear,
                        );

                        return (
                          <td
                            key={day}
                            className={`
        w-[36px]
        min-w-[36px]
        max-w-[36px]
        h-[34px]
        p-0
        text-center
        border-r border-gray-300
       
        font-semibold
        whitespace-nowrap
        ${thursday && status === 1
                                ? "bg-blue-50"
                                : status === 1
                                  ? "bg-white"
                                  : status === 0.5
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-600"
                              }
      `}
                            title={
                              status === 1
                                ? `Day ${day}: Present`
                                : status === 0.5
                                  ? `Day ${day}: Half Day`
                                  : `Day ${day}: Absent`
                            }
                          >
                            {status === 0 ? "0" : status}
                          </td>
                        );
                      })}
                      {/* =================================================
                          TOTAL PRESENT DAYS
                      ================================================= */}

                      <td
                        className="
    px-3 py-1.5
    text-center
   
    font-bold
    text-gray-800
    whitespace-nowrap
    border-r border-gray-300
    bg-gray-50
    group-hover:bg-gray-100
  "
                      >
                        {totalPresentDays}
                      </td>
                      {/* =================================================
                          MONTHLY SALARY
                      ================================================= */}

                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                        {formatCurrency(salary.monthlySalary)}
                      </td>
                      {/* =================================================
                          PAID LEAVES
                      ================================================= */}
                      {/* =================================================
                          PER DAY
                      ================================================= */}

                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                        {formatCurrency(salary.perDaySalary)}
                      </td>

                      <td className="px-3 py-1.5 whitespace-nowrap text-gray-700">
                        {salary.paidLeaveDays ?? 0}
                      </td>

                      {/* =================================================
                          ADJUSTMENT
                      ================================================= */}

                      {/* <td className="p-3 whitespace-nowrap max-w-[220px]">
                        <div className="truncate">
                          {salary.adjustmentDetails || "-"}
                        </div>
                      </td> */}

                      {/* =================================================
                          ADJUSTED AMOUNT
                      ================================================= */}

                      {/* <td className="p-3 whitespace-nowrap">
                        {formatCurrency(salary.adjustedAmount)}
                      </td> */}

                      {/* =================================================
                          PAYABLE
                      ================================================= */}

                      <td className="px-3 py-1.5 whitespace-nowrap font-bold text-gray-800">
                        {formatCurrency(salary.payableSalary)}
                      </td>
                      {/* =================================================
                          PAID
                      ================================================= */}

                      <td className="px-3 py-1.5 whitespace-nowrap font-semibold text-green-700">
                        {formatCurrency(salary.paidAmount)}
                      </td>

                      {/* =================================================
                          PREVIOUS DUE
                      ================================================= */}

                      {/* <td className="p-3 whitespace-nowrap">
                        {formatCurrency(salary.previousDue)}
                      </td> */}

                      {/* =================================================
                          CURRENT DUE
                      ================================================= */}

                      {/* <td className="p-3 whitespace-nowrap font-semibold text-red-600">
                        {formatCurrency(salary.currentDue)}
                      </td> */}

                      {/* =================================================
                          COMMENTS
                      ================================================= */}

                      <td className="px-3 py-1.5 whitespace-nowrap max-w-[180px]">
                        <div
                          className="truncate text-gray-600"
                          title={salary.comments || ""}
                        >
                          {salary.comments || "-"}
                        </div>
                      </td>
                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <td
                        className="
    sticky right-0 z-20
    w-[80px] min-w-[80px] max-w-[80px]
    bg-white
    group-hover:bg-gray-50
    border-l border-gray-300
    px-3 py-1.5
    whitespace-nowrap
  "
                      >
                        <div className="flex justify-center gap-1.5">
                          {onView && (
                            <button
                              type="button"
                              onClick={() => onView(salary)}
                              className="
          p-1.5
          bg-blue-50
          text-blue-600
          rounded-md
          hover:bg-blue-100
          transition
        "
                              title="View Salary"
                            >
                              <Eye size={15} />
                            </button>
                          )}

                          <Link
                            to={`/salary/edit/${salary.employeeId}?month=${selectedMonth}&year=${selectedYear}`}
                          >
                            <button
                              type="button"
                              className="
          p-1.5
          bg-yellow-50
          text-yellow-600
          rounded-md
          hover:bg-yellow-100
          transition
        "
                              title="Edit Salary"
                            >
                              <Pencil size={15} />
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3 + DAYS.length + 15}>
                    <NoDataFound
                      title="No Salary Records Found"
                      description="Try changing the selected month or search filters"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="border-t p-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {showingFrom} - {showingTo} of {totalRecords}
          </span>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default SalaryTable;
