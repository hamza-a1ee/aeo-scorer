// React
import { JSX } from 'react';

export type TCookieSource = 'client' | 'server';

export type TNavbarBtn = {
  label: string;
  logo?: [JSX.Element];
  href: (slug?: string) => string;
};

export type TProfileSettingsItem<Value extends string = string> = {
  value: Value;
  label: string;
  logo: [JSX.Element];
  href?: (slug?: string) => string;
  action?: TVoidCallback;
};

export type TVoidCallback<Args extends unknown[] = []> = (
  ...args: Args
) => void;
