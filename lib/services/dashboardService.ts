import api from '../api';

export interface DashboardStats {
  totalRevenue: number;
  closeRate: number;
  activeContacts: number;
  dealsInProgress: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  pendingPayments: number;
  overduePayments: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface UpcomingDeliverable {
  id: string;
  dealId: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  deals: number;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{ success: boolean; data: DashboardStats }>(
      '/dashboard/stats'
    );
    return response.data.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10): Promise<RecentActivity[]> {
    const response = await api.get<{ success: boolean; data: RecentActivity[] }>(
      '/dashboard/recent-activity',
      { params: { limit } }
    );
    return response.data.data;
  },

  /**
   * Get upcoming deliverables
   */
  async getUpcomingDeliverables(limit = 5): Promise<UpcomingDeliverable[]> {
    const response = await api.get<{ success: boolean; data: UpcomingDeliverable[] }>(
      '/dashboard/upcoming-deliverables',
      { params: { limit } }
    );
    return response.data.data;
  },

  /**
   * Get revenue chart data
   */
  async getRevenueChart(period: '7d' | '30d' | '90d' = '30d'): Promise<RevenueChartData[]> {
    const response = await api.get<{ success: boolean; data: RevenueChartData[] }>(
      '/dashboard/revenue-chart',
      { params: { period } }
    );
    return response.data.data;
  },
};

export default dashboardService;
