"use client";

import React from "react";
import { useIframeSdk } from "@whop/react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux";

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
  const router = useRouter();

  // Get companyId from Redux store (same as your snippet)
  const company = useAppSelector((state) => state.whop.company);
  const companyId = company?.id || "";

  // Preserve the dev token in navigation links
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const devToken = searchParams?.get("whop-dev-user-token");
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : "";

  // This is the route you want AFTER checkout
  const postCheckoutPath = `/dashboard/${companyId}/dashboard-page${tokenQuery}`;

  const handleSelectPlan = (planId: string) => {
    if (!companyId) {
      // If companyId isn't ready yet, don't start checkout
      // (optional: show toast)
      return;
    }

    // Build absolute URL (needed for redirect back from checkout)
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUrl = `${origin}${postCheckoutPath}`;

    const checkoutBaseUrl =
      planId === "free"
        ? "https://whop.com/api-app-mdb-iy-95-amk-4gc-l-free-access/"
        : "https://whop.com/api-app-mdb-iy-95-amk-4gc-l-premium-access/";

    // Add redirect back to your app after payment
    const checkoutUrl = `${checkoutBaseUrl}?redirect_url=${encodeURIComponent(redirectUrl)}`;

    iframeSdk.openExternalUrl({ url: checkoutUrl });
  };

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
                onClick={() => handleSelectPlan(plan.id)}
                className="w-full py-2 px-4 rounded-lg font-semibold transition-all border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-[#0e1d3a] dark:hover:bg-[#F4C542] hover:text-white dark:hover:text-gray-900 hover:border-transparent"
              >
                {plan.id === "free" ? "Current Plan" : "Upgrade"}
              </button>

              {/* Optional: manual navigation button (only works inside app, not after checkout) */}
              {/* <button onClick={() => router.push(postCheckoutPath)}>Go Dashboard</button> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
