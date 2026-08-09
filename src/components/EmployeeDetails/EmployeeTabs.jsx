import React from "react";

const EmployeeTabs = ({
  activeTab,
  setActiveTab,
  editingRow,
  reset,
  getNextEmployeeID,
  setEditingRow
}) => {

  const tabClass = (tab) =>
    `
    flex items-center space-x-2 px-3 py-2 text-lg font-medium rounded-md
    sm:rounded-t-lg border-b-2 transition-colors
    text-left w-full sm:w-auto
    ${activeTab === tab
      ? "text-orange-600 border-orange-600 bg-orange-50"
      : "text-black border-transparent hover:text-gray-900 hover:border-gray-300"
    }
  `;

  return (
    <nav className="px-0 sm:px-0 shadow-sm">
        <div className="relative bg-gray-50 rounded-t-lg px-2 pt-2 flex items-center gap-6 overflow-hidden">

        {/* Flowing Background Text */}
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none select-none pr-6 pt-2 animate-floatRight">
          <h1 className="text-[45px] font-bold text-gray-500 opacity-20 whitespace-nowrap">
            Employees List - GG
          </h1>
        </div>

          {/* Left buttons */}
          <div className=" relative
      grid grid-cols-2 gap-2
      sm:flex sm:flex-row sm:space-x-6 sm:space-y-0
      border-b">

            <button
              onClick={() => {
                setActiveTab("DASHBOARD");
                setEditingRow(null);
                reset();
              }}
              className={tabClass("DASHBOARD")}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("LIST");
                setEditingRow(null);
                reset();
              }}
              className={tabClass("LIST")}
            >
              <i className="fas fa-ticket-alt"></i>
              <span>All Info</span>
            </button>

            {editingRow ? (
              <button
              className={tabClass("CREATE")}
              >
                <i className="fas fa-edit"></i>
                <span>Update Info</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingRow(null);
                  reset({
                    // ParentCompany: "Gopal's Group",
                    // Role: "admin",
                    EmployeeID: getNextEmployeeID()
                  });
                  setActiveTab("CREATE");
                }}
                className={tabClass("CREATE")}
              >
                <i className="fas fa-plus-circle"></i>
                <span>Create New</span>
              </button>
            )}
          </div>
        </div>
      </nav>   
  );
};

export default EmployeeTabs;