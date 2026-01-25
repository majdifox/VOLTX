import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, StatusBadge, LevelBadge } from "../UI";
import { ROUTES } from "../../config/routes";
import { formatters } from "../../utils/formatters";
import type { UserDTO } from "../../types/user";

interface UserCardProps {
  user: UserDTO;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  onEdit?: (user: UserDTO) => void;
  onView?: (user: UserDTO) => void;
  className?: string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  variant = "default",
  showActions = false,
  onEdit,
  onView,
  className = ""
}) => {
  const userProfileUrl = ROUTES.PROFILE.replace(":username?", user.username || "");

  const renderAvatar = (size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-base", 
      lg: "w-16 h-16 text-xl"
    };

    return (
      <div className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-blue-500 to-purple-600 
        rounded-full flex items-center justify-center 
        text-white font-bold flex-shrink-0
      `}>
        {user.firstName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderCompactCard = () => (
    <Card variant="outlined" padding="sm" className={`hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center space-x-3">
        {renderAvatar("sm")}
        
        <div className="flex-1 min-w-0">
          <Link 
            to={userProfileUrl}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block"
          >
            {formatters.formatFullName(user.firstName || "", user.lastName || "")}
          </Link>
          <p className="text-sm text-gray-500 truncate">
            @{user.username}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <LevelBadge level={user.level || 1} size="sm" />
          <StatusBadge status={user.accountStatus?.toLowerCase() as any || "active"} size="sm" />
        </div>
      </div>
    </Card>
  );

  const renderDefaultCard = () => (
    <Card 
      variant="default" 
      className={`hover:shadow-lg transition-all duration-200 ${className}`}
      hover={true}
    >
      <div className="flex items-start space-x-4">
        {renderAvatar("md")}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <Link 
                to={userProfileUrl}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {formatters.formatFullName(user.firstName || "", user.lastName || "")}
              </Link>
              <p className="text-gray-600">@{user.username}</p>
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <LevelBadge level={user.level || 1} />
              <StatusBadge status={user.accountStatus?.toLowerCase() as any || "active"} />
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>{formatters.formatPointsCompact(user.adrenalinePoints || 0)} points</span>
            </div>
            {user.createdAt && (
              <div>
                Joined {formatters.formatTimeAgo(user.createdAt)}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex space-x-2">
              {onView && (
                <button
                  onClick={() => onView(user)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Profile
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(user)}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderDetailedCard = () => (
    <Card variant="elevated" className={`${className}`}>
      <div className="text-center mb-6">
        {renderAvatar("lg")}
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {formatters.formatFullName(user.firstName || "", user.lastName || "")}
          </h3>
          <p className="text-gray-600">@{user.username}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatters.formatPointsCompact(user.adrenalinePoints || 0)}
          </div>
          <div className="text-sm text-gray-600">Adrenaline Points</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {user.level || 1}
          </div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        <LevelBadge level={user.level || 1} showLevel={false} />
        <StatusBadge status={user.accountStatus?.toLowerCase() as any || "active"} />
      </div>

      {showActions && (
        <div className="flex space-x-2 justify-center">
          <Link 
            to={userProfileUrl}
            className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Profile
          </Link>
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </Card>
  );

  switch (variant) {
    case "compact":
      return renderCompactCard();
    case "detailed":
      return renderDetailedCard();
    default:
      return renderDefaultCard();
  }
};
