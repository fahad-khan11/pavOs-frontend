import axios, { AxiosInstance, AxiosError } from 'axios';

// ✅ WHOP-COMPLIANT: Use Next.js API routes (which verify Whop token server-side)
// Instead of calling backend directly, we call our Next.js API routes
// The API routes verify Whop token and forward to backend
const API_BASE_URL = '/api/proxy'; // Next.js API routes

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add companyId to all requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const whopCompanyId = sessionStorage.getItem('whop_company_id');
      
      // Add companyId as query param for all requests
      if (whopCompanyId) {
        const url = new URL(config.url || '', window.location.origin);
        url.searchParams.set('companyId', whopCompanyId);
        config.url = url.pathname + url.search;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error('❌ Authentication failed. Please reload the app in Whop.');
      // Clear stale data
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('whop_user_id');
        sessionStorage.removeItem('whop_company_id');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
