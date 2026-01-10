export * from './user';
export * from './content';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalEvents: number;
  pendingEvents: number;
  totalPosts: number;
}

export interface AccountActionRequest {
  reason: string;
  durationDays?: number;
}