import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { selectIsAuthenticated } from "@/store/slices/userSlices/user.slice";

const AuthRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return !isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

export default AuthRoute;