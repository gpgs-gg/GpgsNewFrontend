import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../auth/services";
import Loader from "../components/common/Loader";

const PublicRoute = ({ children }) => {
  const { data, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader />;
  }

  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;