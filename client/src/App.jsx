import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";
import UserDashboardNavbar from "./components/UserDashboardNavbar";
import UserDashboard from "./components/UserDashboard";
import UserValidation from "./components/UserValidation";
import UserDeveloper from "./components/UserDeveloper";
import UserVisualization from "./components/UserVisualization";
import UserOutput from "./components/UserOutput";
import UserProfile from "./components/UserProfile";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Application Routes */}
        <Route element={<UserLayout />}>
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["Stakeholder"]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/validator" element={
            <ProtectedRoute allowedRoles={["Stakeholder"]}>
              <UserValidation />
            </ProtectedRoute>
          } />
          
          <Route path="/developer" element={
            <ProtectedRoute allowedRoles={["Developer"]}>
              <UserDeveloper />
            </ProtectedRoute>
          } />
          
          <Route path="/visualization" element={
            <ProtectedRoute allowedRoles={["Developer"]}>
              <UserVisualization />
            </ProtectedRoute>
          } />
          
          <Route path="/output" element={
            <ProtectedRoute allowedRoles={["Developer", "Stakeholder"]}>
              <UserOutput />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
