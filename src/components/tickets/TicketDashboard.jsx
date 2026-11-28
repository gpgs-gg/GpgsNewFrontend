import React, { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import {
  Ticket,
  Clock3,
  Check,
  ListChecks,
  LoaderCircle,
  CircleCheck,
  CircleX,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import { useTicketDashboardData } from "./services/index";
import { useBatchOptions } from "../Options/services";
import { selectStyles } from "../../utils/selectStyles";
import Chart from "chart.js/auto";
// ============================================================
// CONFIGURATION
// ============================================================

const STATUS_CONFIG = [
  { key: "open", label: "Open", color: "#f97316" },
  { key: "inProgress", label: "In Progress", color: "#3b82f6" },
  { key: "resolved", label: "Resolved", color: "#10b981" },
  { key: "closed", label: "Closed", color: "#6b7280" },
  { key: "acknowledged", label: "Acknowledged", color: "#eab308" },
  { key: "assigned", label: "Assigned", color: "#64748b" },
  { key: "reOpen", label: "ReOpen", color: "#ef4444" },
];

const PRIORITY_CONFIG = [
  { key: "low", label: "Low", color: "#10b981" },
  { key: "medium", label: "Medium", color: "#f59e0b" },
  { key: "high", label: "High", color: "#f97316" },
  { key: "critical", label: "Critical", color: "#ef4444" },
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status = "") => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, "");

  const classes = {
    open: "bg-orange-100 text-orange-700",
    acknowledged: "bg-blue-100 text-blue-700",
    assigned: "bg-slate-100 text-slate-700",
    inprogress: "bg-teal-100 text-teal-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-700",
    reopen: "bg-red-100 text-red-700",
  };

  return classes[normalized] || "bg-gray-100 text-gray-700";
};

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ label, value, icon: Icon, color, background }) => (
  <div className="bg-white p-4 rounded-lg shadow card-hover border border-gray-100">
    <div className="flex items-center">
      <div
        className="p-2 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: background,
          color,
        }}
      >
        <Icon size={20} />
      </div>

      <div className="ml-3 min-w-0">
        <p className="text-xs font-medium text-gray-600">{label}</p>

        <p className="text-xl font-bold text-gray-900">{formatNumber(value)}</p>
      </div>
    </div>
  </div>
);

// ============================================================
// DASHBOARD
// ============================================================

export const TicketDashboard = () => {
  const statusChartRef = useRef(null);
  const priorityChartRef = useRef(null);

  const statusChartInstance = useRef(null);
  const priorityChartInstance = useRef(null);
  const { control, watch } = useForm({
    defaultValues: {
      departmentId: null,
    },
  });

  const selectedDepartment = watch("departmentId");
  const { data: options = {} } = useBatchOptions(["department"]);

  // ----------------------------------------------------------
  // DEPARTMENT OPTIONS
  // ----------------------------------------------------------

  const departmentOptions = options.department || [];

  // ----------------------------------------------------------
  // DASHBOARD API
  // ----------------------------------------------------------

  const {
    data: dashboardResponse,
    isPending,
    isError,
    error,
  } = useTicketDashboardData(
    selectedDepartment?.value ? { department: selectedDepartment.value } : {},
  );

  const dashboardData = dashboardResponse?.data || {};

  const total = Number(dashboardData.total || 0);

  // ----------------------------------------------------------
  // NORMALIZE STATUS COUNTS
  // ----------------------------------------------------------

  const apiStatusCounts = dashboardData.statusCounts || {};

  const statusCounts = {
    open: Number(apiStatusCounts.Open || 0),

    inProgress: Number(apiStatusCounts["In Progress"] || 0),

    resolved: Number(apiStatusCounts.Resolved || 0),

    closed: Number(apiStatusCounts.Closed || 0),

    acknowledged: Number(apiStatusCounts.Acknowledged || 0),

    assigned: Number(apiStatusCounts.Assigned || 0),

    reOpen:
      Number(apiStatusCounts.ReOpen || 0) +
      Number(apiStatusCounts["Re-Open"] || 0),
  };

  // ----------------------------------------------------------
  // NORMALIZE PRIORITY COUNTS
  // ----------------------------------------------------------

  const apiPriorityCounts = dashboardData.priorityCounts || {};

  const priorityCounts = {
    low: Number(apiPriorityCounts.Low || 0),
    medium: Number(apiPriorityCounts.Medium || 0),
    high: Number(apiPriorityCounts.High || 0),
    critical: Number(apiPriorityCounts.Critical || 0),
  };

  // ----------------------------------------------------------
  // STATISTICS CARDS
  // ----------------------------------------------------------

  const stats = [
    {
      label: "Total",
      value: total,
      icon: Ticket,
      color: "#ea580c",
      background: "#ffedd5",
    },
    {
      label: "Open",
      value: statusCounts.open,
      icon: Clock3,
      color: "#ca8a04",
      background: "#fef9c3",
    },
    {
      label: "Acknowledged",
      value: statusCounts.acknowledged,
      icon: Check,
      color: "#2563eb",
      background: "#dbeafe",
    },
    {
      label: "Assigned",
      value: statusCounts.assigned,
      icon: ListChecks,
      color: "#475569",
      background: "#f1f5f9",
    },
    {
      label: "In Progress",
      value: statusCounts.inProgress,
      icon: LoaderCircle,
      color: "#ea580c",
      background: "#ffedd5",
    },
    {
      label: "Resolved",
      value: statusCounts.resolved,
      icon: CircleCheck,
      color: "#16a34a",
      background: "#dcfce7",
    },
    {
      label: "Closed",
      value: statusCounts.closed,
      icon: CircleX,
      color: "#475569",
      background: "#f1f5f9",
    },
    {
      label: "Critical",
      value: priorityCounts.critical,
      icon: AlertTriangle,
      color: "#dc2626",
      background: "#fee2e2",
    },
    {
      label: "ReOpen",
      value: statusCounts.reOpen,
      icon: RotateCcw,
      color: "#dc2626",
      background: "#fee2e2",
    },
  ];

  // ----------------------------------------------------------
  // CHART DATA
  // ----------------------------------------------------------

  const statusChartData = useMemo(
    () =>
      STATUS_CONFIG.map((item) => ({
        label: item.label,
        value: statusCounts[item.key] || 0,
        color: item.color,
      })),
    [
      statusCounts.open,
      statusCounts.inProgress,
      statusCounts.resolved,
      statusCounts.closed,
      statusCounts.acknowledged,
      statusCounts.assigned,
      statusCounts.reOpen,
    ],
  );

  const priorityChartData = useMemo(
    () =>
      PRIORITY_CONFIG.map((item) => ({
        label: item.label,
        value: priorityCounts[item.key] || 0,
        color: item.color,
      })),
    [
      priorityCounts.low,
      priorityCounts.medium,
      priorityCounts.high,
      priorityCounts.critical,
    ],
  );

  // ----------------------------------------------------------
  // CHARTS - CHART.JS
  // ----------------------------------------------------------

  // ============================================================
  // CHARTS - CHART.JS
  // ============================================================

  useEffect(() => {
    if (isPending || isError) return;

    const statusCanvas = statusChartRef.current;
    const priorityCanvas = priorityChartRef.current;

    if (!statusCanvas || !priorityCanvas) return;

    // Destroy previous chart instances
    statusChartInstance.current?.destroy();
    priorityChartInstance.current?.destroy();

    // STATUS DOUGHNUT CHART
    statusChartInstance.current = new Chart(statusCanvas, {
      type: "doughnut",

      data: {
        labels: statusChartData.map((item) => item.label),

        datasets: [
          {
            data: statusChartData.map((item) => item.value),
            backgroundColor: statusChartData.map((item) => item.color),
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverOffset: 6,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 18,
            },
          },
        },

        cutout: "65%",
      },
    });

    // PRIORITY BAR CHART
    priorityChartInstance.current = new Chart(priorityCanvas, {
      type: "bar",

      data: {
        labels: priorityChartData.map((item) => item.label),

        datasets: [
          {
            label: "Tickets",
            data: priorityChartData.map((item) => item.value),
            backgroundColor: priorityChartData.map((item) => item.color),
            borderRadius: 6,
            maxBarThickness: 55,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });

    return () => {
      statusChartInstance.current?.destroy();
      priorityChartInstance.current?.destroy();

      statusChartInstance.current = null;
      priorityChartInstance.current = null;
    };
  }, [statusChartData, priorityChartData, isPending, isError]);
  // ----------------------------------------------------------
  // RECENT TICKETS
  // ----------------------------------------------------------

  const recentTickets = dashboardData.recentTickets || [];

  // ----------------------------------------------------------
  // LOADING SKELETON
  // ----------------------------------------------------------

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-7 w-52 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded mt-3 animate-pulse" />
          </div>
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-20 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ERROR STATE
  // ----------------------------------------------------------

  if (isError) {
    return (
      <div className="bg-white p-8 rounded-lg border border-red-200 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-3" size={32} />

        <h3 className="font-semibold text-gray-900">
          Unable to load dashboard
        </h3>

        <p className="text-sm text-gray-500 mt-2">
          {error?.response?.data?.message ||
            error?.message ||
            "Something went wrong."}
        </p>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h2>

          <p className="text-gray-600">
            Comprehensive view of ticket management system
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          {/* Back Button */}
          <Link
            to="/tickets"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5
      bg-white border border-gray-300 rounded-lg text-sm font-medium
      text-gray-700 hover:bg-gray-50 hover:border-gray-400
      transition-colors whitespace-nowrap"
          >
            <span className="text-lg leading-none">←</span>
            Back to Tickets
          </Link>
          {/* Department Filter */}
          <div className="w-full sm:w-64">
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Department</label>

                  <Select
                    {...field}
                    options={departmentOptions}
                    isSearchable
                    isClearable
                    placeholder="Departments"
                    value={field.value}
                    onChange={field.onChange}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
      {/* ERROR MESSAGE */}

      {/* STATISTICS CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Ticket Status Distribution
          </h3>

          <div className="relative h-[300px]">
            <canvas ref={statusChartRef} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>

          <div className="relative h-[300px]">
            <canvas ref={priorityChartRef} />
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      {/* Recent Tickets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Tickets</h3>

          <Link
            to="/tickets"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentTickets.length > 0 ? (
            recentTickets.slice(0, 8).map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-center gap-4 p-3 hover:bg-[#F8F9FB] rounded-lg"
              >
                <div
                  className={`w-3 h-3 shrink-0 rounded-full ${getPriorityColor(
                    ticket.priority,
                  )}`}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {ticket.title || "Untitled Ticket"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {ticket.ticketId || "-"} •{" "}
                    {ticket.createdByName || ticket.createdBy || "-"} •{" "}
                    {formatDate(ticket.createdAt)}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusClass(
                    ticket.status,
                  )}`}
                >
                  {ticket.status || "-"}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-sm text-gray-500">
              No recent tickets found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDashboard;