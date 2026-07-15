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

import PropertyCreateEdit from "../components/properties/PropertyCreateEdit";
import BedsTable from "../components/beds/BedsTable";
import BedCreateEdit from "../components/beds/BedCreateEdit";
import NewBookingCreateEdit from "../components/newBooking/NewBookingCreateEdit";
import NewBookingTable from "../components/newBooking/NewBookingTable";
import ClientCreateEdit from "../components/Clients/ClientCreateEdit";
import RentLadgerEdit from "../components/RentLedger/RentLadgerEdit";
import TicketCreateEdit from "../components/tickets/TicketCreateEdit";
import TicketView from "../components/tickets/TicketView";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
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
          <Route path="/tickets/view/:id" element={<TicketView/>} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;