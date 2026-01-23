"use client";

import { useParams, useRouter } from "next/navigation";

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
    id: "basic",
    name: "Basic",
    price: 10,
    popular: true,
    features: [
      { text: "Up to 50 leads", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 3 team members", included: true },
      { text: "Integrations", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 20,
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
  const params = useParams();
  const router = useRouter();
  const companyId = params.companyId as string;

  // Preserve the dev token in navigation links
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const devToken = searchParams?.get("whop-dev-user-token");
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : "";
  const tokenQueryAmp = devToken ? `&whop-dev-user-token=${devToken}` : "";

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      // Navigate to dashboard view for current plan
      router.push(`/dashboard/${companyId}/dashboard-page${tokenQuery}`);
    } else {
      // Navigate to checkout for upgrade
      router.push(`/dashboard/${companyId}/checkout?plan=${planId}${tokenQueryAmp}`);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Select the plan that best fits your needs</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isPopular = plan.popular;
          
          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm transition-all cursor-pointer relative border border-gray-200 dark:border-gray-800 hover:border-2 hover:border-[#0e1d3a] dark:hover:border-[#F4C542] hover:shadow-md`}
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
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className={feature.included ? "text-green-500" : "text-gray-400"}>
                      {feature.included ? "✓" : "✗"}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-2 px-4 rounded-lg font-semibold transition-all border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-[#0e1d3a] dark:hover:bg-[#F4C542] hover:text-white dark:hover:text-gray-900 hover:border-transparent"
              >
                {plan.id === "free" ? "Current Plan" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
