import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, WebStorage } from "redux-persist"
import createWebStorage from "redux-persist/lib/storage/createWebStorage"
import whopReducer from "./whopSlice"
import membersReducer from "./membersSlice"
import paymentsReducer from "./paymentsSlice"
import { setupAxiosInterceptors } from "@/lib/axios"

const createPersistStorage = (): WebStorage => {
  const isServer = typeof window === "undefined";
  
  if (isServer) {
    return {
      getItem() {
        return Promise.resolve(null);
      },
      setItem() {
        return Promise.resolve();
      },
      removeItem() {
        return Promise.resolve();
      },
    };
  }
  
  return createWebStorage("local");
};

const storage = createPersistStorage();

const rootReducer = combineReducers({
  whop: whopReducer,
  members: membersReducer,
  payments: paymentsReducer,
})

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['whop'], // Only persist whop state
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
