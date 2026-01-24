import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { WhopDataInitializer } from "@/components/whop-data-initializer";
import { PricingCardsEmbedded } from "@/components/pricing-cards-embedded";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { companyId } = await params;
  const sp = await searchParams;

  const h = await headers();

  // 1) Production / iframe: token comes in headers
  const headerToken = h.get("x-whop-user-token");

  // 2) Dev proxy: token is coming in query string
  const devTokenRaw = sp["whop-dev-user-token"];
  const devToken = Array.isArray(devTokenRaw) ? devTokenRaw[0] : devTokenRaw;

  // Choose the token source
  const token = headerToken || devToken;

  if (!token) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Missing Whop token</h2>
        <p>
          Token not found in headers or query. Open through Whop iframe or dev
          proxy.
        </p>
        <pre>{JSON.stringify({ headerKeys: [...h.keys()], searchParams: sp }, null, 2)}</pre>
      </div>
    );
  }

  // IMPORTANT: verifyUserToken expects headers. In dev, we manually provide the header.
  const verifyHeaders = new Headers();
  verifyHeaders.set("x-whop-user-token", token);

  const { userId } = await whopsdk.verifyUserToken(verifyHeaders);
   console.log('iggggg',userId); 
  const [company, user, access] = await Promise.all([
    whopsdk.companies.retrieve(companyId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(companyId, { id: userId }),
  ]);

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

  return (
    <>
      {/* Initialize Redux store with Whop data */}
      <WhopDataInitializer user={user as any} company={company as any} access={access as any} token={token} />
      
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 space-y-4">
            <nav className="text-sm text-gray-500 dark:text-gray-400">
              Dashboard
            </nav>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {(user as any)?.name || 'Creator'}
              </h1>
              {/* <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening with your partnerships today.
              </p> */}
            </div>
          </div>
         
          {/* Stats Cards */}
          {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          </div> */}

          {/* Activity and Quick Stats */}
          {/* <div className="grid gap-4 md:grid-cols-2 mt-8">
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
            </div> */}

            {/* Quick Stats */}
            {/* <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
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
          </div> */}

          {/* Pricing Plans */}
          <PricingCardsEmbedded />
        </main>
      </div>
    </>
  );
}