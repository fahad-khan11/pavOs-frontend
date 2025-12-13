import api from '../api';

export interface WhopConnectionStatus {
  connected: boolean;
  companyId?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  syncedCustomersCount?: number;
  message?: string;
}

export interface WhopSyncResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  lastSyncAt: string;
}

export const whopService = {
  /**
   * Get Whop connection status
   */
  async getStatus(): Promise<WhopConnectionStatus> {
    const response = await api.get<{ success: boolean; data: WhopConnectionStatus }>(
      '/integrations/whop/status'
    );
    return response.data.data;
  },

  /**
   * Connect to Whop
   */
  async connect(): Promise<{ connected: boolean; companyId: string; companyName: string; message: string }> {
    const response = await api.post<{
      success: boolean;
      data: { connected: boolean; companyId: string; companyName: string; message: string };
    }>('/integrations/whop/connect');
    return response.data.data;
  },

  /**
   * Disconnect from Whop
   */
  async disconnect(): Promise<void> {
    await api.post('/integrations/whop/disconnect');
  },

  /**
   * Sync customers from Whop
   */
  async syncCustomers(): Promise<WhopSyncResult> {
    const response = await api.post<{ success: boolean; data: WhopSyncResult }>(
      '/integrations/whop/sync'
    );
    return response.data.data;
  },
};

export default whopService;
