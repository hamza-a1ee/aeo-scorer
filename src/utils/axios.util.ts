import { AxiosErrorExtended } from "@/types/axios.shared.types";
import { capitalizeFirstLetter } from "./helper.util";

export function parseError(error: AxiosErrorExtended): string {
  if (!error.response?.data?.message) {
    return "An error occurred";
  }

  const { message } = error.response.data;

  return capitalizeFirstLetter(Array.isArray(message) ? message[0] : message);
}
