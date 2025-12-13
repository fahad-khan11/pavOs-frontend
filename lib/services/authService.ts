import api from '../api';
import { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      data
    );
    return response.data.data;
  },

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  /**
   * Demo login
   */
  async loginAsDemo(): Promise<AuthResponse> {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/demo');
    return response.data.data;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    await api.post('/auth/logout', { refreshToken });

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post<{ success: boolean; data: { accessToken: string } }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data;
  },
};

export default authService;
