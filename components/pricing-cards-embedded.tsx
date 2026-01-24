"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux";
import { checkoutApi } from "@/app/Api/checkout";
import { EmbeddedCheckout } from "./embedded-checkout";
import toast from "react-hot-toast";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  planType: "one_time" | "renewal";
  features: { text: string; included: boolean }[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Access",
    price: 0,
    planType: "one_time",
    features: [
      { text: "Up to 5 leads", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: true },
      { text: "Team members", included: false },
      { text: "Integrations", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 5,
    planType: "renewal",
    popular: true,
    features: [
      { text: "Unlimited leads", included: true },
      { text: "Advanced analytics", included: true },
      { text: "24/7 Priority support", included: true },
      { text: "Unlimited team members", included: true },
      { text: "All integrations", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    planType: "renewal",
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Custom integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Advanced security", included: true },
    ],
  },
];

export function PricingCardsEmbedded() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get company and user from Redux store
  const company = useAppSelector((state) => state.whop.company);
  const user = useAppSelector((state) => state.whop.user);
  const companyId = company?.id || "";

  // Preserve the dev token in navigation links
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const devToken = searchParams?.get("whop-dev-user-token");
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : "";

  // This is the route you want AFTER checkout
  const postCheckoutPath = `/dashboard/${companyId}/dashboard-page${tokenQuery}`;

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh the page.");
      return;
    }

    // For free plan, just navigate 
    if (plan.id === "free" || plan.price === 0) {
      toast.success("Free access granted!");
      router.push(postCheckoutPath);
      return;
    }

    setIsLoading(true);
    setSelectedPlan(plan);

    try {
      const response = await checkoutApi.createCheckout({
        plan_type: plan.planType,
        initial_price: plan.planType === "renewal" ? 0 : plan.price,
        renewal_price: plan.planType === "renewal" ? plan.price : undefined,
        product_id: plan.planType === "renewal" 
          ? (plan.id === "pro" ? "prod_FJrlaJOQ8G6Ec" : "prod_gF4cmotTFroNy")
          : undefined,
        billing_period: plan.planType === "renewal" ? 30 : undefined, 
        currency: "usd",
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          user_id: user?.id,
          company_id: companyId,
        },
      });

      setCheckoutSessionId(response.session_id);
      toast.success("Checkout session created!");
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast.error(error.response?.data?.error || "Failed to create checkout session");
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleCheckoutComplete = async (paymentId: string) => {
    console.log("Payment completed:", paymentId);
    
    try {
      // Optional: Verify the payment on the backend
      await checkoutApi.verifyPayment({ payment_id: paymentId });
      
      toast.success("Payment verified successfully!");
      
      // Navigate to dashboard after successful payment
      setTimeout(() => {
        router.push(postCheckoutPath);
      }, 2000);
    } catch (error) {
      console.error("Error verifying payment:", error);
      // Still navigate even if verification fails
      toast.success("Payment completed!");
      setTimeout(() => {
        router.push(postCheckoutPath);
      }, 2000);
    }
  };

  const handleCheckoutError = (error: any) => {
    console.error("Checkout error:", error);
    toast.error("Payment failed. Please try again.");
    setIsLoading(false);
    setSelectedPlan(null);
    setCheckoutSessionId(null);
  };

  const handleBackToPricing = () => {
    setSelectedPlan(null);
    setCheckoutSessionId(null);
    setIsLoading(false);
  };

  // Show embedded checkout if we have a session ID
  if (checkoutSessionId && selectedPlan) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const returnUrl = `${origin}${postCheckoutPath}`;

    return (
      <div className="mt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Complete Your Purchase
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {selectedPlan.name} - ${selectedPlan.price}/month
            </p>
          </div>
          <button
            onClick={handleBackToPricing}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Plans
          </button>
        </div>

        <EmbeddedCheckout
          sessionId={checkoutSessionId}
          onComplete={handleCheckoutComplete}
          onError={handleCheckoutError}
          returnUrl={returnUrl}
        />
      </div>
    );
  }

  // Show pricing cards
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm transition-all relative border border-gray-200 dark:border-gray-800"
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0e1d3a] dark:bg-[#F4C542] text-white dark:text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <span className={feature.included ? "text-green-500" : "text-gray-400"}>
                      {feature.included ? "✓" : "✗"}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-lg font-semibold transition-all border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-[#0e1d3a] dark:hover:bg-[#F4C542] hover:text-white dark:hover:text-gray-900 hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && selectedPlan?.id === plan.id
                  ? "Loading..."
                  : plan.id === "free"
                  ? "Get Free Access"
                  : "Upgrade to Premium"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
