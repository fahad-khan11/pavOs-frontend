import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { WhopState } from "./whopSlice"
import { api } from "@/lib/axios"

// Type for Payment
export interface Payment {
  id: string
  status: string
  substatus: string
  refundable: boolean
  retryable: boolean
  voidable: boolean
  created_at: string
  paid_at: string | null
  last_payment_attempt: string | null
  next_payment_attempt: string | null
  dispute_alerted_at: string | null
  refunded_at: string | null
  plan: {
    id: string
  } | null
  product: {
    id: string
    title: string
    route: string
  } | null
  user: {
    id: string
    name: string
    username: string
    email: string
  } | null
  membership: {
    id: string
    status: string
  } | null
  member: {
    id: string
    phone: string | null
  } | null
  payment_method: {
    id: string
    created_at: string
    payment_method_type: string
    card: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    } | null
  } | null
  company: {
    id: string
    title: string
    route: string
  } | null
  promo_code: {
    id: string
    code: string
    amount_off: number
    base_currency: string
    promo_type: string
    number_of_intervals: number
  } | null
  currency: string
  total: number
  subtotal: number
  usd_total: number
  refunded_amount: number
  auto_refunded: boolean
  amount_after_fees: number
  card_brand: string | null
  card_last4: string | null
  billing_address: {
    name: string
    line1: string
    line2: string | null
    city: string
    state: string
    postal_code: string
    country: string
  } | null
  payment_method_type: string
  billing_reason: string
  payments_failed: number
  failure_message: string | null
  metadata: Record<string, any>
}

interface PaymentsState {
  data: Payment[]
  isLoading: boolean
  error: string | null
  pageInfo: {
    end_cursor: string | null
    start_cursor: string | null
    has_next_page: boolean
    has_previous_page: boolean
  }
}

const initialState: PaymentsState = {
  data: [],
  isLoading: false,
  error: null,
  pageInfo: {
    end_cursor: null,
    start_cursor: null,
    has_next_page: false,
    has_previous_page: false
  }
}

export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (
    pagination: { cursor?: string | null; direction?: "next" | "prev" } = {},
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { whop: WhopState }
      const { company } = state.whop

      if (!company?.id) {
        return rejectWithValue("Missing company ID in Redux state")
      }

      const params: any = {
        company_id: company.id,
      }

      if (pagination.cursor) {
        params.cursor = pagination.cursor
        if (pagination.direction) {
          params.direction = pagination.direction
        }
      }

      const response = await api.get("api/v1/payments", {
        params,
      })

      return response.data
    } catch (error: any) {
      const message =
        error.response?.data?.message || error.message || "An unknown error occurred"
      return rejectWithValue(message)
    }
  }
)

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.data = []
      state.pageInfo = initialState.pageInfo
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload.data || []
        state.pageInfo = action.payload.page_info || initialState.pageInfo
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearPayments } = paymentsSlice.actions
export default paymentsSlice.reducer
