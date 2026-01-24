"use client"

import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "../lib/redux/store"
import { WhopIframeSdkProvider } from "@whop/react"
import { useState, useEffect } from "react"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <WhopIframeSdkProvider>
      <Provider store={store}>
        {isClient ? (
          <PersistGate loading={null} persistor={persistor}>
            {children}
          </PersistGate>
        ) : (
          children
        )}
      </Provider>
    </WhopIframeSdkProvider>
  )
}
