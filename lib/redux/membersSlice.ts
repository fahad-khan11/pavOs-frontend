import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { WhopState } from "./whopSlice"
import { api } from "@/lib/axios"

// Type for Member in LISTING (flatter structure)
export interface MemberSummary {
  id: string
  name: string
  email: string | null
  status: string
  access_level: string
  joined_at: string
  last_action: string
  last_action_at: string
  total_spent_usd: number
}

// Type for Member Stats
export interface MemberStats {
  total_members: number
  active_members: number
  cancelled_members: number
  drafted_members: number
  total_revenue_usd: number
}

// Type for Member DETAIL
export interface MemberDetail {
  id: string
  created_at: string
  updated_at: string
  joined_at: string
  access_level: string
  status: string
  most_recent_action: string
  most_recent_action_at: string
  user: {
    id: string
    email: string
    name: string
    username: string
  } | null
  phone: string | null
  usd_total_spent: number
  company?: {
    id: string
    title: string
    route: string
  }
}

interface MembersState {
  data: MemberSummary[]
  stats: MemberStats | null
  selectedMember: MemberDetail | null
  isLoading: boolean
  error: string | null
  pageInfo: {
    end_cursor: string | null
    start_cursor: string | null
    has_next_page: boolean
    has_previous_page: boolean
  }
}

const initialState: MembersState = {
  data: [],
  stats: null,
  selectedMember: null,
  isLoading: false,
  error: null,
  pageInfo: {
    end_cursor: null,
    start_cursor: null,
    has_next_page: false,
    has_previous_page: false
  }
}

export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
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

      const response = await api.get("/api/v1/members", {
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

export const fetchMemberDetails = createAsyncThunk(
    "members/fetchDetails",
    async (memberId: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/v1/members/${memberId}`)
            return response.data
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || "An unknown error occurred"
            return rejectWithValue(message)
        }
    }
)

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearSelectedMember: (state) => {
        state.selectedMember = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch List
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false
        // Map response logic to state
        state.data = action.payload.members || []
        state.stats = action.payload.stats || null
        state.pageInfo = action.payload.page_info || initialState.pageInfo
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch Detail
      .addCase(fetchMemberDetails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMemberDetails.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedMember = action.payload
      })
      .addCase(fetchMemberDetails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearSelectedMember } = membersSlice.actions
export default membersSlice.reducer
