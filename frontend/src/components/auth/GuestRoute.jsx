import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // or show a spinner

  return user ? <Navigate to="/" replace /> : children;
};

export default GuestRoute;
