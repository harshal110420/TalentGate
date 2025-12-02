import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../skeletons/LoadingScreen";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default PrivateRoute;
