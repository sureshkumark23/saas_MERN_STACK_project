import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Check if the user has a token in their browser's local storage
  const isAuthenticated = localStorage.getItem("token") !== null;

  if (!isAuthenticated) {
    // If there is no token, immediately redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If they are authenticated, allow them to see the page
  return <>{children}</>;
}