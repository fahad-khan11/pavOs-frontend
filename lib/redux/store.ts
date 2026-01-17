import { configureStore } from "@reduxjs/toolkit"
import whopReducer from "./whopSlice"

export const store = configureStore({
  reducer: {
    whop: whopReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
