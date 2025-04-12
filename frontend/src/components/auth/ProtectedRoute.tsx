import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean; // Set to false for pages that don't require auth but should be tracked
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Store the first visit info in localStorage
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("hasVisitedBefore") !== "true";
    
    if (isFirstVisit) {
      localStorage.setItem("hasVisitedBefore", "true");
      
      // Store the attempted URL for redirection after signup/login
      if (location.pathname !== "/signup" && location.pathname !== "/login") {
        localStorage.setItem("redirectAfterAuth", location.pathname);
      }
    }
  }, [location]);

  // Show loading state if auth is still being checked
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
        <div className="w-16 h-16 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading your ALU experience...</p>
      </div>
    );
  }

  // If auth is required and user is not authenticated, redirect to signup
  if (requireAuth && !isAuthenticated) {
    // Don't redirect if already on login or signup
    if (location.pathname !== "/signup" && location.pathname !== "/login") {
      return <Navigate to="/signup" state={{ from: location }} replace />;
    }
  }

  // If auth is not required or user is authenticated, show the children
  return <>{children}</>;
};