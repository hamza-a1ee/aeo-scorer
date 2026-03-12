// Local URL

const LOCAL_URL = process.env.NEXT_PUBLIC_API_URL as string;

// Deployed URL
const LIVE_URL = process.env.NEXT_PUBLIC_API_URL as string;

export const BASE_URL = LIVE_URL ? LIVE_URL : LOCAL_URL;

export const API_URL = BASE_URL;
