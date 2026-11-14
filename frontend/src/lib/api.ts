// src/lib/api.ts
/**
 * Centralized API helper that provides the correctly-trimmed base URL.
 * All fetch calls should import BASE_URL and construct URLs with it.
 */
export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
