import DailyTodoTable from "../components/DailyToDoTable";
import {
  useHouseKeepingData,
  useUpdateHouseKeepingRow,
} from "../DailyToDoHouseKeeping/services/index";
import { usePropertiesData } from "../../properties/services/index";
import { data } from "react-router-dom";
export default function HousekeepingPage() {
  // const { data: propertyData } = usePropertiesData({
  //   all: true,
  // });
  // console.log("data of propeties", propertyData.data);
  return (
    <DailyTodoTable
      title="DailyTodo – Housekeeping"
      useFetchHook={useHouseKeepingData}
      useUpdateHook={useUpdateHouseKeepingRow}
    />
  );
}


