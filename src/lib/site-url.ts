const hostname = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = hostname ? new URL(`https://${hostname}`) : undefined;
