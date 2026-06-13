import { create } from "zustand";

interface AppState {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  isAuthOpen: boolean;
  authMode: "signup" | "signin" | "reset";
  openSignUp: () => void;
  openSignIn: () => void;
  closeAuth: () => void;
  ResetPassword: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  toggleMenu: () => set((s) => ({ isMenuOpen: !s.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
  isAuthOpen: false,
  authMode: "signup",
  openSignUp: () => set({ isAuthOpen: true, authMode: "signup" }),
  openSignIn: () => set({ isAuthOpen: true, authMode: "signin" }),
  closeAuth: () => set({ isAuthOpen: false }),
  ResetPassword: () => set({ isAuthOpen: true, authMode: "reset" }),
}));
