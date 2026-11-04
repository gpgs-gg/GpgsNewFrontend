import DailyTodoTable from "../components/DailyToDoTable";

import {
  useMaintenanceData,
  useUpdateMaintenanceRow,
} from "../DailyToDoMaintenace/services/index";

export default function MaintenancePage() {
  return (
    <DailyTodoTable
      title="DailyTodo – Maintenance"
      useFetchHook={useMaintenanceData}
      useUpdateHook={useUpdateMaintenanceRow}
    />
  );
}