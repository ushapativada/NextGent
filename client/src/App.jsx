import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";
import UserDashboardNavbar from "./components/UserDashboardNavbar";
import UserDashboard from "./components/UserDashboard";
import UserValidation from "./components/UserValidation";
import UserDeveloper from "./components/UserDeveloper";

import UserOutput from "./components/UserOutput";
import UserProfile from "./components/UserProfile";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected Application Routes */}
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/validator" element={<UserValidation />} />
          <Route path="/developer" element={<UserDeveloper />} />
          <Route path="/output" element={<UserOutput />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
