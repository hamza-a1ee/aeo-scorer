import {
  THomeState,
  THomeStore,
  TNonLoggedInRedirection,
} from '@/types/types/home.store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const defaultInstance: THomeState = {
  openNonLoggedInUserDialog: false,
  nonLoggedInRedirection: null,
};

export const useHomeStore = create<THomeStore>()(
  persist(
    set => ({
      ...defaultInstance,
      setNonLoggedInRedirection: (value: TNonLoggedInRedirection) =>
        set({ nonLoggedInRedirection: value }),
      setOpenNonLoggedInUserDialog: open =>
        set({ openNonLoggedInUserDialog: open }),
    }),
    {
      name: 'home-store',
      partialize: state => ({
        nonLoggedInRedirection: state.nonLoggedInRedirection,
      }),
    },
  ),
);
