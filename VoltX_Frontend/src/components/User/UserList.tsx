import React, { useState } from "react";
import { UserCard } from "./UserCard";
import { Loading, Input, Button } from "../UI";
import type { UserDTO } from "../../types/user";

interface UserListProps {
  users: UserDTO[];
  loading?: boolean;
  variant?: "default" | "compact" | "detailed";
  searchable?: boolean;
  sortable?: boolean;
  showActions?: boolean;
  onUserAction?: (action: string, user: UserDTO) => void;
  emptyMessage?: string;
  className?: string;
}

type SortOption = "name" | "level" | "points" | "joined";
type SortDirection = "asc" | "desc";

export const UserList: React.FC<UserListProps> = ({
  users,
  loading = false,
  variant = "default",
  searchable = false,
  sortable = false,
  showActions = false,
  onUserAction,
  emptyMessage = "No users found",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "name":
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      
      case "level":
        comparison = (a.level || 0) - (b.level || 0);
        break;
      
      case "points":
        comparison = (a.adrenalinePoints || 0) - (b.adrenalinePoints || 0);
        break;
      
      case "joined":
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        comparison = dateA - dateB;
        break;
    }
    
    return sortDirection === "desc" ? -comparison : comparison;
  });

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const handleUserEdit = (user: UserDTO) => {
    onUserAction?.("edit", user);
  };

  const handleUserView = (user: UserDTO) => {
    onUserAction?.("view", user);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Sort Controls */}
      {(searchable || sortable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
          )}
          
          {sortable && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("name")}
                className="text-sm"
              >
                Name {getSortIcon("name")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("level")}
                className="text-sm"
              >
                Level {getSortIcon("level")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("points")}
                className="text-sm"
              >
                Points {getSortIcon("points")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort("joined")}
                className="text-sm"
              >
                Joined {getSortIcon("joined")}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {(searchQuery || sortable) && (
        <div className="text-sm text-gray-600">
          {searchQuery && (
            <span>
              Found {sortedUsers.length} user{sortedUsers.length !== 1 ? "s" : ""} 
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
          )}
          {sortable && (
            <span className="ml-4">
              Sorted by {sortBy} ({sortDirection === "asc" ? "ascending" : "descending"})
            </span>
          )}
        </div>
      )}

      {/* User List */}
      {sortedUsers.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className={`space-y-4 ${variant === "compact" ? "space-y-2" : ""}`}>
          {sortedUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              variant={variant}
              showActions={showActions}
              onEdit={showActions ? handleUserEdit : undefined}
              onView={showActions ? handleUserView : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
