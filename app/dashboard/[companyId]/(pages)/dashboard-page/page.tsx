'use client'
import { PricingCards } from "@/components/pricing-cards";
import { useAppSelector } from "@/lib/redux";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user } = useAppSelector((state) => state.whop)
  
  
  // Static dashboard data
  const stats = {
    totalRevenue: 125000,
    winRate: 68,
    activeDeals: 24,
    avgDealSize: 5200,
    totalLeads: 156,
    wonLeads: 89,
    lostLeads: 43,
    closedDeals: 12,
  };

  const activities = [
    { _id: "1", type: "New Lead", description: "John Doe expressed interest in premium plan", createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { _id: "2", type: "Deal Won", description: "Closed partnership with Acme Corp", createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    { _id: "3", type: "Meeting Scheduled", description: "Demo call with TechStart Inc", createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    { _id: "4", type: "Proposal Sent", description: "Sent pricing proposal to GlobalTech", createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const statsData = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: `From ${stats.wonLeads} won deals`,
      icon: "💰",
    },
    {
      title: "Win Rate",
      value: `${stats.winRate}%`,
      description: "Based on closed leads",
      icon: "📈",
    },
    {
      title: "Active Leads",
      value: stats.activeDeals.toString(),
      description: `${stats.totalLeads} total leads`,
      icon: "👥",
    },
    {
      title: "Avg Deal Size",
      value: formatCurrency(stats.avgDealSize),
      description: "Per won deal",
      icon: "💼",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 space-y-4">
            <nav className="text-sm text-gray-500 dark:text-gray-400">
              Dashboard
            </nav>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}
              </h1>
              {/* <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your partnerships today.
              </p> */}
            </div>
          </div>
         
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => (
              <div key={stat.title} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</h3>
                  <span className="text-lg">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Activity and Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your latest partnership updates</p>
              </div>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-[#0e1d3a] dark:bg-[#F4C542] mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.type}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overview of your pipeline</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Total Leads</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">All time</p>
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Won Deals</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Closed successfully</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.wonLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Lost Deals</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Did not close</p>
                  </div>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-500">{stats.lostLeads}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
        </main>
      </div>
    </>
  );
}
