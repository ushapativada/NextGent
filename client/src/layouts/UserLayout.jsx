import { Outlet, useLocation } from "react-router-dom";
import UserDashboardNavbar from "../components/UserDashboardNavbar";
import Footer from "../components/footer";

export default function UserLayout() {
    const location = useLocation();
    const isDashboard = location.pathname === "/dashboard";

    return (
        <div className="min-h-screen flex flex-col">
            {/* NavBar  */}
            <UserDashboardNavbar />

            {/* Page Content */}
            <main className="flex-1 p-6 bg-black">
                <Outlet />
            </main>

            {/* Footer - Hidden on Dashboard */}
            {!isDashboard && <Footer />}
        </div>
    );
}
