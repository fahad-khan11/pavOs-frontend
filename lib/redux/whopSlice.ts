import { createSlice, PayloadAction } from "@reduxjs/toolkit"

// Types for Whop data
export interface WhopUser {
  id: string
  username: string
  name: string
  created_at: string
  bio: string | null
  profile_picture: {
    url: string
  }
}

export interface WhopCompanyOwner {
  id: string
  name: string
  username: string
}

export interface WhopCompany {
  id: string
  title: string
  description: string | null
  verified: boolean
  business_type: string
  industry_type: string
  send_customer_emails: boolean
  created_at: string
  updated_at: string
  member_count: number
  owner_user: WhopCompanyOwner
  route: string
  logo: string | null
  published_reviews_count: number
  metadata: unknown | null
  social_links: string[]
}

export interface WhopAccess {
  has_access: boolean
  access_level: string
}

export interface WhopState {
  user: WhopUser | null
  company: WhopCompany | null
  access: WhopAccess | null
  token: string | null
  isLoaded: boolean
}

const initialState: WhopState = {
  user: null,
  company: null,
  access: null,
  token: null,
  isLoaded: false,
}

const whopSlice = createSlice({
  name: "whop",
  initialState,
  reducers: {
    setWhopUser: (state, action: PayloadAction<WhopUser>) => {
      state.user = action.payload
    },
    setWhopCompany: (state, action: PayloadAction<WhopCompany>) => {
      state.company = action.payload
    },
    setWhopAccess: (state, action: PayloadAction<WhopAccess>) => {
      state.access = action.payload
    },
    setWhopData: (
      state,
      action: PayloadAction<{
        user: WhopUser
        company: WhopCompany
        access: WhopAccess
        token: string
      }>
    ) => {
      state.user = action.payload.user
      state.company = action.payload.company
      state.access = action.payload.access
      state.token = action.payload.token
      state.isLoaded = true
    },
    clearWhopData: (state) => {
      state.user = null
      state.company = null
      state.access = null
      state.token = null
      state.isLoaded = false
    },
  },
})

export const {
  setWhopUser,
  setWhopCompany,
  setWhopAccess,
  setWhopData,
  clearWhopData,
} = whopSlice.actions

export default whopSlice.reducer
