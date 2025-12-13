import api from '../api';
import { Contact } from '../types';

export interface ContactFilters {
  search?: string;
  status?: 'all' | 'active' | 'prospect' | 'inactive';
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

export const contactService = {
  /**
   * Get all contacts with filters
   */
  async getAll(filters?: ContactFilters): Promise<PaginatedResponse<Contact>> {
    const response = await api.get<PaginatedResponse<Contact>>('/contacts', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get contact by ID
   */
  async getById(id: string): Promise<Contact> {
    const response = await api.get<{ success: boolean; data: Contact }>(`/contacts/${id}`);
    return response.data.data;
  },

  /**
   * Create new contact
   */
  async create(data: Omit<Contact, 'id' | 'deals' | 'totalValue'>): Promise<Contact> {
    const response = await api.post<{ success: boolean; data: Contact }>('/contacts', data);
    return response.data.data;
  },

  /**
   * Update contact
   */
  async update(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await api.put<{ success: boolean; data: Contact }>(`/contacts/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete contact
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`);
  },
};

export default contactService;
