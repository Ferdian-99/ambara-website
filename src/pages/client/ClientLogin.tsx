import { Navigate, useLocation } from "react-router-dom";

export function ClientLogin() {
  const location = useLocation();
  return <Navigate to="/login" replace state={location.state} />;
}
