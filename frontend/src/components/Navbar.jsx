import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notifications from "./Notifications";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <img src="/miniDrive.svg" alt="Mini Drive" className="h-7 w-7" />
            <span className="flex text-gray-900 items-center gap-2">
              Mini Drive
              {user.role === "admin" && (
                <sup className="ml-1 text-[10px] p-1 font-semibold text-blue-600 border border-blue-600 rounded-full px-1 leading-none">
                  admin
                </sup>
              )}
            </span>
          </h1>
          <div className="flex items-center gap-4">
            <Notifications />
            <span className="text-sm font-medium text-gray-700">
              {user.name}
            </span>
            {user.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-black transition-colors"
              >
                Dashboard
              </button>
            )}

            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
