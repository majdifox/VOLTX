import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";  
import { THEME } from "../../config/theme";
import { useAuthStore } from "../../stores/authStore";

interface SidebarItem {
  to: string;
  label: string;
  icon: string;
  roles?: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const sidebarItems: SidebarItem[] = [
    { to: ROUTES.HOME, label: "Dashboard", icon: "🏠" },
    { to: ROUTES.EVENTS, label: "Events", icon: "🎯" },
    { to: ROUTES.PROFILE, label: "Profile", icon: "👤" },
    { 
      to: ROUTES.ADMIN, 
      label: "Admin Panel", 
      icon: "⚙️", 
      roles: ["ADMIN", "CAPTAIN"] 
    }
  ];

  const isActive = (path: string) => location.pathname === path;
  
  const hasAccess = (item: SidebarItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  const filteredItems = sidebarItems.filter(hasAccess);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className={`text-xl font-bold text-[${THEME.colors.primary}]`}>
              VoltX Menu
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      text-sm font-medium transition-all duration-200
                      ${isActive(item.to)
                        ? `bg-[${THEME.colors.primary}] text-white shadow-md`
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Level {user.level} • {user.adrenalinePoints?.toLocaleString()} pts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
