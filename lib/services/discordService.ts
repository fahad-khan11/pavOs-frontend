import api from '../api';

export interface DiscordConnectionStatus {
  connected: boolean;
  botActive?: boolean;
  guildId?: string;
  guildName?: string;
  username?: string;
  connectedAt?: string;
  lastSyncAt?: string;
  syncedMembersCount?: number;
  message?: string;
}

export interface DiscordSyncResult {
  created: number;
  updated: number;
  skipped: number;
  total: number;
  lastSyncAt: string;
}

export interface DiscordMessage {
  id: string;
  userId: string;
  contactId?: string;
  leadId?: string;
  discordChannelId: string;
  discordMessageId: string;
  authorDiscordId: string;
  authorUsername?: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  isRead: boolean;
  tags: string[];
  metadata?: Record<string, any>;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
    contentType: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  contactId?: string;
  name: string;
  email?: string;
  phone?: string;
  discordUserId?: string;
  discordUsername?: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  source: 'discord' | 'instagram' | 'tiktok' | 'whop' | 'manual' | 'referral';
  status: 'new' | 'in_conversation' | 'proposal' | 'negotiation' | 'won' | 'lost';
  tags: string[];
  notes: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  estimatedValue?: number;
  actualValue?: number;
  whopMembershipId?: string;
  whopCustomerId?: string;
  wonAt?: string;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

class DiscordService {
  /**
   * Get Discord connection status
   */
  async getStatus(): Promise<DiscordConnectionStatus> {
    const response = await api.get('/integrations/discord/status');
    return response.data.data;
  }

  /**
   * Get OAuth URL for Discord authorization
   */
  async getOAuthURL(): Promise<string> {
    const response = await api.get('/integrations/discord/oauth-url');
    // console.log('fahad debgging    ',response.data.data.url);
    return response.data.data.url;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string, state: string): Promise<DiscordConnectionStatus> {
    const response = await api.post('/integrations/discord/callback', {
      code,
      state,
    });
    return response.data.data;
  }

  /**
  
   * Disconnect Discord
   */
  async disconnect(): Promise<void> {
    await api.post('/integrations/discord/disconnect');
  }

  /**
   * Sync members from Discord server
   */
  async syncMembers(): Promise<DiscordSyncResult> {
    const response = await api.post('/integrations/discord/sync-members');
    return response.data.data;
  }

  
  async getMessages(params?: {
    leadId?: string;
    channelId?: string;
    isRead?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{
    messages: DiscordMessage[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/integrations/discord/messages', { params });
    return response.data.data;
  }

  /**
   * Send Discord message
   */
  async sendMessage(data: {
    channelId?: string;
    discordUserId?: string;
    content: string;
  }): Promise<any> {
    const response = await api.post('/integrations/discord/send-message', data);
    return response.data.data;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await api.patch(`/integrations/discord/messages/${messageId}/read`);
  }

  /**
   * Start Discord bot
   */
  async startBot(): Promise<void> {
    await api.post('/integrations/discord/start-bot');
  }

  /**
   * Stop Discord bot
   */
  async stopBot(): Promise<void> {
    await api.post('/integrations/discord/stop-bot');
  }

  // Lead Management Methods

  /**
   * Get all leads
   */
  async getLeads(params?: {
    status?: string;
    source?: string;
    tags?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    leads: Lead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/leads', { params });
    console.log('fahad debugging', response.data.data);
    return response.data.data;
  }

  /**
   * Get single lead
   */
  async getLead(id: string): Promise<{ lead: Lead; messages: DiscordMessage[] }> {
    const response = await api.get(`/leads/${id}`);
    return response.data.data;
  }

  /**
   * Create new lead
   */
  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await api.post('/leads', data);
    return response.data.data;
  }

  /**
   * Update lead
   */
  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await api.patch(`/leads/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  }

  /**
   * Get lead statistics
   */
  async getLeadStats(): Promise<{
    total: number;
    new: number;
    in_conversation: number;
    proposal: number;
    negotiation: number;
    won: number;
    lost: number;
    bySource: {
      discord: number;
      instagram: number;
      tiktok: number;
      whop: number;
      manual: number;
      referral: number;
    };
  }> {
    const response = await api.get('/leads/stats');
    const data = response.data.data;

    // Transform byStatus array to object
    const statusMap = {
      new: 0,
      in_conversation: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };
    data.byStatus.forEach((item: any) => {
      if (item._id in statusMap) {
        statusMap[item._id as keyof typeof statusMap] = item.count;
      }
    });

    // Transform bySource array to object
    const sourceMap = {
      discord: 0,
      instagram: 0,
      tiktok: 0,
      whop: 0,
      manual: 0,
      referral: 0,
    };
    data.bySource.forEach((item: any) => {
      if (item._id in sourceMap) {
        sourceMap[item._id as keyof typeof sourceMap] = item.count;
      }
    });

    return {
      total: data.total,
      ...statusMap,
      bySource: sourceMap,
    };
  }
}

export const discordService = new DiscordService();
export default discordService;
