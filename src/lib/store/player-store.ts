"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ===========================================================================
 * Client-side player state
 * ---------------------------------------------------------------------------
 * Wishlist, cart, comparison tray, recently viewed and the demo session are
 * kept in a persisted Zustand store. Every mutation is exposed as an action so
 * a server-backed implementation can be dropped in later without touching the
 * components that call them.
 * ======================================================================== */

export interface CartLineState {
  slug: string;
  title: string;
  platform: string | null;
  unitPrice: number;
  discount: number;
  quantity: number;
}

export interface SessionUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "player" | "editor" | "admin";
  avatarHue: number;
}

interface PlayerState {
  ready: boolean;
  wishlist: string[];
  cart: CartLineState[];
  compare: string[];
  recentlyViewed: string[];
  toasts: { id: number; title: string; body?: string; tone: "info" | "success" | "error" }[];
  user: SessionUser | null;
  notificationsRead: string[];
  newsletterOptIn: boolean;

  toggleWishlist: (slug: string, title?: string) => void;
  isWishlisted: (slug: string) => boolean;
  clearWishlist: () => void;

  addToCart: (line: CartLineState) => void;
  removeFromCart: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;

  toggleCompare: (slug: string, title?: string) => void;
  clearCompare: () => void;

  markViewed: (slug: string) => void;

  pushToast: (title: string, body?: string, tone?: "info" | "success" | "error") => void;
  dismissToast: (id: number) => void;

  signIn: (user: SessionUser) => void;
  signOut: () => void;
  setNewsletter: (value: boolean) => void;
  markAllNotificationsRead: (ids: string[]) => void;
}

let toastId = 0;

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      ready: true,
      wishlist: [],
      cart: [],
      compare: [],
      recentlyViewed: [],
      toasts: [],
      user: null,
      notificationsRead: [],
      newsletterOptIn: false,

      toggleWishlist: (slug, title) => {
        const has = get().wishlist.includes(slug);
        set({
          wishlist: has ? get().wishlist.filter((s) => s !== slug) : [slug, ...get().wishlist].slice(0, 200),
        });
        get().pushToast(
          has ? "Removed from wishlist" : "Added to wishlist",
          title ?? slug,
          has ? "info" : "success",
        );
      },
      isWishlisted: (slug) => get().wishlist.includes(slug),
      clearWishlist: () => set({ wishlist: [] }),

      addToCart: (line) => {
        const existing = get().cart.find((l) => l.slug === line.slug && l.platform === line.platform);
        if (existing) {
          set({
            cart: get().cart.map((l) =>
              l.slug === line.slug && l.platform === line.platform
                ? { ...l, quantity: Math.min(9, l.quantity + line.quantity) }
                : l,
            ),
          });
        } else {
          set({ cart: [...get().cart, line] });
        }
        get().pushToast("Added to cart", line.title, "success");
      },
      removeFromCart: (slug) => set({ cart: get().cart.filter((l) => l.slug !== slug) }),
      setQuantity: (slug, quantity) =>
        set({
          cart: get()
            .cart.map((l) => (l.slug === slug ? { ...l, quantity: Math.max(1, Math.min(9, quantity)) } : l)),
        }),
      clearCart: () => set({ cart: [] }),

      toggleCompare: (slug, title) => {
        const has = get().compare.includes(slug);
        if (!has && get().compare.length >= 4) {
          get().pushToast("Compare tray full", "Remove a game before adding another (max 4).", "error");
          return;
        }
        set({ compare: has ? get().compare.filter((s) => s !== slug) : [...get().compare, slug] });
      },
      clearCompare: () => set({ compare: [] }),

      markViewed: (slug) =>
        set({ recentlyViewed: [slug, ...get().recentlyViewed.filter((s) => s !== slug)].slice(0, 24) }),

      pushToast: (title, body, tone = "info") => {
        toastId += 1;
        const id = toastId;
        set({ toasts: [...get().toasts, { id, title, body, tone }].slice(-4) });
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            const current = get().toasts;
            if (current.some((t) => t.id === id)) {
              set({ toasts: current.filter((t) => t.id !== id) });
            }
          }, 3800);
        }
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

      signIn: (user) => {
        set({ user });
        get().pushToast("Signed in", `Welcome back, ${user.fullName.split(" ")[0]}.`, "success");
      },
      signOut: () => set({ user: null }),
      setNewsletter: (value) => set({ newsletterOptIn: value }),
      markAllNotificationsRead: (ids) => set({ notificationsRead: [...new Set([...get().notificationsRead, ...ids])] }),
    }),
    {
      name: "infinity-player-v1",
      partialize: (state) => ({
        wishlist: state.wishlist,
        cart: state.cart,
        compare: state.compare,
        recentlyViewed: state.recentlyViewed,
        user: state.user,
        notificationsRead: state.notificationsRead,
        newsletterOptIn: state.newsletterOptIn,
      }),
    },
  ),
);

export function useCartTotals() {
  const cart = usePlayer((s) => s.cart);
  const subtotal = cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discount = cart.reduce((sum, l) => sum + (l.unitPrice * l.discount * l.quantity) / 100, 0);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total, count: cart.reduce((n, l) => n + l.quantity, 0) };
}
