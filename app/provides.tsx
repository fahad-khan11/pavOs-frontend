"use client"

import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "../lib/redux/store"
import { WhopIframeSdkProvider } from "@whop/react"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WhopIframeSdkProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {children}
        </PersistGate>
      </Provider>
    </WhopIframeSdkProvider>
  )
}
