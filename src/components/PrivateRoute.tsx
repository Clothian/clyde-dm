import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner or skeleton while checking auth status
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-arcane-darker">
        <div className="arcane-card p-8 text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-arcane-purple animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-arcane-purple animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 rounded-full bg-arcane-purple animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-400">Verifying magical credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page, saving the current location they were trying to go to
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return <>{children}</>;
};

export default PrivateRoute; 