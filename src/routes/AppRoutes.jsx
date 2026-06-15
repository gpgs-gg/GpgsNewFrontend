import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import Beds from "../pages/Beds";
import Properties from "../pages/Properties";
import Tickets from "../pages/Tickets";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import PropertyCreateEdit from "../components/properties/PropertyCreateEdit";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/beds" element={<Beds />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/properties/create" element={<PropertyCreateEdit />} />
        <Route path="/properties/edit/:id" element={<PropertyCreateEdit />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;