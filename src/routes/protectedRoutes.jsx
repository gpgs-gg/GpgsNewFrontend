import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../auth/services";
import Loader from "../components/common/Loader";

const ProtectedRoute = () => {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;