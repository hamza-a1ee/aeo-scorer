"use server";

// Next.js Core
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN } from "@/constants";
import { COMMON_ROUTES } from "@/routes/common-routes";

export async function logoutAction() {
  (await cookies()).delete(ACCESS_TOKEN);
}

export async function logoutAndRedirectAction() {
  await logoutAction();
  redirect(COMMON_ROUTES.selectRole);
}
