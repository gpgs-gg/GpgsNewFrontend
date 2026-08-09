import { useMemo } from "react";

const StatCard = ({ title, value, subtitle, color }) => {
  return (
    <div
      className="bg-white rounded-xl shadow p-5 border-l-4"
      style={{ borderColor: color }}
    >
      <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

const EmployeesDashboard = ({ data = [] }) => {

  const stats = useMemo(() => {
  const total = data.filter((ele)=> ele.IsActive.toLowerCase().trim() !== "no").length;

  const activeEmployees = data.filter(
    emp => emp.IsActive?.toLowerCase().trim() !== "no"
  );

  const active = activeEmployees.length;

  const emergency1Found = activeEmployees.filter(
    emp => !emp.EmgyCont1No?.trim()
  ).length;

  const emergency2Found = activeEmployees.filter(
    emp => !emp.EmgyCont2No?.trim()
  ).length;

  const loginIdFound = activeEmployees.filter(
    emp => !emp.LoginID?.trim()
  ).length;

  const aadharFound = activeEmployees.filter(
    emp => !emp.AadharURL?.trim()
  ).length;

  const bankDetailsFound = activeEmployees.filter(
    emp => !emp.BankPassbookURL?.trim()
  ).length;

  const PhotoFound = activeEmployees.filter(
    emp => !emp.PhotoURL?.trim()
  ).length;

    return {
      total,
      active,
      emergency1Found,
      emergency2Found,
      loginIdFound,
      aadharFound,
      bankDetailsFound,
      PhotoFound
    };

  }, [data]);

  return (
    <div className="overflow-auto space-y-6 bg-white h-screen p-5">

      {/* HEADER */}
      {/* <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Employees Details Dashboard
        </h2>
        <h2 className="text-gray-600 text-lg">
          Overview
        </h2>
      </div> */}

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

        <StatCard
          title="Total Employees"
          value={stats.total}
          color="#2563eb"
        />

        <StatCard
          title="Active Employees"
          value={stats.active}
          color="#22c55e"
        />

        <StatCard
          title="Emergency Contact 1 Not Found"
          value={stats.emergency1Found}
          color="#f59e0b"
        />

        <StatCard
          title="Emergency Contact 2 Not Found"
          value={stats.emergency2Found}
          color="#ef4444"
        />

        <StatCard
          title="Login ID Not Found"
          value={stats.loginIdFound}
          color="#8b5cf6"
        />

        <StatCard
          title="Aadhar Card Not Found"
          value={stats.aadharFound}
          color="#2563eb"
        />

        <StatCard
          title="Bank Details Not Found"
          value={stats.bankDetailsFound}
          color="#22c55e"
        />

        <StatCard
          title="Photo Not Found"
          value={stats.PhotoFound}
          // subtitle="Photo Not available"
          color="#f59e0b"
        />

      </div>
    </div>
  );
};

export default EmployeesDashboard;