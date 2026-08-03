import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/authContext";
import Loader from "../../common/Loader";
import DailyTodoTableSkeleton from "./DailyTodoTableSkeleton";
/* ================= CONFIG ================= */

const SR_NO_WIDTH = 40;
const FREQUENCY_WIDTH = 60;
const ACTIVITIES_WIDTH = 290;
const FIXED_COL_WIDTH = 140; // Fixed width for remaining columns
const HIDDEN_COLUMNS = ["Notify"];

/* ================= COLOR CONFIG ================= */
const COLORS = {
  DONE: "bg-green-200", // Soft green (completed / on time)
  UPCOMING: "bg-yellow-200 ", // Soft amber (upcoming)
  DUE: "bg-white ", // Calm blue (due today)
  OVERDUE: "bg-red-400 ", // Soft red (overdue)
  SAMEDAY: "bg-blue-300 animate-pulse ",
};

/* ================= COMPONENT ================= */

export default function DailyTodoTable({
  title,

  useFetchHook,
  useUpdateHook,
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  // const [filteredRows, setFilteredRows] = useState([]);
  const [filteredColumns, setFilteredColumns] = useState([]);

  //  const [setDiffDaysForAll, setDiffDaysForAll] = useState();
  /* ================= TANSTACK QUERY ================= */
  //const { data, isLoading } = useHouseKeepingData(month.sheet);
  const { data, isPending } = useFetchHook();
  // Highlight clicked activity cell
  const [activeCell, setActiveCell] = useState(null);
  // { row: number, col: string }

  // Filter logic
  const [selectedActivities, setSelectedActivities] = useState([]);

  // column name like "01 Jan 2025"

  // for mobile long press
  const LONG_PRESS_TIME = 500; // ms
  let longPressTimer = null;

  const startLongPress = (rIdx, head, cIdx) => {
    if (cIdx < 3) return;

    longPressTimer = setTimeout(() => {
      setEditingCell({ row: rIdx, col: head });
    }, LONG_PRESS_TIME);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const [statusFilter, setStatusFilter] = useState(null);
  // "OVERDUE" | "DONE" | "UPCOMING" | "SAMEDAY"

  const updateMutation = useUpdateHook();

  /* ================= SYNC API → LOCAL STATE ================= */

  useEffect(() => {
    if (!data?.success) return;

    const apiHeaders = data.headers.map((h) => (h === "" ? "S.No" : h));

    //setHeaders(apiHeaders);
    setHeaders(apiHeaders.filter((h) => !HIDDEN_COLUMNS.includes(h)));

    setRows(data.data);
    // console.log(data.data);
    setEditedRows(JSON.parse(JSON.stringify(data.data)));
    setHasChanges(false);
  }, [data]);

  // Apply filtering logic

  /* ================= DATE UTILITIES ================= */
  //  reset filter
  const resetFilters = () => {
    setSelectedActivities([]);
    setStatusFilter(null);
    setFilteredColumns([]);
    setActiveCell(null);
    //window.location.reload();
  };

  // toggle activity selection
  const toggleActivitySelection = (rIdx, activity) => {
    setActiveCell({ row: rIdx, col: "Activities" });

    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity],
    );

    // when activities change → reset column filters
    setStatusFilter(null);
    setFilteredColumns([]);
  };

  //  future date validation
  const isFutureDate = (value) => {
    if (!isValidDateFormat(value)) return false;

    const [day, monthStr, year] = value.split(" ");
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const inputDate = new Date(year, monthMap[monthStr], day);
    inputDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate > today; // ❌ future date
  };

  // parse date
  const parseCellDate = (cellValue) => {
    if (!cellValue || cellValue === "NA") return null;

    const rawDate = cellValue.split("$")[0]?.split("_")[0]?.trim();
    if (!isValidDateFormat(rawDate)) return null;

    const [day, mon, year] = rawDate.split(" ");
    const map = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    return new Date(year, map[mon], day);
  };
  let diffDays;

  /* ================= formatDateInput  ================= */
  const getStatusForCell = (frequency, cellValue, uplValue) => {
    const freq = Number(frequency);
    const upl = Number(uplValue) || 0;

    if (!freq) return "";

    const completedDate = parseCellDate(cellValue);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ Not completed yet
    if (!completedDate) {
      return COLORS.DUE;
    }

    completedDate.setHours(0, 0, 0, 0);

    diffDays = Math.floor((today - completedDate) / (1000 * 60 * 60 * 24));

    /* ================= DAILY ================= */
    if (freq === 1) {
      if (diffDays === 0) return COLORS.DONE;
      if (diffDays < 0) return COLORS.DUE;
      return COLORS.OVERDUE;
    }

    /* ================= GENERIC ================= */

    if (diffDays < 0) return COLORS.DUE;

    const daysLeft = freq - diffDays;
    // 2️⃣ OVERDUE
    if (diffDays > freq) {
      return COLORS.OVERDUE;
    }
    if (diffDays === freq) {
      return COLORS.SAMEDAY;
    }
    // ⚠️ Upcoming → use Upl from sheet
    if (daysLeft >= 0 && daysLeft <= upl) {
      return COLORS.UPCOMING;
    }

    // ✅ Done
    if (diffDays >= 0 && diffDays <= freq) {
      return COLORS.DONE;
    }
    // console.log(4444444444, diffDays === freq);
    // 1️⃣ SAME DAY (exact due date)
    if (diffDays === freq) {
      return COLORS.SAMEDAY;
    }

    return COLORS.DUE;
  };

  const formatDateInput = (value) => {
    if (!value) return value;

    const parts = value.trim().split(/\s+/);
    if (parts.length !== 3) return value;

    let [day, month, year] = parts;

    // Capitalize month (Dec, Jan, etc.)
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day} ${month} ${year}`;
  };

  /* ================= SAVE ALL CHANGES ================= */
  const saveAllChanges = async () => {
    setSaving(true);

    const batchUpdates = [];

    const getPureValue = (val) => {
      if (val == null) return "NA";

      const value = String(val);

      return value.split("$")[0].split("_")[0].trim();
    };

    for (let r = 0; r < editedRows.length; r++) {
      const columnUpdates = [];

      const NON_EDITABLE_COLUMNS = ["S.No", "Activities", "Freq", "Notify"];

      for (let h of headers) {
        if (NON_EDITABLE_COLUMNS.includes(h)) continue;

        const editedVal = getPureValue(editedRows[r][h]);
        const originalVal = getPureValue(rows[r][h]);

        if (editedVal !== originalVal) {
          columnUpdates.push({
            columnName: h,
            value: editedVal,
            name: user?.name || "pooja",
          });
        }
      }

      // ✅ Only push rows that actually changed
      if (columnUpdates.length > 0) {
        batchUpdates.push({
          rowIndex: r, // frontend row index (0-based)
          columns: columnUpdates,
        });
      }
    }

    if (batchUpdates.length === 0) {
      toast.warn("You can't save without any changes!");
      setSaving(false);
      return;
    }

    try {
      // 🔥 SINGLE API CALL
      console.log("Sending payload", batchUpdates);
      await updateMutation.mutateAsync({
        updates: batchUpdates,
      });

      // Sync local state
      setRows(JSON.parse(JSON.stringify(editedRows)));
      setHasChanges(false);

      toast.success("Updated successfully");
    } catch (err) {
      toast.error("Failed to update data");
    } finally {
      setSaving(false);
    }
  };

  /* ================= HANDLE CELL EDIT ================= */

  const handleCellEdit = (rowIndex, columnName, value) => {
    const trimmedValue = value.trim();

    // Update editedRows
    const updatedEditedRows = [...editedRows];
    updatedEditedRows[rowIndex][columnName] = trimmedValue || "NA";
    setEditedRows(updatedEditedRows);

    // Check if value changed from original
    const originalValue = rows[rowIndex][columnName];
    if (trimmedValue !== originalValue) {
      setHasChanges(true);
    } else {
      // If user reverts to original value, check if all changes are reverted
      const hasAnyChanges = updatedEditedRows.some((row, rIdx) =>
        headers.some(
          (h, hIdx) =>
            h !== "S.No" && updatedEditedRows[rIdx][h] !== rows[rIdx][h],
        ),
      );
      setHasChanges(hasAnyChanges);
    }

    // End editing
    setEditingCell(null);
  };

  /* ================= GET COLUMN WIDTH ================= */

  const getColumnWidth = (index, header) => {
    if (index === 0) return SR_NO_WIDTH; // S.No column
    if (header === "Freq") return FREQUENCY_WIDTH;
    if (header === "Activities") return ACTIVITIES_WIDTH;
    return FIXED_COL_WIDTH; // Fixed width for all other columns
  };

  /* ================= GET STICKY LEFT POSITION ================= */

  const getStickyLeft = (index) => {
    let left = 0;
    for (let i = 0; i < index; i++) {
      left += getColumnWidth(i, headers[i]);
    }
    return left;
  };

  /* ================= VALIDATION ================= */

  const isValidDateFormat = (value) => {
    const regex =
      /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

    if (!regex.test(value)) return false;

    // Extra safety: check if it's a real date
    const [day, monthStr, year] = value.split(" ");
    const monthMap = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const date = new Date(year, monthMap[monthStr], day);
    return (
      date.getFullYear() === Number(year) &&
      date.getMonth() === monthMap[monthStr] &&
      date.getDate() === Number(day)
    );
  };

  /* ================= PARSE HISTORY VALUE ================= */

  const parseHistoryValue = (value) => {
    if (value == null) return [];

    // already array
    if (Array.isArray(value)) return value;

    // object
    if (typeof value === "object") return [];

    // convert everything else to string
    value = String(value);

    if (value === "" || value === "NA") return [];

    return value
      .split("$")
      .filter(Boolean)
      .map((item, index) => {
        const [text, meta] = item.split("_");

        return {
          sr: index + 1,
          text: text?.trim() || "NA",
          meta: meta?.replace(/[[\]]/g, "") || "",
        };
      });
  };

  /* ================= LOADING ================= */
  if (isPending) {
    return <DailyTodoTableSkeleton />;
  }

  // filter logic

  const isFilterApplied =
    selectedActivities.length > 0 ||
    filteredColumns.length > 0 ||
    statusFilter !== null;

  // generic helper function for filtering activities with columns
  const getColumnsByStatusForActivities = (activities, targetStatus) => {
    const unionSet = new Set();

    activities.forEach((activity) => {
      const row = rows.find((r) => r.Activities === activity);
      if (!row) return;

      const frequency = row["Freq"];
      const upl = row["Notify"];

      headers.forEach((head, idx) => {
        if (idx < 3) return; // skip SrNo, Activities, Freq

        const status = getStatusForCell(frequency, row[head], upl);
        if (status === targetStatus) {
          unionSet.add(head);
        }
      });
    });

    // console.log(unionSet);
    if ([...unionSet].length >= 1) {
      //  console.log("unionSet.length", [...unionSet].length);
      return Array.from(unionSet);
    }
    return [];
  };

  // getFilterClass
  const getFilterClass = (type, baseClass) =>
    `${baseClass} cursor-pointer transition ${
      statusFilter === type ? "  font-bold" : ""
    }`;

  //  apply status filter
  const applyStatusFilter = (type, color) => {
    if (selectedActivities.length === 0) {
      toast.error("Please select at least one activity");
      return;
    }

    const cols = getColumnsByStatusForActivities(selectedActivities, color);

    setFilteredColumns(cols);
    setStatusFilter(type);
  };

  // no filtered data
  const hideDataColumns =
    statusFilter &&
    filteredColumns.length === 0 &&
    selectedActivities.length > 0;

  // empty filtered result
  const showNoDataFound =
    statusFilter &&
    filteredColumns.length === 0 &&
    selectedActivities.length > 0;

  const moveToNextCell = (rowIndex, colIndex) => {
    let nextCol = colIndex + 1;

    // Skip non-editable columns (first 3)
    while (nextCol < headers.length && nextCol < 3) {
      nextCol++;
    }

    if (nextCol < headers.length) {
      setEditingCell({ row: rowIndex, col: headers[nextCol] });
    } else {
      // Optional: move to first editable cell of next row
      const nextRow = rowIndex + 1;
      if (nextRow < rows.length) {
        setEditingCell({ row: nextRow, col: headers[3] });
      } else {
        setEditingCell(null);
      }
    }
  };

  /* ================= UI ================= */

  return (
    <div className=" w-auto    ">
      <div className="flex flex-wrap  md:items-center md:justify-between  mx-2 mb-0">
        <h1 className="text-xl font-bold underline px-5">
          {title}
          {/* DailyTodo – Housekeeping ({month.label}) */}
        </h1>

        {/* title color code  */}
        <div className="flex   items-center md:text-lg md:gap-8 whitespace-nowrap md:mx-2 font-bold  md:px-4 md:py-2 ">
          {/* already late */}
          <p
            onClick={() => applyStatusFilter("OVERDUE", COLORS.OVERDUE)}
            className={getFilterClass(
              "OVERDUE",
              "px-6 p-1 md:py-1 bg-red-400 text-black",
            )}
          >
            {statusFilter === "OVERDUE" && <span className=" mx-2">✔</span>}
            Already Late
          </p>

          {/* done */}
          <p
            onClick={() => applyStatusFilter("DONE", COLORS.DONE)}
            className={getFilterClass(
              "DONE",
              "px-6 py-1 bg-green-200 text-black",
            )}
          >
            {statusFilter === "DONE" && <span className=" mx-2">✔</span>}
            Done
          </p>

          {/* upcoming */}
          <p
            onClick={() => applyStatusFilter("UPCOMING", COLORS.UPCOMING)}
            className={getFilterClass(
              "UPCOMING",
              "px-6 py-1 bg-yellow-200 text-black",
            )}
          >
            {statusFilter === "UPCOMING" && <span className=" mx-2">✔</span>}
            Upcoming
          </p>

          {/* same day */}
          <p
            onClick={() => applyStatusFilter("SAMEDAY", COLORS.SAMEDAY)}
            className={getFilterClass(
              "SAMEDAY",
              "px-6 py-1 bg-blue-300 animate-pulse text-black",
            )}
          >
            {statusFilter === "SAMEDAY" && <span className=" mx-2">✔</span>}
            Today’s work
          </p>
          <div className="hidden">
            {isFilterApplied && (
              <button
                onClick={resetFilters}
                className="px-6 py-1 bg-gray-300 hover:bg-gray-400
               text-black font-bold rounded transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 my-1 items-center text-[14px] px-8">
          <div>
            {isFilterApplied && (
              <button
                onClick={resetFilters}
                className="px-6 py-1 bg-gray-300 hover:bg-gray-400
               text-black font-bold rounded transition"
              >
                Reset Filters
              </button>
            )}
          </div>
          {hasChanges && (
            <button
              onClick={saveAllChanges}
              disabled={saving}
              className="bg-orange-300 hover:bg-orange-400 px-8 py-1
               font-bold text-black rounded disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader /> Saving...
                </>
              ) : (
                <> Save</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative lg:h-[79vh] h-auto overflow-x-auto overflow-y-auto bg-white shadow-lg rounded-lg ">
        {showNoDataFound && (
          <div className=" absolute top-[198px] left-[640px] z-[200] flex items-center gap-3 bg-white/90 backdrop-blur px-32 py-8 border border-gray-200 rounded-xl shadow-lg text-gray-600 font-semibold pointer-events-none animate-fadeIn">
            <span className="text-orange-400 text-xl">📭</span>
            <span>No Property Found with given Service</span>
          </div>
        )}

        <table className="border-collapse text-sm table-fixed overflow-visible">
          <thead className="sticky top-0 z-100 text-white">
            <tr>
              {headers.map((head, i) => {
                const isFilteredColumn =
                  i < 3 || // always show SrNo, Activities, Freq
                  (!hideDataColumns && // ⛔ hide when no data
                    (filteredColumns.length === 0 ||
                      filteredColumns.includes(head)));

                // if (!isFilteredColumn) return null; // 🔥 HIDE HEADER

                return (
                  <th
                    key={i}
                    className={`border bg-black ${
                      i === 0 || i === 2 ? "" : "px-5"
                    } py-3  font-semibold border-gray-100     ${
                      i < 3 ? "sticky z-50 bg-black" : ""
                    }      ${
                      !isFilteredColumn && i >= 3 ? "hidden border-none" : ""
                    }`}
                    style={{
                      left: i < 3 ? getStickyLeft(i) : undefined,
                      width: getColumnWidth(i, head),
                      minWidth: getColumnWidth(i, head),
                      maxWidth: getColumnWidth(i, head),
                      flexShrink: 0, // 🔒 IMPORTANT
                    }}
                  >
                    <div className="truncate">{head}</div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="overflow-visible">
            {rows.map((row, rIdx) => {
              const frequency = row["Freq"];
              const upl = row["Notify"];

              return (
                <tr
                  key={rIdx}
                  className={`transition-opacity overflow-visible duration-200 ${
                    statusFilter &&
                    selectedActivities.length > 0 &&
                    !selectedActivities.includes(row.Activities)
                      ? "bg-red-500/50 opacity-30"
                      : "opacity-100"
                  }`}
                >
                  {headers.map((head, cIdx) => {
                    const sticky = cIdx < 3;
                    const isEditing =
                      editingCell?.row === rIdx && editingCell?.col === head;
                    const currentValue = editedRows[rIdx]?.[head] || row[head];
                    const originalValue = rows[rIdx][head];
                    const isChanged =
                      editedRows[rIdx]?.[head] !== originalValue;
                    const width = getColumnWidth(cIdx, head);
                    const cellStatus =
                      cIdx >= 3
                        ? getStatusForCell(frequency, currentValue, upl)
                        : "";
                    const isFilteredColumn =
                      cIdx < 3 || // always show SrNo, Activities, Freq
                      (!hideDataColumns && // ⛔ hide when no data
                        (filteredColumns.length === 0 ||
                          filteredColumns.includes(head)));

                    // filteredColumns.length === 0 ||
                    // filteredColumns.includes(head);

                    return (
                      <td
                        key={cIdx}
                        // onClick={() => {
                        //   if (cIdx === 1) {
                        //     toggleActivitySelection(rIdx, head, row.Activities);
                        //   }
                        // }}
                        // onDoubleClick={() => {
                        //   if (cIdx < 3) return; // Don't edit first 3 columns
                        //   setEditingCell({ row: rIdx, col: head });
                        // }}

                        onDoubleClick={() => {
                          if (cIdx < 3) return;
                          setEditingCell({ row: rIdx, col: head });
                        }}
                        onTouchStart={() => startLongPress(rIdx, head, cIdx)}
                        onTouchEnd={cancelLongPress}
                        onTouchMove={cancelLongPress}
                        className={`border px-4 py-3 border-gray-50 hover:animate-none relative ${
                          // Removed overflow-visible here as it's redundant if z-index is right
                          sticky ? "sticky z-20 font-bold " : "z-10"
                        } 
    hover:z-[110] 
    ${head === "Activities" ? "z-30" : ""} 
    ${cIdx >= 3 ? cellStatus : ""}
    ${cIdx === 0 || head === "Freq" ? "text-center" : ""}  
    ${
      activeCell?.row === rIdx && activeCell?.col === head
        ? "bg-black/10"
        : sticky
          ? "bg-gray-100 "
          : ""
    }
    ${!isFilteredColumn && cIdx >= 3 ? "hidden border-none" : ""}
    `}
                        style={{
                          width: width,
                          minWidth: width,
                          maxWidth: width,
                          flexShrink: 0, // 🔒 IMPORTANT
                          ...(sticky && { left: getStickyLeft(cIdx) }),
                        }}
                      >
                        {head === "SrNo" ? (
                          <span className="font-bold flex justify-start items-start">
                            {rIdx + 1}
                          </span>
                        ) : isEditing ? (
                          <div
                            className="absolute inset-0 flex border-2
                           border-black items-center justify-center z-40"
                          >
                            <input
                              defaultValue={
                                currentValue?.split("$")[0]?.split("_")[0] || ""
                              }
                              onBlur={(e) => {
                                const trimmedValue = formatDateInput(
                                  e.target.value.trim(),
                                );
                                if (trimmedValue && trimmedValue !== "NA") {
                                  if (!isValidDateFormat(trimmedValue)) {
                                    toast.error(
                                      " Invalid date format! Use: 25 Dec 2025",
                                    );
                                    setEditingCell(null);
                                    return;
                                  }
                                  if (isFutureDate(trimmedValue)) {
                                    toast.error("Future dates are not allowed");
                                    setEditingCell(null);
                                    return;
                                  }
                                }
                                handleCellEdit(rIdx, head, trimmedValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === "Tab") {
                                  e.preventDefault();
                                  const trimmedValue = formatDateInput(
                                    e.target.value.trim(),
                                  );

                                  if (trimmedValue && trimmedValue !== "NA") {
                                    if (!isValidDateFormat(trimmedValue)) {
                                      toast.error(
                                        " Invalid date format! Use: 25 Dec 2025",
                                      );
                                      return;
                                    }
                                    if (isFutureDate(trimmedValue)) {
                                      toast.error(
                                        "Future dates are not allowed",
                                      );
                                      return;
                                    }
                                  }

                                  handleCellEdit(rIdx, head, trimmedValue);
                                  // 🔥 Move to next column in same row
                                  moveToNextCell(rIdx, cIdx);
                                }
                                if (e.key === "Escape") {
                                  setEditingCell(null);
                                }
                              }}
                              className="  h-full w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 px-4 text-sm text-black caret-black font-medium"
                              style={{
                                boxShadow: "none",
                                WebkitTextFillColor: "black",
                                WebkitAppearance: "none",
                                MozAppearance: "none",
                              }}
                            />
                          </div>
                        ) : (
                          <div className="relative group cursor-pointer">
                            {(() => {
                              const historyArr =
                                parseHistoryValue(currentValue);
                              const displayValue = historyArr[0]?.text || "-";

                              return (
                                <>
                                  <div className="relative group flex items-center gap-2 ">
                                    {head === "Activities" && (
                                      <div>
                                        <input
                                          type="checkbox"
                                          checked={selectedActivities.includes(
                                            row.Activities,
                                          )}
                                          className="mr-2 h-5 w-5 accent-black border-gray-300 rounded focus:ring-orange-500"
                                          // onClick={(e) => e.stopPropagation()}
                                          onChange={() =>
                                            toggleActivitySelection(
                                              rIdx,
                                              row.Activities,
                                            )
                                          }
                                        />
                                      </div>
                                    )}
                                    <div
                                      className={`block ${
                                        head === "Freq"
                                          ? "whitespace-nowrap"
                                          : "truncate max-w-[20ch]"
                                      } ${
                                        !currentValue || currentValue === "-"
                                          ? "text-gray-400"
                                          : "text-black"
                                      }`}
                                      style={{ maxWidth: width - 36 }}
                                    >
                                      {displayValue}

                                      {isChanged && (
                                        <span className="ml-1 text-xs">*</span>
                                      )}
                                    </div>
                                  </div>

                                  {historyArr.length > 0 && (
                                    <div className="relative group overflow-visible ">
                                      <div
                                        className={`absolute left-[90%] top-0 opacity-0 group-hover:opacity-100 transition-all bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] min-w-[320px] pointer-events-none 
    ${cIdx < 3 ? "ml-4" : "  ml-38"} 
  `}
                                      >
                                        <div className="p-3 space-y-2 z-100 ">
                                          {cIdx > 2 && (
                                            <div className="text-xs font-semibold text-gray-500 uppercase">
                                              Previous History - ( {diffDays} )
                                            </div>
                                          )}

                                          {historyArr
                                            .slice(0, 4)
                                            .map((item, idx) => (
                                              <div
                                                key={idx}
                                                className={`p-2 rounded  text-xs ${
                                                  idx === 0
                                                    ? "bg-gray-50"
                                                    : "bg-gray-50"
                                                }`}
                                              >
                                                <div className="whitespace-nowrap">
                                                  <span className="font-semibold">
                                                    {" "}
                                                    {item.text}
                                                  </span>{" "}
                                                  {item.meta && (
                                                    <span className="text-[10px] text-gray-500">
                                                      {item.meta}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


