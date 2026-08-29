import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../routes/protectedRoutes";
import PublicRoute from "../routes/PublicRoutes";

import Login from "../auth/Login";
import SignupPage from "../auth/SignupPage";

import Dashboard from "../pages/Dashboard";
import Properties from "../pages/Properties";
import Tickets from "../pages/Tickets";
import Settings from "../pages/Settings";
import NewBooking from "../pages/NewBooking";
import Clients from "../pages/Clients";
import AvailableBeds from "../pages/AvailableBeds";
import RentLedger from "../pages/RentLedger";
import BankTransaction from "../pages/BankTransaction";
import User from "../pages/User";
import FandFsettlement from "../pages/FandFsettlement";
import Salary from "../pages/Salary";
import Employees from "../pages/Employees";
import Attendance from "../pages/Attendance";
import ACEBCalculation from "../pages/ACEBCalculation";
import ClientTickets from "../pages/ClientTicket";
import EBInfoList from "../pages/EBInfo";
import Options from "../pages/Options";
import BedsTable from "../pages/Beds";
import Sidebar from "../pages/Sidebar";
import Permission from "../pages/Permission";

import ModuleCreateEdit from "../components/moduleSidebar/ModuleCreateEdit";
import RolePermissionCreateEdit from "../components/RolePermission/RolePermissionCreateEdit";
import SalaryEdit from "../components/Salary/SalaryEdit";
import UserEdit from "../components/User/UserEdit";
import LeadsList from "../components/leads/LeadsList";
import LeadsCreateEdit from "../components/leads/LeadsCreateEdit";
import PropertyCreateEdit from "../components/properties/PropertyCreateEdit";
import BedCreateEdit from "../components/beds/BedCreateEdit";
import NewBookingCreateEdit from "../components/newBooking/NewBookingCreateEdit";
import NewBookingTable from "../components/newBooking/NewBookingTable";
import ClientCreateEdit from "../components/Clients/ClientCreateEdit";
import RentLadgerEdit from "../components/RentLedger/RentLadgerEdit";
import TicketCreateEdit from "../components/tickets/TicketCreateEdit";
import TicketView from "../components/tickets/TicketView";
import OptionsCreateEdit from "../components/Options/OptionsCreateEdit";
import ClientRentHistory from "../pages/ClientRentHistory";
import HousekeepingPage from "../components/Daily/DailyToDoHouseKeeping/HouseKeeping";
import Maintenance from "../components/Daily/DailyToDoMaintenace/Maintenance";
import EmployeesCreate from "../components/EmployeeDetails/EmployeesCreate";
import CheckinOut from "../components/Attendance/CheckinOut";
import AllAttendanceTable from "../components/Attendance/AllAttendanceTable";
import Rnr from "../pages/Rnr";
import ClientTicketCreateEdit from "../clientComponents/ClientTicket/TicketCreateEdit";
import AreaCreatEdit from "../components/acebCalculation/AreaCreatEdit";
import ACEBReadingList from "../components/acebCalculation/ACEBReadingList";
import ACEBReadingCreateEdit from "../components/acebCalculation/ACEBReadingCreateEdit";
import EBInfoCreateEdit from "../components/EBInfo/EBInfoCreateEdit";
import BankTransactionEdit from "../components/Banktransactions/BankTransationEdit";
import BankStatementUpload from "../components/Banktransactions/BankTransactionUpload";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
            <Login />
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/create" element={<PropertyCreateEdit />} />
          <Route path="/properties/edit/:id" element={<PropertyCreateEdit />} />
          <Route path="/beds" element={<BedsTable />} />
          <Route path="/bed/create" element={<BedCreateEdit />} />
          <Route path="/bed/edit/:id" element={<BedCreateEdit />} />
          <Route path="/new-bookings" element={<NewBookingTable />} />
          <Route path="/new-bookings/create" element={<NewBookingCreateEdit />} />
          <Route path="/new-bookings/edit/:id" element={<NewBookingCreateEdit />} />
          <Route path="/rent-ledger" element={<RentLedger />} />
          <Route path="/rent-ledger/edit/:clientId" element={<RentLadgerEdit />} />
          <Route path="/rent-ledger/view/:clientId" element={<RentLadgerEdit />} />
          <Route path="/rent-ledger/client/:clientId" element={<RentLedger />} />
          <Route path="/available-beds" element={<AvailableBeds />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/create" element={<ClientCreateEdit />} />
          <Route path="/clients/edit/:clientId" element={<ClientCreateEdit />} />
          <Route path="/clients/view/:clientId" element={<ClientCreateEdit />} />
          <Route path="/tickets/create" element={<TicketCreateEdit />} />
          <Route path="/tickets/edit/:id" element={<TicketCreateEdit />} />
          <Route path="/tickets/view/:id" element={<TicketView />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/bank-transactions" element={<BankTransaction />} />
          <Route path="/bank-transactions/upload" element={<BankStatementUpload />} />
          <Route path="/bank/edit/:account/:id" element={<BankTransactionEdit />}/>
          <Route path="/options" element={<Options />} />
          <Route path="/options/create" element={<OptionsCreateEdit />} />
          <Route path="/options/edit/:id" element={<OptionsCreateEdit />} />
          <Route path="/users" element={<User />} />
          <Route path="/Users/edit/:id" element={<UserEdit />} />
          <Route path="/leads" element={<LeadsList />} />
          <Route path="/leads/edit/:id" element={<LeadsCreateEdit />} />
          <Route path="/leads/create" element={<LeadsCreateEdit />} />
          <Route path="/renthistory" element={<ClientRentHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/house-keeping" element={<HousekeepingPage />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/create" element={<EmployeesCreate />} />
          <Route path="/employees/edit/:id" element={<EmployeesCreate />} />
          <Route path="/check-in-out" element={<CheckinOut />} />
          <Route path="/attendance/all" element={<Attendance />} />
          <Route path="/full-&-final-settlement" element={<FandFsettlement />} />
          <Route path="/rent-not-received" element={<Rnr />} />
          <Route path="/salary/all" element={<Salary />} />
          <Route path="/salary/edit/:employeeId" element={<SalaryEdit />} />
          <Route path="/aceb-area" element={<ACEBCalculation />} />
          <Route path="/aceb-area/create" element={<AreaCreatEdit />} />
          <Route path="/aceb-area/edit/:id" element={<AreaCreatEdit />} />
          <Route path="/aceb-area/reading/:propertyId" element={<ACEBReadingList />}/>
          <Route path="/aceb-area/:propertyId/reading/create" element={<ACEBReadingCreateEdit />} />
          <Route path="/aceb-area/:propertyId/reading/edit/:id" element={<ACEBReadingCreateEdit />}/>
          <Route path="/eb-info" element={<EBInfoList />} />
          <Route path="/eb-info/create" element={<EBInfoCreateEdit />} />
          <Route path="/eb-info/edit/:id" element={<EBInfoCreateEdit />} />
          <Route path="/client-tickets/create" element={<ClientTicketCreateEdit />} />
          <Route path="/client-tickets/edit/:id" element={<ClientTicketCreateEdit />} />
          <Route path="/client-tickets" element={<ClientTickets />} />
          <Route path="/module" element={<Sidebar />} />
          <Route path="/modules/create" element={<ModuleCreateEdit />} />
          <Route path="/modules/edit/:id" element={<ModuleCreateEdit />} />
          <Route path="/permissions" element={<Permission />} />
          <Route path="/permissions/create" element={<RolePermissionCreateEdit />}/>
          <Route path="/permissions/employee/:id/edit" element={<RolePermissionCreateEdit />}/>
          <Route path="/permissions/employee/:id" element={<RolePermissionCreateEdit mode="view" />}/>
       



































          
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;