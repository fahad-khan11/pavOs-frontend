"use client";

import { useIframeSdk } from "@whop/react";
import { useState } from "react";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  features: { text: string; included: boolean }[];
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Access",
    price: 0,
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
    popular: true,
    features: [
      { text: "Unlimited leads", included: true },
      { text: "Advanced analytics", included: true },
      { text: "24/7 Priority support", included: true },
      { text: "Unlimited team members", included: true },
      { text: "All integrations", included: true },
    ],
  },
];

export function PricingCards() {
  const iframeSdk = useIframeSdk();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    // If you want FREE to go to a Whop page, use openExternalUrl (not window.open)
    if (planId === "free") {
      return iframeSdk.openExternalUrl({
        url: "https://whop.com/api-app-mdb-iy-95-amk-4gc-l-free-access/",
      });
    }

    // PREMIUM should open the checkout modal (recommended)
    if (planId === "premium") {
      try {
        setLoadingPlan(planId);

        // 1) create checkout config from your backend
        const res = await fetch("/api/whop/checkout-config", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create checkout configuration");
        const checkoutConfiguration = await res.json();

        // Expecting: { id: "...", plan: { id: "..." } } OR { id, planId }
        const planIdFromServer =
          checkoutConfiguration.plan?.id ?? checkoutConfiguration.planId;
        const idFromServer = checkoutConfiguration.id;

        // 2) open Whop modal
        const modalRes = await iframeSdk.inAppPurchase({
          id: idFromServer,
          planId: planIdFromServer,
        });

        if (modalRes.status === "ok") {
          console.log("Receipt:", modalRes.data.receiptId);
        } else {
          console.log("Purchase cancelled/failed:", modalRes);
        }
      } finally {
        setLoadingPlan(null);
      }
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Choose Your Plan
        </h2>
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
              onClick={() => handleSelectPlan(plan.id)}
              className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm transition-all cursor-pointer relative border border-gray-200 dark:border-gray-800 hover:border-2 hover:border-[#0e1d3a] dark:hover:border-[#F4C542] hover:shadow-md"
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0e1d3a] dark:bg-[#F4C542] text-white dark:text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
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
                className="w-full py-2 px-4 rounded-lg font-semibold transition-all border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-[#0e1d3a] dark:hover:bg-[#F4C542] hover:text-white dark:hover:text-gray-900 hover:border-transparent"
                type="button"
              >
                {loadingPlan === plan.id
                  ? "Opening..."
                  : plan.id === "free"
                  ? "Current Plan"
                  : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
