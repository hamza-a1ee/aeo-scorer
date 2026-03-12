import GreenTickIcon from "@/icons/green-tick.icon";
import { XCircle } from "lucide-react";

export const toastSuccesStyle = {
  style: {
    borderLeft: "3px solid #46B988",
    padding: "12px",
    gap: "4px",
    backgroundColor: "#D3EEE2",
    color: "#25292A",
  },
  icon: <GreenTickIcon />,
};

export const toastFailedStyle = {
  style: {
    borderLeft: "3px solid #EF4444",
    padding: "12px",
    gap: "4px",
    backgroundColor: "#FEE2E2",
    color: "#7F1D1D",
  },
  icon: <XCircle size={20} color="#EF4444" />,
};
