// React
import { JSX } from "react";

export interface ISelect {
  items: ISelectItems[];
  className?: string;
  triggerClassName?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string; //
  selectItemClassName?: string;
  trigger?: React.ReactNode;
  disabled?: boolean;
}

export interface ISelectItems {
  label: string | JSX.Element;
  value: string;
}
