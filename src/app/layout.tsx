import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BootScreen, RouteProgressBar } from "@/components/layout/LoadingScreen";
import { CompareTray } from "@/components/layout/CompareTray";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "@/components/player/player-actions";

/* ===========================================================================
 * Root layout — the INFINITY shell
 * ======================================================================== */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infinity.gg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "INFINITY — One Universe. Infinite Games.",
    template: "%s · INFINITY",
  },
  description:
    "INFINITY is the global gaming ecosystem: discover, compare, buy and play across PC, console and mobile with a verified catalogue of hundreds of real games, curated collections, esports and community.",
  keywords: [
    "gaming platform",
    "game store",
    "game discovery",
    "game launcher",
    "esports",
    "game reviews",
    "deals",
    "INFINITY",
  ],
  authors: [{ name: "INFINITY Interactive" }],
  creator: "INFINITY Interactive",
  publisher: "INFINITY Interactive",
  applicationName: "INFINITY",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "INFINITY",
    title: "INFINITY — One Universe. Infinite Games.",
    description:
      "Discover, compare, buy and play across every platform. Verified catalogue, curated collections, esports and community.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "INFINITY — One Universe. Infinite Games.",
    description: "The global gaming ecosystem: discovery, store, launcher, esports and community.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23020B14'/%3E%3Cpath d='M5 16h6l3-8 6 16 3-8h4' stroke='%23E5092F' stroke-width='2.6' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#020B14",
  width: "device-width",
  initialScale: 1,
  // Lets the notch/home-indicator insets flow into env(safe-area-inset-*)
  // so the header and the bottom tab bar never sit under system chrome.
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg font-sans text-white antialiased">
        <BootScreen />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <RouteProgressBar />
        <Header />
        <main id="main" className="min-h-[70vh]">
          {children}
        </main>
        <Footer />
        <Toaster />
        <CompareTray />
        <BottomNav />
      </body>
    </html>
  );
}
