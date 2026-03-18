import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole') || 'Stakeholder';

  // If not logged in, boot back to landing
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Admins bypass all restrictions
  if (userRole === "Admin") {
    return children;
  }

  // Check if current user role is allowed for this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Determine fallback safe route based on their role
    if (userRole === "Developer") {
       return <Navigate to="/profile" replace />;
    } else {
       return <Navigate to="/profile" replace />;
    }
  }

  // All checks passed
  return children;
}
