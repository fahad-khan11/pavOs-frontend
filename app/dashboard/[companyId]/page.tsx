import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { WhopDashboardWrapper } from "./whop-dashboard-wrapper";

interface PageProps {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WhopDashboardPage({ params, searchParams }: PageProps) {
  const { companyId } = await params;
  const search = await searchParams;
  const headersList = await headers();

  try {
    const devToken = search['whop-dev-user-token'] as string | undefined;
    let userId: string;

    if (devToken) {
      const result = await whopSdk.verifyUserToken(devToken);
      userId = result.userId;
    } else {
      const result = await whopSdk.verifyUserToken(headersList);
      userId = result.userId;
    }

    let userEmail: string | undefined = undefined;
    let userName: string | undefined = undefined;

    try {
      const userDataResponse = await fetch(`https://api.whop.com/api/v2/me`, {
        headers: {
          'Authorization': `Bearer ${devToken || headersList.get('authorization')?.replace('Bearer ', '')}`,
        },
      });

      if (userDataResponse.ok) {
        const userData = await userDataResponse.json();
        userEmail = userData.email;
        userName = userData.username || userData.name || userData.email?.split('@')[0];
      }
    } catch (error) {
      console.error("Error fetching Whop user data:", error);
    }

    return (
      <WhopDashboardWrapper
        whopUserId={userId}
        whopCompanyId={companyId}
        whopEmail={userEmail}
        whopUsername={userName}
      />
    );
  } catch (error) {
    console.error("Whop authentication error:", error);

    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to verify your Whop session. Please make sure you're accessing
            this app through the Whop dashboard.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
