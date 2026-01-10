export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  gender?: string;
  birthday?: string;
  profilePicture?: string;
  bannerPicture?: string;
  country?: string;
  countryFlag?: string;
  city?: string;
  phoneNumber?: string;
  bio?: string;
  role: string;
  accountStatus: string;
  verified: boolean;
  adrenalinePoints: number;
  level: number;
  suspensionEndAt?: string;
  suspensionCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export interface UserCard {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture?: string;
  country?: string;
  countryFlag?: string;
  role: string;
  verified: boolean;
  adrenalinePoints: number;
  level: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthday?: string;
  country?: string;
  countryFlag?: string;
  city?: string;
  phoneNumber?: string;
  bio?: string;
}