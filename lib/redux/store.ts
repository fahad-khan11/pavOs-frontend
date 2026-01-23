import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import storage from "redux-persist/lib/storage"
import whopReducer from "./whopSlice"
import membersReducer from "./membersSlice"
import paymentsReducer from "./paymentsSlice"
import { setupAxiosInterceptors } from "@/lib/axios"

const rootReducer = combineReducers({
  whop: whopReducer,
  members: membersReducer,
  payments: paymentsReducer,
})

const persistConfig = {
  key: "root",
  storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

// Setup Axios interceptors with the store
setupAxiosInterceptors(store)

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
