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

export enum NotificationType {
  EVENT_ACCEPTED = 'EVENT_ACCEPTED',
  EVENT_KICKED = 'EVENT_KICKED',
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_DECLINED = 'VERIFICATION_DECLINED',
  EVENT_APPROVED = 'EVENT_APPROVED',
  EVENT_DENIED = 'EVENT_DENIED',
  LEVEL_UP = 'LEVEL_UP',
  GENERAL = 'GENERAL',
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  message: string;
  referenceId: number;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardEntry {
  position: number;
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
  country: string;
  countryFlag: string;
  level: number;
  adrenalinePoints: number;
  role?: string;
}