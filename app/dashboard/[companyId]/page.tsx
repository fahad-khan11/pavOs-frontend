// app/dashboard/[companyId]/page.tsx
import { whopsdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export default async function WhopDashboardPage({
  params,
}: {
  params: { companyId: string };
}) {
  const companyId = params.companyId;
  
  try {
    // Get headers
    const headersList = await headers();
    const referer = headersList.get('referer');
    
    console.log('Referer URL:', referer);
    
    // Extract token from referer URL
    let userToken: string | null = null;
    
    if (referer) {
      // Parse the referer URL to get query params
      const url = new URL(referer);
      userToken = url.searchParams.get('whop-dev-user-token');
    }
    
    console.log('Extracted token:', userToken ? 'Yes' : 'No');
    
    if (!userToken) {
      // Also check direct headers (just in case)
      userToken = headersList.get('x-whop-user-token');
    }
    
    if (!userToken) {
      throw new Error('No Whop user token found in referer or headers');
    }
    
    // Now verify the token
    const { userId } = await whopsdk.verifyUserToken(userToken);
    console.log('✅ Authenticated! User ID:', userId);
    
    // Fetch data
    const [company, user, access] = await Promise.all([
      whopsdk.companies.retrieveCompany({ companyId }),
      whopsdk.apps.retrieveAuthenticatedUser({ userToken }),
      whopsdk.apps.retrieveUserAccess({ userToken }),
    ]);
    
    return (
      <div>
        <h1>Welcome to {company.username}'s Dashboard</h1>
        <p>User: {user.username}</p>
        {/* Your dashboard content */}
      </div>
    );
    
  } catch (error) {
    console.error('Authentication error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Authentication Error</h1>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        <p>Token extracted from Referer URL</p>
      </div>
    );
  }
}