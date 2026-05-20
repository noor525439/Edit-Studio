import { Navigate } from "react-router-dom";
import { getData } from "@/context/userContext";
import { dashboardPath } from "@/lib/roles";

const RoleGuard = ({ children, allowedRoles }) => {
  const { user } = getData();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  return children;
};

export default RoleGuard;
