import { Whop } from "@whop/sdk";

if (!process.env.WHOP_API_KEY) {
  console.warn("WHOP_API_KEY is not set in environment variables");
}

if (!process.env.NEXT_PUBLIC_WHOP_APP_ID) {
  console.warn("NEXT_PUBLIC_WHOP_APP_ID is not set in environment variables");
}

export const whopSdk = new Whop({
  apiKey: process.env.WHOP_API_KEY || "",
  appID: process.env.NEXT_PUBLIC_WHOP_APP_ID || "",
});

export default whopSdk;
