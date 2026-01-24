import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { WhopDataInitializer } from "@/components/whop-data-initializer";
import { PricingCardsEmbedded } from "@/components/pricing-cards-embedded";

export const dynamic = "force-dynamic";

export default async function PricingPage({
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
  
  const [company, user, access] = await Promise.all([
    whopsdk.companies.retrieve(companyId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(companyId, { id: userId }),
  ]);

  return (
    <>
      {/* Initialize Redux store with Whop data */}
      <WhopDataInitializer user={user as any} company={company as any} access={access as any} token={token} />
      
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 space-y-4">
            <nav className="text-sm text-gray-500 dark:text-gray-400">
              Pricing
            </nav>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Choose Your Plan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Select the perfect plan for your needs. Upgrade or downgrade anytime.
              </p>
            </div>
          </div>

          {/* Embedded Checkout Pricing */}
          <PricingCardsEmbedded />
        </main>
      </div>
    </>
  );
}
