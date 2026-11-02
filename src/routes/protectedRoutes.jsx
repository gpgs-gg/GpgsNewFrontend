import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../auth/services";
import Loader from "../components/common/Loader";

const CLIENT_ALLOWED_ROUTES = [
  "/renthistory",
  "/client-tickets",
  "/client-tickets/create",
  "/agreement-details",
  "/prop-perso-details",
  "/eb-details-for-clients",
];

const ProtectedRoute = () => {
  const { data, isLoading } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return <Loader />;
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  const role = data.user?.role?.trim().toLowerCase();

  if (role === "client") {
    const isAllowed = CLIENT_ALLOWED_ROUTES.some(
      (route) =>
        location.pathname === route ||
        location.pathname.startsWith(`${route}/`)
    );

    if (!isAllowed) {
      return <Navigate to="/renthistory" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;




// import { Navigate, Outlet } from "react-router-dom";
// import { useCurrentUser } from "../auth/services";
// import Loader from "../components/common/Loader";

// const ProtectedRoute = () => {
//   const { data, isLoading } = useCurrentUser();

//   if (isLoading) {
//     return <Loader />;
//   }

//   if (!data?.user) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;