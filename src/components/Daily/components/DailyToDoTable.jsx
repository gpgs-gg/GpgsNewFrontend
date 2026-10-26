import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/authContext";
import Loader from "../../common/Loader";
import DailyTodoTableSkeleton from "./DailyTodoTableSkeleton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DailyTodoTable.css";
/* ================= CONFIG ================= */

const SR_NO_WIDTH = 40;
const FREQUENCY_WIDTH = 60;
const ACTIVITIES_WIDTH = 250; // Adjusted slightly for better fit
const FIXED_COL_WIDTH = 160; // Slightly wider to accommodate pills
const HIDDEN_COLUMNS = ["Notify"];

/* ================= COLOR CONFIG ================= */
/* Updated to match Screenshot Styles (Pill shapes with specific bg/text colors) */
const COLORS = {
  DONE: "bg-green-100 text-green-700 border-green-200",
  UPCOMING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DUE: "bg-white", // Used for empty/neutral
  OVERDUE: "bg-red-100 text-red-600 border-red-200",
  SAMEDAY: "bg-blue-100 text-blue-600 border-blue-200",
};

/* ================= VALIDATION ================= */
const isValidDateFormat = (value) => {
  const regex =
    /^(0?[1-9]|[12][0-9]|3[01])\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$/;

  if (!regex.test(value)) return false;

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
const getDatePickerValue = (value) => {
  const rawDate = value?.split("$")[0]?.split("_")[0]?.trim();

  if (!rawDate || !isValidDateFormat(rawDate)) {
    return null;
  }

  const [day, month, year] = rawDate.split(" ");

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

  return new Date(Number(year), monthMap[month], Number(day));
};

const formatDatePickerValue = (date) => {
  if (!date) return "NA";

  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
/* ================= COMPONENT ================= */

export default function DailyTodoTable({ title, useFetchHook, useUpdateHook }) {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [editedRows, setEditedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [propertyMap, setPropertyMap] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  /* ================= TANSTACK QUERY ================= */
  const { data, isPending } = useFetchHook();
  const [activeCell, setActiveCell] = useState(null);

  // Filter logic
  const [selectedActivities, setSelectedActivities] = useState([]);

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

    const visibleHeaders = [];
    const propertyIdMap = {};

    data.headers.forEach((header) => {
      if (typeof header === "string") {
        visibleHeaders.push(header === "" ? "S.No" : header);
      } else {
        visibleHeaders.push(header.title);
        propertyIdMap[header.title] = header.propertyId;
      }
    });

    setHeaders(
      visibleHeaders.filter(
        (h) => ![...HIDDEN_COLUMNS, "S.No", "SrNo", "Freq"].includes(h),
      ),
    );
    setPropertyMap(propertyIdMap);
    setRows(data.data);
    setEditedRows(JSON.parse(JSON.stringify(data.data)));
    setHasChanges(false);
  }, [data]);

  /* ================= DATE UTILITIES ================= */
  const resetFilters = () => {
    setSelectedActivities([]);
    setStatusFilter(null);
    setFilteredColumns([]);
    setActiveCell(null);
  };

  const toggleActivitySelection = (rIdx, activity) => {
    setActiveCell({ row: rIdx, col: "Activities" });

    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity],
    );

    setStatusFilter(null);
    setFilteredColumns([]);
  };

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

    return inputDate > today;
  };

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
    const notifyDays = Math.max(0, Number(uplValue) || 0);

    if (!Number.isFinite(freq) || freq <= 0) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedDate = parseCellDate(cellValue);

    // No valid completion history
    if (!completedDate) {
      return COLORS.OVERDUE;
    }

    completedDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Future completion date
    if (diffDays < 0) {
      return COLORS.DUE;
    }

    // Task is due today
    // Task is due today only when the frequency period has elapsed
    if (diffDays === freq && notifyDays > 0) {
      return COLORS.SAMEDAY;
    }

    // Task is overdue
    if (diffDays > freq) {
      return COLORS.OVERDUE;
    }

    // Upcoming notification period
    if (freq - diffDays <= notifyDays) {
      return COLORS.UPCOMING;
    }

    // Completed and not yet due
    return COLORS.DONE;
  };

  // const getStatusForCell = (frequency, cellValue, uplValue) => {
  //   const freq = Number(frequency);
  //   const notifyDays = Math.max(0, Number(uplValue) || 0);

  //   if (!Number.isFinite(freq) || freq <= 0) {
  //     return "";
  //   }

  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const completedDate = parseCellDate(cellValue);

  //   // No valid completion history
  //   if (!completedDate) {
  //     return COLORS.OVERDUE;
  //   }

  //   completedDate.setHours(0, 0, 0, 0);

  //   const diffDays = Math.round(
  //     (today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24),
  //   );

  //   // Future dates are invalid
  //   if (diffDays < 0) {
  //     return COLORS.DUE;
  //   }

  //   // Keep Done throughout the cycle until the notification period begins.
  //   const daysUntilDue = freq - diffDays;

  //   if (daysUntilDue > notifyDays) {
  //     return COLORS.DONE;
  //   }

  //   // Due today
  //   if (daysUntilDue === 0) {
  //     return COLORS.SAMEDAY;
  //   }

  //   // Past the due date
  //   if (daysUntilDue < 0) {
  //     return COLORS.OVERDUE;
  //   }

  //   // Upcoming based on Notify
  //   if (daysUntilDue > 0 && daysUntilDue <= notifyDays) {
  //     return COLORS.UPCOMING;
  //   }

  //   return COLORS.DUE;
  // };
  const formatDateInput = (value) => {
    if (!value) return value;

    const parts = value.trim().split(/\s+/);
    if (parts.length !== 3) return value;

    let [day, month, year] = parts;
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day} ${month} ${year}`;
  };
  /* ================= CANCEL TEMPORARY CHANGES ================= */
  const cancelAllChanges = () => {
    // Revert all unsaved changes to original API data
    setEditedRows(JSON.parse(JSON.stringify(rows)));

    // Reset temporary editing state
    setHasChanges(false);
    setEditingCell(null);
    setSelectedDate(null);

    toast.info("Changes cancelled");
  };
  /* ================= CANCEL SINGLE CELL CHANGE ================= */
  const cancelCellChange = (rowIndex, columnName) => {
    const updatedEditedRows = editedRows.map((row, index) => {
      if (index !== rowIndex) return row;

      return {
        ...row,
        [columnName]: rows[rowIndex][columnName],
      };
    });

    setEditedRows(updatedEditedRows);

    // Check whether any other unsaved changes remain
    const hasAnyChanges = updatedEditedRows.some((row, rIdx) =>
      headers.some(
        (head) =>
          !["S.No", "SrNo", "Activities", "Freq", "Notify"].includes(head) &&
          String(row[head] ?? "NA") !== String(rows[rIdx][head] ?? "NA"),
      ),
    );

    setHasChanges(hasAnyChanges);

    // Close the date picker if this cell was being edited
    if (editingCell?.row === rowIndex && editingCell?.col === columnName) {
      setEditingCell(null);
      setSelectedDate(null);
    }

    //toast.info("Cell change cancelled");
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
            propertyId: propertyMap[h],
            value: editedVal,
            updatedByName: user?.name,
          });
        }
      }

      if (columnUpdates.length > 0) {
        batchUpdates.push({
          rowIndex: r,
          activityId: editedRows[r].activityId,
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
      await updateMutation.mutateAsync({
        updates: batchUpdates,
      });

      setRows(JSON.parse(JSON.stringify(editedRows)));
      setHasChanges(false);

      // Close the date picker after successful save
      setEditingCell(null);
      setSelectedDate(null);

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
    const updatedEditedRows = [...editedRows];
    updatedEditedRows[rowIndex][columnName] = trimmedValue || "NA";
    setEditedRows(updatedEditedRows);

    const originalValue = rows[rowIndex][columnName];
    if (trimmedValue !== originalValue) {
      setHasChanges(true);
    } else {
      const hasAnyChanges = updatedEditedRows.some((row, rIdx) =>
        headers.some(
          (h, hIdx) =>
            h !== "S.No" && updatedEditedRows[rIdx][h] !== rows[rIdx][h],
        ),
      );
      setHasChanges(hasAnyChanges);
    }

    setEditingCell(null);
  };

  /* ================= GET COLUMN WIDTH ================= */
  const getColumnWidth = (index, header) => {
    if (header === "Activities") return ACTIVITIES_WIDTH;
    return FIXED_COL_WIDTH;
  };

  const getStickyLeft = (index) => {
    let left = 0;
    for (let i = 0; i < index; i++) {
      left += getColumnWidth(i, headers[i]);
    }
    return left;
  };

  /* ================= PARSE HISTORY VALUE ================= */
  const parseHistoryValue = (value) => {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "object") return [];
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

  const getColumnsByStatusForActivities = (activities, targetStatus) => {
    const matchingColumns = new Set();

    const selectedRows = rows.filter((row) =>
      activities.includes(row.Activities),
    );

    selectedRows.forEach((row) => {
      const frequency = row["Freq"];
      const notify = row["Notify"];

      headers.forEach((head) => {
        // Skip only non-property columns.
        // Do not skip columns based on their index.
        if (["Activities", "Freq", "Notify", "S.No", "SrNo"].includes(head)) {
          return;
        }

        const status = getStatusForCell(frequency, row[head], notify);

        if (status === targetStatus) {
          matchingColumns.add(head);
        }
      });
    });

    return [...matchingColumns];
  };

  // getFilterClass
  const getFilterClass = (type, baseClass) =>
    `${baseClass} cursor-pointer transition ${
      statusFilter === type
        ? "ring-2 ring-offset-1 ring-gray-400 font-bold"
        : "opacity-80 hover:opacity-100"
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

  const hideDataColumns =
    statusFilter &&
    filteredColumns.length === 0 &&
    selectedActivities.length > 0;

  const showNoDataFound =
    statusFilter &&
    filteredColumns.length === 0 &&
    selectedActivities.length > 0;

  const moveToNextCell = (rowIndex, colIndex) => {
    let nextCol = colIndex + 1;

    while (nextCol < headers.length && nextCol < 3) {
      nextCol++;
    }

    if (nextCol < headers.length) {
      setEditingCell({ row: rowIndex, col: headers[nextCol] });
    } else {
      const nextRow = rowIndex + 1;
      if (nextRow < rows.length) {
        setEditingCell({
          row: nextRow,
          col: headers.find((h) => h !== "Activities"),
        });
      } else {
        setEditingCell(null);
      }
    }
  };

  /* ================= UI (UPDATED TO MATCH SCREENSHOT) ================= */

  return (
    <div className="w-full  font-sans text-gray-800">
      {/* HEADER SECTION */}

      {/* FILTER & ACTION BAR */}
      <div className="px-6  bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-gray-200">
        <div>
          <h1 className="text-lg font-bold text-gray-400">{title}</h1>
        </div>
        {/* Status Tabs */}
        <div className="flex items-center justify-evenly  gap-6 text-sm font-medium overflow-x-auto pb-1 xl:pb-0">
          <button
            onClick={() => applyStatusFilter("OVERDUE", COLORS.OVERDUE)}
            className={`flex cursor-pointer items-center gap-2 whitespace-nowrap ${statusFilter === "OVERDUE" ? "text-red-700 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-300"></span>{" "}
            Already Late
          </button>
          {/* <button
            onClick={() => applyStatusFilter("SAMEDAY", COLORS.SAMEDAY)}
            className={`flex items-center gap-2 whitespace-nowrap ${statusFilter === "SAMEDAY" ? "text-blue-700 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300"></span>{" "}
            Today's Work
          </button> */}
          <button
            onClick={() => applyStatusFilter("UPCOMING", COLORS.UPCOMING)}
            className={`flex cursor-pointer items-center gap-2 whitespace-nowrap ${statusFilter === "UPCOMING" ? "text-yellow-700 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300"></span>{" "}
            Upcoming
          </button>
          <button
            onClick={() => applyStatusFilter("DONE", COLORS.DONE)}
            className={`flex cursor-pointer items-center gap-2 whitespace-nowrap ${statusFilter === "DONE" ? "text-green-700 font-bold" : "text-gray-500 hover:text-gray-800"}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-green-300"></span> Done
          </button>

          {isFilterApplied && (
            <button
              onClick={resetFilters}
              className="text-xs cursor-pointer text-red-600 underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Save Button Strip */}
      {hasChanges && (
        <div className="absolute  top-20 right-90 z-50">
          {/* Cancel Temporary Changes */}
          {/* <button
            type="button"
            onClick={cancelAllChanges}
            disabled={saving}
            title="Cancel unsaved changes"
            aria-label="Cancel unsaved changes"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-red-200 bg-white text-red-600 shadow-md hover:bg-red-50 disabled:opacity-50 transition-all"
          >
            <X size={18} strokeWidth={2.5} />
          </button> */}
          <button
            onClick={saveAllChanges}
            disabled={saving}
            className="bg-black text-white px-4 py-1 rounded-xl shadow-lg font-bold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader /> Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </button>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="relative h-[calc(100vh-180px)] overflow-auto bg-white">
        {showNoDataFound && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-3 bg-white px-8 py-4 border border-gray-200 rounded-xl shadow-lg text-gray-600 font-semibold">
            <span className="text-2xl">📭</span>
            <span>No Property Found with given Service</span>
          </div>
        )}

        <table className="border-collapse text-sm table-fixed min-w-full">
          <thead className="sticky top-0 z-40 bg-gray-50 shadow-sm">
            <tr>
              {headers.map((head, i) => {
                const isFilteredColumn =
                  head === "Activities" ||
                  (!hideDataColumns &&
                    (filteredColumns.length === 0 ||
                      filteredColumns.includes(head)));

                return (
                  <th
                    key={i}
                    className={`${
                      i === 0 ? "text-center" : "text-left"
                    } py-3 px-4 font-bold  uppercase tracking-wider text-xs border-b border-gray-200 ${
                      i === 0 ? "sticky z-50 bg-gray-50" : ""
                    } ${!isFilteredColumn && i > 0 ? "hidden" : ""}`}
                    style={{
                      left: i === 0 ? getStickyLeft(i) : undefined,
                      width: getColumnWidth(i, head),
                      minWidth: getColumnWidth(i, head),
                      maxWidth: getColumnWidth(i, head),
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {/* Icon for property columns */}
                      {i > 0 && (
                        <svg
                          className="w-4 h-4 "
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          ></path>
                        </svg>
                      )}
                      <span className="truncate">{head}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rIdx) => {
              const frequency = row["Freq"];
              const upl = row["Notify"];

              return (
                <tr
                  key={rIdx}
                  className={`group transition-all duration-200 ${
                    statusFilter &&
                    selectedActivities.length > 0 &&
                    !selectedActivities.includes(row.Activities)
                      ? "bg-gray-50 opacity-40 grayscale"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {headers.map((head, cIdx) => {
                    const sticky = cIdx === 0;
                    const isEditing =
                      editingCell?.row === rIdx && editingCell?.col === head;
                    const currentValue = editedRows[rIdx]?.[head] || row[head];
                    const originalValue = rows[rIdx][head];
                    const isChanged =
                      editedRows[rIdx]?.[head] !== originalValue;
                    const width = getColumnWidth(cIdx, head);
                    const cellStatus =
                      head !== "Activities"
                        ? getStatusForCell(frequency, currentValue, upl)
                        : "";
                    const isFilteredColumn =
                      head === "Activities" ||
                      (!hideDataColumns &&
                        (filteredColumns.length === 0 ||
                          filteredColumns.includes(head)));
                    const isLastColumn = cIdx === headers.length - 1;
                    // Helper to determine pill style content
                    const renderBadge = (status) => {
                      if (!status)
                        return <span className="text-gray-300">—</span>;

                      let label = "";
                      let icon = null;
                      let baseClass =
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ";

                      // Add border and shadow to mimic screenshot pills
                      if (status === COLORS.DONE) {
                        label = "Done";
                        icon = (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        );
                      } else if (status === COLORS.OVERDUE) {
                        label = "Late";
                        icon = (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        );
                      } else if (status === COLORS.SAMEDAY) {
                        label = "Today";
                        icon = (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        );
                      } else if (status === COLORS.UPCOMING) {
                        label = "Upcoming";
                        icon = (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        );
                      } else {
                        // Default/Empty
                        return <span className="text-gray-300">—</span>;
                      }

                      return (
                        <div className={`${baseClass} ${status}`}>
                          {icon}
                          {label}
                        </div>
                      );
                    };

                    return (
                      <td
                        key={cIdx}
                        onDoubleClick={() => {
                          if (head === "Activities") return;

                          setSelectedDate(getDatePickerValue(currentValue));
                          setEditingCell({ row: rIdx, col: head });
                        }}
                        onTouchStart={() => startLongPress(rIdx, head, cIdx)}
                        onTouchEnd={cancelLongPress}
                        onTouchMove={cancelLongPress}
                        className={`border-b border-gray-100 px-4 py-3 relative align-middle
${sticky ? "sticky z-20 bg-white group-hover:bg-gray-50" : "hover:z-50"} 
${!isFilteredColumn ? "hidden" : ""}
`}
                        style={{
                          width: width,
                          minWidth: width,
                          maxWidth: width,
                          ...(sticky && { left: getStickyLeft(cIdx) }),
                        }}
                      >
                        {head === "SrNo" ? (
                          <span className="text-gray-400 font-medium">
                            {rIdx + 1}
                          </span>
                        ) : isEditing ? (
                          <div className="relative z-50 min-w-0 bg-white px-2 py-1">
                            <DatePicker
                              selected={selectedDate}
                              onChange={(date) => {
                                if (!date) return;

                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const selected = new Date(date);
                                selected.setHours(0, 0, 0, 0);

                                if (selected > today) {
                                  toast.error("Future dates are not allowed");
                                  return;
                                }

                                setSelectedDate(date);

                                const updatedEditedRows = [...editedRows];
                                updatedEditedRows[rIdx] = {
                                  ...updatedEditedRows[rIdx],
                                  [head]: formatDatePickerValue(date),
                                };

                                setEditedRows(updatedEditedRows);
                                setHasChanges(
                                  updatedEditedRows.some((row, rowIdx) =>
                                    headers.some(
                                      (h) =>
                                        h !== "S.No" &&
                                        String(row[h] ?? "NA") !==
                                          String(rows[rowIdx][h] ?? "NA"),
                                    ),
                                  ),
                                );
                              }}
                              dateFormat="dd MMM yyyy"
                              maxDate={new Date()}
                              placeholderText="Select date"
                              showPopperArrow={false}
                              popperPlacement="bottom-start"
                              className="w-full bg-transparent outline-none text-sm text-center font-medium text-gray-900"
                              calendarClassName="shadow-xl"
                              open
                            />
                          </div>
                        ) : (
                          <div className="relative group/cell w-full">
                            {(() => {
                              const historyArr =
                                parseHistoryValue(currentValue);
                              const displayValue = historyArr[0]?.text || "-";

                              // Activities Column Custom UI
                              if (head === "Activities") {
                                return (
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedActivities.includes(
                                        row.Activities,
                                      )}
                                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                      onChange={() =>
                                        toggleActivitySelection(
                                          rIdx,
                                          row.Activities,
                                        )
                                      }
                                    />
                                    <div className="flex flex-col text-left">
                                      <span
                                        className="font-bold text-gray-800 text-sm truncate max-w-[200px]"
                                        title={row.Activities}
                                      >
                                        {row.Activities}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Every {frequency}{" "}
                                        {Number(frequency) === 1
                                          ? "Day"
                                          : "Days"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }

                              // Frequency Column
                              if (head === "Freq") {
                                return (
                                  <div className="text-center font-medium text-gray-600">
                                    {frequency}D
                                  </div>
                                );
                              }

                              // Date Cells
                              return (
                                <div className="relative flex justify-center items-center h-full">
                                  {renderBadge(cellStatus)}

                                  {/* Cancel only this cell's unsaved change */}
                                  {isChanged && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelCellChange(rIdx, head);
                                      }}
                                      disabled={saving}
                                      title="Cancel this cell change"
                                      aria-label={`Cancel change for ${head}`}
                                      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 text-red-600 disabled:opacity-50 transition-colors"
                                    >
                                      <X size={14} strokeWidth={2.5} />
                                    </button>
                                  )}

                                  {/* Hover Mark Done Button (Only if Due/Upcoming and no value) */}
                                  {(cellStatus === COLORS.DUE ||
                                    cellStatus === COLORS.OVERDUE ||
                                    cellStatus === COLORS.UPCOMING) && (
                                    <div className="absolute inset-0 hidden group-hover/cell:flex items-center justify-center z-10 transition-all opacity-0 group-hover/cell:opacity-100">
                                      <button
                                        onClick={() => {
                                          const today = new Date();
                                          const day = String(
                                            today.getDate(),
                                          ).padStart(2, "0");
                                          const months = [
                                            "Jan",
                                            "Feb",
                                            "Mar",
                                            "Apr",
                                            "May",
                                            "Jun",
                                            "Jul",
                                            "Aug",
                                            "Sep",
                                            "Oct",
                                            "Nov",
                                            "Dec",
                                          ];
                                          const month =
                                            months[today.getMonth()];
                                          const year = today.getFullYear();
                                          const dateStr = `${day} ${month} ${year}`;
                                          handleCellEdit(rIdx, head, dateStr);
                                        }}
                                        className=" border border-gray-300 shadow-sm hover:bg-gray-50 text-gray-700 text-xs font-semibold py-1 px-3 rounded flex items-center gap-1"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                            d="M12 4v16m8-8H4"
                                          />
                                        </svg>
                                        Mark Done
                                      </button>
                                    </div>
                                  )}

                                  {/* Hover Tooltip for History */}
                                  {/* Hover Tooltip for History */}
                                  {historyArr.length > 0 && (
                                    <div
                                      className={`absolute top-1/2 -translate-y-1/2 opacity-0 invisible group-hover/cell:opacity-100 group-hover/cell:visible transition-opacity duration-200 bg-gray-900 text-white text-xs rounded-md py-2 px-3 pointer-events-none z-[9999] shadow-xl min-w-[150px] w-max ${
                                        isLastColumn
                                          ? "right-full mr-2"
                                          : "left-full ml-2"
                                      }`}
                                    >
                                      <div className="font-bold border-b border-gray-700 pb-1 mb-1">
                                        History
                                      </div>

                                      {historyArr.slice(0, 3).map((h, i) => (
                                        <div
                                          key={i}
                                          className="whitespace-nowrap py-0.5 flex justify-between gap-2"
                                        >
                                          <span>{h.text}</span>
                                          <span className="text-gray-400 text-[10px]">
                                            {h.meta}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
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