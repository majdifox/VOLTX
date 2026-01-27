import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ENDPOINTS, API_BASE_URL } from '../utils/endpoints';
import type { UserDTO } from '../types/user';

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
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('voltx_auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem('voltx_auth_token');
          localStorage.removeItem('voltx_user');
          window.location.href = '/login';
        }

        // Transform error to consistent format
        const message = error.response?.data?.message ||
                       error.message ||
                       'An unexpected error occurred';

        return Promise.reject(new Error(message));
      }
    );
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<{ user: UserDTO; token: string }> {
    const response = await this.axiosInstance.post<ApiResponse<{ user: UserDTO; token: string }>>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;

      // Store auth data
      localStorage.setItem('voltx_auth_token', token);
      localStorage.setItem('voltx_user', JSON.stringify(user));

      return { user, token };
    }

    throw new Error(response.data.message || 'Login failed');
  }

  async register(userData: RegisterRequest): Promise<{ user: UserDTO; token: string }> {
    const response = await this.axiosInstance.post<ApiResponse<{ user: UserDTO; token: string }>>(
      ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data;

      // Store auth data
      localStorage.setItem('voltx_auth_token', token);
      localStorage.setItem('voltx_user', JSON.stringify(user));

      return { user, token };
    }

    throw new Error(response.data.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('voltx_auth_token');
      localStorage.removeItem('voltx_user');
    }
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await this.axiosInstance.post<ApiResponse<{ token: string }>>(
      ENDPOINTS.AUTH.REFRESH
    );

    if (response.data.success && response.data.data) {
      const { token } = response.data.data;
      localStorage.setItem('voltx_auth_token', token);
      return { token };
    }

    throw new Error('Token refresh failed');
  }

  // User endpoints
  async getUser(id: number): Promise<UserDTO> {
    const response = await this.axiosInstance.get<ApiResponse<UserDTO>>(
      ENDPOINTS.USERS.BY_ID(id)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch user');
  }

  async updateProfile(userId: number, userData: Partial<UserDTO>): Promise<UserDTO> {
    const response = await this.axiosInstance.put<ApiResponse<UserDTO>>(
      ENDPOINTS.USERS.BY_ID(userId),
      userData
    );

    if (response.data.success && response.data.data) {
      // Update stored user data
      localStorage.setItem('voltx_user', JSON.stringify(response.data.data));
      return response.data.data;
    }

    throw new Error(response.data.message || 'Profile update failed');
  }

  async getUserByUsername(username: string): Promise<UserDTO> {
    const response = await this.axiosInstance.get<ApiResponse<UserDTO>>(
      ENDPOINTS.USERS.BY_USERNAME(username)
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch user');
  }

  // Gamification endpoints
  async getLevels(): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      '/gamification/levels'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch levels');
  }

  async calculateLevel(points: number): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      `/gamification/level/${points}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to calculate level');
  }

  async getLeaderboard(limit: number = 10): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      `/gamification/leaderboard?limit=${limit}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch leaderboard');
  }

  async getAchievements(): Promise<any> {
    const response = await this.axiosInstance.get<ApiResponse<any>>(
      '/gamification/achievements'
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch achievements');
  }

  // Generic request method for custom endpoints
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.request<ApiResponse<T>>(config);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Request failed');
  }

  // Helper method to check authentication status
  isAuthenticated(): boolean {
    const token = localStorage.getItem('voltx_auth_token');
    const user = localStorage.getItem('voltx_user');
    return !!(token && user);
  }

  // Helper method to get stored user
  getStoredUser(): UserDTO | null {
    const userData = localStorage.getItem('voltx_user');
    if (userData) {
      try {
        return JSON.parse(userData) as UserDTO;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Helper method to get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('voltx_auth_token');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;