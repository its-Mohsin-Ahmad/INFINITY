import type { Config } from "tailwindcss";

/**
 * INFINITY design tokens.
 * The palette is intentionally narrow: dark navy strata + a single red accent family.
 * Nothing else should be introduced into the system.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#020B14", // primary background
          deep: "#01070D",
          secondary: "#07121D",
          muted: "#0C1620",
          card: "#111A24",
          nav: "#080D13",
          raise: "#16202B",
        },
        accent: {
          DEFAULT: "#E5092F",
          bright: "#FF1744",
          deep: "#B00723",
          soft: "rgba(229,9,47,0.14)",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          secondary: "#A8B0BA",
          muted: "#6C7885",
        },
        line: {
          DEFAULT: "#1D2935",
          soft: "#141F2A",
          strong: "#2A3947",
        },
        state: {
          ok: "#22C55E",
          warn: "#F59E0B",
          info: "#38BDF8",
          live: "#FF1744",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      /**
       * Radius is centralised: 20px everywhere. `card` is every card / surface,
       * `control` is every button, chip and field. `full` is the only exception
       * and is reserved for genuinely circular decoration (status dots, counters,
       * planets in the splash) — never for a control surface.
       */
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
        panel: "var(--radius-card)",
        pill: "var(--radius-control)",
        // The whole scale resolves to the same token, so no stray `rounded-md`
        // anywhere in the codebase can reintroduce a second radius language.
        DEFAULT: "var(--radius-card)",
        sm: "var(--radius-card)",
        md: "var(--radius-card)",
        lg: "var(--radius-card)",
        xl: "var(--radius-card)",
        "2xl": "var(--radius-card)",
        "3xl": "var(--radius-card)",
        "4xl": "var(--radius-card)",
        "5xl": "var(--radius-card)",
        "6xl": "var(--radius-card)",
        "7xl": "var(--radius-card)",
        "8xl": "var(--radius-card)",
        "9xl": "var(--radius-card)",
        "10xl": "var(--radius-card)",
        "11xl": "var(--radius-card)",
        full: "9999px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(229,9,47,0.55), 0 10px 40px -12px rgba(229,9,47,0.55)",
        softglow: "0 12px 44px -18px rgba(229,9,47,0.45)",
        panel: "0 24px 60px -32px rgba(0,0,0,0.95)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(2,11,20,0) 0%, #020B14 78%)",
        "accent-line":
          "linear-gradient(90deg, #E5092F 0%, #FF1744 45%, rgba(229,9,47,0) 100%)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0,18px,0)" },
          to: { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        "fade-right": {
          from: { opacity: "0", transform: "translate3d(-22px,0,0)" },
          to: { opacity: "1", transform: "translate3d(0,0,0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        kenburns: {
          "0%": { transform: "scale(1.04) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.16) translate3d(-1.5%, -1.2%, 0)" },
        },
        /**
         * Hero ken burns. Deliberately gentle (100% → 106%) so faces and
         * character silhouettes never crop out of the frame on a 16:7 hero.
         */
        "hero-zoom": {
          "0%": { transform: "scale(1.005)" },
          "100%": { transform: "scale(1.06)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "draw-line": { from: { strokeDashoffset: "320" }, to: { strokeDashoffset: "0" } },
        "bar-rise": { from: { transform: "scaleY(0)" }, to: { transform: "scaleY(1)" } },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-right": "fade-right 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        kenburns: "kenburns 14s ease-out both",
        "hero-zoom": "hero-zoom 12s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-glow": "pulse-glow 3.4s ease-in-out infinite",
        "spin-slow": "spin-slow 18s linear infinite",
        "draw-line": "draw-line 1.4s ease-out both",
        "bar-rise": "bar-rise 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down": "slide-down 0.22s ease-out both",
        marquee: "marquee 38s linear infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      screens: {
        xs: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
