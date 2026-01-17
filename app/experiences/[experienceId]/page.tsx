import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	// Ensure the user is logged in on whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Fetch the neccessary data we want from whop.
	const [experience, user, access] = await Promise.all([
		whopsdk.experiences.retrieve(experienceId),
		whopsdk.users.retrieve(userId),
		whopsdk.users.checkAccess(experienceId, { id: userId }),
	]);

	const displayName = user.name || `@${user.username}`;

	return (
		<div className="flex flex-col p-8 gap-4">
			<div className="flex justify-between items-center gap-4">
				<h1 className="text-3xl font-bold">
					Hi <strong>{displayName}</strong>!
				</h1>
			</div>

			<p className="text-gray-600 dark:text-gray-400">
				Welcome to your whop app! Replace this template with your own app. To
				get you started, here&apos;s some helpful data you can fetch from whop.
			</p>

			<h3 className="text-xl font-bold">Experience data</h3>
			<JsonViewer data={experience} />

			<h3 className="text-xl font-bold">User data</h3>
			<JsonViewer data={user} />

			<h3 className="text-xl font-bold">Access data</h3>
			<JsonViewer data={access} />
		</div>
	);
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-900 max-h-72 overflow-y-auto">
			<code className="text-gray-800 dark:text-gray-200">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
