import { api } from "@/lib/axios";

export interface CheckAccessResponse {
  hasAccess: boolean;
  accessLevel?: string;
  userId: string;
}

export const accessApi = {
  /**
   * Check if current user has access to seller's product
   */
  async checkAccess(): Promise<CheckAccessResponse> {
    const response = await api.get(`/api/v1/payments/me/access`);
    return response.data;
  },
};
