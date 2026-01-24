"use client";

import React, { useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { useRouter } from "next/navigation";

interface EmbeddedCheckoutProps {
  sessionId: string;
  onComplete?: (paymentId: string) => void;
  onError?: (error: any) => void;
  returnUrl?: string;
}

export function EmbeddedCheckout({
  sessionId,
  onComplete,
  onError,
  returnUrl,
}: EmbeddedCheckoutProps) {
  const router = useRouter();
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "processing" | "success" | "error">("idle");

  const handleComplete = (result: any) => {
    console.log("Checkout complete:", result);
    setCheckoutStatus("success");
    
    if (result.paymentId) {
      onComplete?.(result.paymentId);
    }
  };

  const handleError = (error: any) => {
    console.error("Checkout error:", error);
    setCheckoutStatus("error");
    onError?.(error);
  };

  // Use the provided returnUrl or default to current origin
  const effectiveReturnUrl = returnUrl || (typeof window !== "undefined" ? window.location.origin : "");

  return (
    <div className="w-full max-w-2xl mx-auto">
      {checkoutStatus === "processing" && (
        <div className="text-center p-4">
          <p className="text-gray-600 dark:text-gray-400">Processing your payment...</p>
        </div>
      )}
      
      {checkoutStatus === "success" && (
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
            Payment Successful!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your payment has been processed successfully.
          </p>
        </div>
      )}
      
      {checkoutStatus === "error" && (
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            There was an error processing your payment. Please try again.
          </p>
        </div>
      )}

      {(checkoutStatus === "idle" || checkoutStatus === "processing") && (
        <WhopCheckoutEmbed
          sessionId={sessionId}
          returnUrl={effectiveReturnUrl}
          onComplete={(result) => {
            setCheckoutStatus("processing");
            handleComplete(result);
          }}
        />
      )}
    </div>
  );
}
