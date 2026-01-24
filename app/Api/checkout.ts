import { api } from "@/lib/axios";

export interface CreateCheckoutRequest {
  plan_type: "one_time" | "renewal";
  initial_price: number;
  renewal_price?: number;
  currency?: string;
  metadata?: Record<string, any>;
  product_id?: string;
  billing_period?: number; 
}

export interface CreateCheckoutResponse {
  success: boolean;
  session_id: string;
  checkout_config: any;
}

export interface VerifyPaymentRequest {
  payment_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  payment: any;
}

export const checkoutApi = {
  /**
   * Create a checkout configuration
   */
  async createCheckout(
    data: CreateCheckoutRequest
  ): Promise<CreateCheckoutResponse> {
    const response = await api.post(
      `/api/v1/payments/checkout/create`,
      data
    );
    return response.data;
  },

  
  async verifyPayment(
    data: VerifyPaymentRequest
  ): Promise<VerifyPaymentResponse> {
    const response = await api.post(
      `/api/v1/payments/checkout/verify`,
      data
    );
    return response.data;
  },
};
