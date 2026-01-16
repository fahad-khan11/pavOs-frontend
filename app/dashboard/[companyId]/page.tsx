import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

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

  const [company, user, access] = await Promise.all([
    whopsdk.companies.retrieve(companyId),
    whopsdk.users.retrieve(userId),
    whopsdk.users.checkAccess(companyId, { id: userId }),
  ]);

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
}
