import axios from "axios";
import { WhopState } from "@/lib/redux/whopSlice";

// Create axios instance with base URL
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = (store: any) => {
  api.interceptors.request.use(
    (config) => {
      const state = store.getState() as { whop: WhopState };
      const { user, company } = state.whop;

      // Attach headers if available
      if (user?.id) {
        config.headers["x-whop-user-id"] = user.id;
      }
      
      if (company?.id) {
        config.headers["x-whop-company-id"] = company.id;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};
