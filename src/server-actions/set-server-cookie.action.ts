"use server";

// Next.js Core
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

export async function setServerCookie(
  name: string,
  cookieVal: string,
  options?: Partial<ResponseCookie> | undefined
) {
  (await cookies()).set(name, cookieVal, options);
}
