import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { THEME } from "../../config/theme";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = "/",
  className = ""
}) => {
  const location = useLocation();

  // Auto-generate breadcrumbs from route if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Home", to: ROUTES.HOME }
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Map segments to readable labels
      const label = getSegmentLabel(segment, pathSegments[index - 1]);
      
      if (index === pathSegments.length - 1) {
        // Last item is not clickable
        breadcrumbs.push({ label });
      } else {
        breadcrumbs.push({ label, to: currentPath });
      }
    });

    return breadcrumbs;
  };

  const getSegmentLabel = (segment: string, parentSegment?: string): string => {
    // Handle dynamic route segments
    if (segment.match(/^[0-9]+$/)) {
      return `#${segment}`;
    }

    // Map known segments to labels
    const segmentMap: Record<string, string> = {
      events: "Events",
      profile: "Profile", 
      admin: "Admin",
      login: "Login",
      register: "Register",
      dashboard: "Dashboard",
      users: "Users",
      settings: "Settings"
    };

    return segmentMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400" aria-hidden="true">
                {separator}
              </span>
            )}
            
            {item.to && index < breadcrumbItems.length - 1 ? (
              <Link
                to={item.to}
                className={`hover:text-[${THEME.colors.primary}] transition-colors duration-200`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`
                  ${index === breadcrumbItems.length - 1 
                    ? "text-gray-900 font-medium" 
                    : "text-gray-600"
                  }
                `}
                aria-current={index === breadcrumbItems.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Predefined breadcrumb sets for common pages
export const createBreadcrumbs = {
  profile: (username?: string): BreadcrumbItem[] => [
    { label: "Home", to: ROUTES.HOME },
    { label: "Profile", to: ROUTES.PROFILE },
    ...(username ? [{ label: `@${username}` }] : [])
  ],

  events: (eventId?: string): BreadcrumbItem[] => [
    { label: "Home", to: ROUTES.HOME },
    { label: "Events", to: ROUTES.EVENTS },
    ...(eventId ? [{ label: `Event #${eventId}` }] : [])
  ],

  admin: (section?: string): BreadcrumbItem[] => [
    { label: "Home", to: ROUTES.HOME },
    { label: "Admin", to: ROUTES.ADMIN },
    ...(section ? [{ label: section }] : [])
  ],

  custom: (items: BreadcrumbItem[]): BreadcrumbItem[] => [
    { label: "Home", to: ROUTES.HOME },
    ...items
  ]
};
