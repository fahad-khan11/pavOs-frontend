export default function DiscoverPage() {
	return (
		<div className="flex flex-col p-8 gap-8 max-w-4xl mx-auto">
			<div className="text-center">
				<h1 className="text-4xl font-bold mb-4">Discover PaveOS</h1>
				<p className="text-lg text-gray-600 dark:text-gray-400">
					This is your app&apos;s discover page—showcase what your app does and how it helps creators.
				</p>
			</div>

			<div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
				<p className="text-blue-800 dark:text-blue-200">
					💡 <strong>Tip:</strong> Clearly explain your app&apos;s value proposition and how it helps creators make money or grow their communities.
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
					<h3 className="text-xl font-bold mb-2">Showcase Real Success</h3>
					<p className="text-gray-600 dark:text-gray-400">
						Link to real Whop communities using your app, with revenue and member stats.
					</p>
				</div>

				<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
					<h3 className="text-xl font-bold mb-2">Include Referral Links</h3>
					<p className="text-gray-600 dark:text-gray-400">
						Add <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">?a=your_app_id</code> to Whop links to earn affiliate commissions.
					</p>
				</div>
			</div>

			<div>
				<h2 className="text-2xl font-bold mb-6">Why Choose PaveOS?</h2>
				<div className="grid md:grid-cols-3 gap-4">
					<div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-lg">
						<h4 className="font-bold text-lg mb-2">Close Deals</h4>
						<p className="text-purple-100">Streamline your sales process and convert more leads.</p>
					</div>
					<div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-lg">
						<h4 className="font-bold text-lg mb-2">Deliver Work</h4>
						<p className="text-blue-100">Manage projects and deliverables efficiently.</p>
					</div>
					<div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-lg">
						<h4 className="font-bold text-lg mb-2">Get Paid Faster</h4>
						<p className="text-green-100">Automate invoicing and payment collection.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
