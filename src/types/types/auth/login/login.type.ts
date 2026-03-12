import { ILoginPayload } from "@/types/interfaces/auth/auth-api.interface";

export type TLoginForm = Omit<ILoginPayload, "role">;
