import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;

  try {
    const h = await headers();

    const tokenExists = Boolean(h.get("x-whop-user-token"));
    if (!tokenExists) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Missing Whop token</h2>
          <p>
            Open via Whop iframe or dev proxy (localhost:3000). You are currently
            hitting the app without the required header.
          </p>
        </div>
      );
    }

    const { userId } = await whopsdk.verifyUserToken(h);

    const [company, user, access] = await Promise.all([
      whopsdk.companies.retrieve(companyId),
      whopsdk.users.retrieve(userId),
      whopsdk.users.checkAccess(companyId, { id: userId }),
    ]);


	console.log(company,user, access)
    return (
      <div style={{ padding: 24 }}>
        <h1>Dashboard</h1>

        <h3>User</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>

        <h3>Company</h3>
        <pre>{JSON.stringify(company, null, 2)}</pre>

        <h3>Access</h3>
        <pre>{JSON.stringify(access, null, 2)}</pre>
      </div>
    );
  } catch (err: any) {
    // Shows the error safely (without leaking secrets)
    return (
      <div style={{ padding: 24 }}>
        <h2>Server error</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {err?.message || String(err)}
        </pre>
      </div>
    );
  }
}
