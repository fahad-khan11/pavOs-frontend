import { authService } from './services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  subscriptionPlan?: string;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  // Store tokens and user
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, token: accessToken };
}

/**
 * Login with Google OAuth
 * Redirects to backend OAuth endpoint
 */
export function loginWithGoogle(): Promise<{ user: User; token: string }> {
  // Redirect to backend Google OAuth endpoint
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  window.location.href = `${backendUrl}/api/v1/auth/google`;

  // Return a promise that never resolves (page will redirect)
  return new Promise(() => {});
}

/**
 * Demo login - Auto-login with demo account
 */
export async function loginAsDemo(): Promise<{ user: User; token: string }> {
  const { user, accessToken, refreshToken } = await authService.loginAsDemo();

  // Store tokens and user
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, token: accessToken };
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

/**
 * Get stored user from localStorage
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

/**
 * Register new user
 */
export async function register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const { user, accessToken, refreshToken } = await authService.register({ name, email, password });

  // Store tokens and user
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  return { user, token: accessToken };
}
