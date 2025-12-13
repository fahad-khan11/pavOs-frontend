import api from '../api';
import { Deal, DealStage } from '../types';

export interface DealFilters {
  stage?: DealStage | 'all';
  status?: 'active' | 'completed' | 'all';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const dealService = {
  /**
   * Get all deals with filters
   */
  async getAll(filters?: DealFilters): Promise<PaginatedResponse<Deal>> {
    const response = await api.get<PaginatedResponse<Deal>>('/deals', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get deal by ID
   */
  async getById(id: string): Promise<Deal> {
    const response = await api.get<{ success: boolean; data: Deal }>(`/deals/${id}`);
    return response.data.data;
  },

  /**
   * Create new deal
   */
  async create(data: Omit<Deal, 'id' | 'creatorId' | 'createdDate'>): Promise<Deal> {
    const response = await api.post<{ success: boolean; data: Deal }>('/deals', data);
    return response.data.data;
  },

  /**
   * Update deal
   */
  async update(id: string, data: Partial<Deal>): Promise<Deal> {
    const response = await api.put<{ success: boolean; data: Deal }>(`/deals/${id}`, data);
    return response.data.data;
  },

  /**
   * Update deal stage (for pipeline drag-and-drop)
   */
  async updateStage(id: string, stage: DealStage): Promise<Deal> {
    const response = await api.patch<{ success: boolean; data: Deal }>(`/deals/${id}/stage`, {
      stage,
    });
    return response.data.data;
  },

  /**
   * Delete deal
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/deals/${id}`);
  },
};

export default dealService;
