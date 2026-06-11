import { Navigate, useLocation } from "react-router-dom";

export function AdminLogin() {
  const location = useLocation();
  return <Navigate to="/login" replace state={location.state} />;
}
