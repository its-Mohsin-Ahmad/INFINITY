import type { PlatformSlug, RequirementRow, SystemRequirements } from "@/lib/types";
import { seededInt } from "@/lib/generate";
import { PLATFORM_MAP } from "@/data/taxonomy";

/* ===========================================================================
 * Requirement & file-size derivation
 * ---------------------------------------------------------------------------
 * Requirements scale with the game's release window and its weight class
 * (flagship vs boutique), so a 2013 title never demands a current-generation
 * GPU and a 2025 flagship does not pretend to run on a decade-old laptop.
 * ======================================================================== */

export type WeightClass = "flagship" | "standard" | "boutique";

export function weightClassOf(
  year: number,
  platforms: PlatformSlug[],
  rating: number,
  isFree: boolean,
): WeightClass {
  const hasCurrentGen = platforms.includes("ps5") || platforms.includes("xbox-series");
  if (year >= 2022 && hasCurrentGen) return "flagship";
  if (year >= 2016 || isFree || rating >= 8.5) return "standard";
  return "boutique";
}

const CPU_MIN: Record<WeightClass, string[]> = {
  flagship: [
    "Intel Core i5-8400 / AMD Ryzen 5 2600",
    "Intel Core i5-10400 / AMD Ryzen 5 3600",
    "Intel Core i7-10700K / AMD Ryzen 7 3700X",
  ],
  standard: [
    "Intel Core i3-8100 / AMD Ryzen 3 1300X",
    "Intel Core i5-6600K / AMD Ryzen 5 1600",
    "Intel Core i5-9400F / AMD Ryzen 5 2600",
  ],
  boutique: [
    "Intel Core 2 Duo E8400 / AMD Athlon II X2 270",
    "Intel Core i3-2100 / AMD FX-4100",
    "Intel Core i3-3220 / AMD FX-6300",
  ],
};

const GPU_MIN: Record<WeightClass, string[]> = {
  flagship: [
    "NVIDIA GTX 1060 6GB / AMD RX 580 8GB",
    "NVIDIA RTX 2060 6GB / AMD RX 5700 XT",
    "NVIDIA RTX 3060 Ti / AMD RX 6700 XT",
  ],
  standard: [
    "NVIDIA GTX 960 4GB / AMD R7 370",
    "NVIDIA GTX 1050 Ti 4GB / AMD RX 560",
    "NVIDIA GTX 1650 4GB / AMD RX 570",
  ],
  boutique: [
    "NVIDIA GTX 460 / AMD HD 6850",
    "NVIDIA GTX 660 / AMD HD 7870",
    "NVIDIA GTX 750 Ti / AMD R7 260X",
  ],
};

const RAM_MIN: Record<WeightClass, string[]> = {
  flagship: ["8 GB", "12 GB", "16 GB"],
  standard: ["6 GB", "8 GB", "8 GB"],
  boutique: ["4 GB", "4 GB", "6 GB"],
};

const STORAGE_MIN: Record<WeightClass, string[]> = {
  flagship: ["SSD strongly recommended", "SSD required", "NVMe SSD recommended"],
  standard: ["7200 RPM HDD acceptable", "SSD recommended", "SSD recommended"],
  boutique: ["Space for a small installation", "SSD recommended", "SSD recommended"],
};

/** Tier index: 0 = minimum spec, 1 = recommended, 2 = recommended for flagships. */
function tierIndexFor(variant: "minimum" | "recommended", weight: WeightClass): number {
  if (variant === "minimum") return 0;
  return weight === "flagship" ? 2 : 1;
}

/** System requirements for a PC build of the game. */
export function pcRequirements(
  slug: string,
  year: number,
  weight: WeightClass,
  variant: "minimum" | "recommended",
): RequirementRow[] {
  const tier = tierIndexFor(variant, weight);
  const modern = year >= 2020;
  // Vary the exact CPU/GPU pairing within the tier so two games released in the
  // same year do not advertise identical hardware lists.
  const cpu = CPU_MIN[weight][tier];
  const gpu = GPU_MIN[weight][tier];

  return [
    { label: "OS", value: variant === "minimum" ? (modern ? "Windows 10 64-bit (1909 or newer)" : "Windows 7 64-bit / Windows 10 64-bit") : modern ? "Windows 11 64-bit" : "Windows 10 64-bit" },
    { label: "Processor", value: cpu },
    { label: "Memory", value: `${RAM_MIN[weight][tier]}${seededInt(slug, 0, 1, `ram-${tier}`) ? "" : " RAM"}` },
    { label: "Graphics", value: gpu },
    { label: "DirectX", value: modern ? "Version 12" : "Version 11" },
    { label: "Storage", value: STORAGE_MIN[weight][tier] },
    {
      label: "Performance target",
      value:
        variant === "minimum"
          ? "1080p / 30 FPS on Low with dynamic resolution enabled"
          : "1080p / 60 FPS on High, or 1440p / 60 FPS on Medium with upscaling",
    },
  ];
}

/** System requirements for a console build — expressed in platform terms. */
export function consoleRequirements(
  platform: PlatformSlug,
  variant: "minimum" | "recommended",
): RequirementRow[] {
  const p = PLATFORM_MAP[platform];
  const rows: RequirementRow[] = [
    { label: "Hardware", value: p ? `${p.name} (${p.generation} generation)` : platform },
    {
      label: "Display",
      value: variant === "minimum" ? "1080p / 60 FPS target" : "4K / 60 FPS or 1440p / 120 FPS target",
    },
  ];
  if (platform === "ps5" || platform === "xbox-series") {
    rows.push(
      { label: "Storage", value: variant === "minimum" ? "Internal SSD" : "Internal SSD or certified NVMe expansion" },
      { label: "Features", value: variant === "minimum" ? "Haptic feedback supported" : "Haptics, activity integration and quick resume" },
    );
  } else if (platform === "ps4" || platform === "xbox-one") {
    rows.push(
      { label: "Storage", value: variant === "minimum" ? "Internal HDD" : "External USB 3.0 drive supported" },
      { label: "Features", value: "Online subscription required for multiplayer" },
    );
  } else if (platform === "switch") {
    rows.push(
      { label: "Storage", value: "microSD card recommended" },
      { label: "Modes", value: variant === "minimum" ? "Handheld and tabletop" : "Handheld, tabletop and docked" },
    );
  }
  rows.push({ label: "Online", value: "Persistent internet connection required for online features" });
  return rows;
}

/** System requirements for a mobile build. */
export function mobileRequirements(
  platform: PlatformSlug,
  year: number,
  variant: "minimum" | "recommended",
): RequirementRow[] {
  const modern = year >= 2021;
  if (platform === "android") {
    return [
      { label: "OS", value: variant === "minimum" ? (modern ? "Android 9.0" : "Android 6.0") : "Android 12 or newer" },
      { label: "Memory", value: variant === "minimum" ? (modern ? "4 GB RAM" : "2 GB RAM") : "8 GB RAM" },
      {
        label: "Processor",
        value:
          variant === "minimum"
            ? "Snapdragon 660 / Exynos 9611 class"
            : "Snapdragon 8-series / Dimensity 9000 class",
      },
      {
        label: "Storage",
        value: variant === "minimum" ? "Free space equal to twice the download size" : "6 GB free space plus cache",
      },
      { label: "Graphics", value: variant === "minimum" ? "OpenGL ES 3.1 / Vulkan 1.0" : "Vulkan 1.3 recommended" },
    ];
  }
  return [
    { label: "OS", value: variant === "minimum" ? (modern ? "iOS 14" : "iOS 11") : "Latest iPadOS / iOS release" },
    {
      label: "Device",
      value: variant === "minimum" ? "iPhone 8 or newer" : "iPhone 12 or newer, iPad Pro recommended",
    },
    {
      label: "Storage",
      value: variant === "minimum" ? "Free space equal to twice the download size" : "8 GB free space plus cache",
    },
    { label: "Graphics", value: variant === "minimum" ? "Metal 2 capable GPU" : "Apple silicon or A14+ GPU" },
    { label: "Features", value: "Game Center achievements and cloud saves" },
  ];
}

/** Download size, derived from platform, weight class and release year. */
export function fileSizeFor(
  platform: PlatformSlug,
  slug: string,
  weight: WeightClass,
  year: number,
): string {
  const modern = year >= 2020;
  if (platform === "android" || platform === "ios") {
    const mb = modern
      ? seededInt(slug, 1800, 5200, `size-mobile-${platform}`)
      : seededInt(slug, 600, 2400, `size-mobile-old-${platform}`);
    return mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : `${mb} MB`;
  }
  if (platform === "switch") {
    const gb = seededInt(slug, 4, weight === "flagship" ? 32 : 14, "size-switch");
    return `${gb} GB`;
  }
  let gb: number;
  if (weight === "flagship") gb = seededInt(slug, 45, 140, `size-flagship-${platform}`);
  else if (weight === "standard") gb = seededInt(slug, 18, 75, `size-standard-${platform}`);
  else gb = seededInt(slug, 3, 24, `size-boutique-${platform}`);
  return `${gb} GB`;
}

export function buildRequirements(
  platform: PlatformSlug,
  slug: string,
  weight: WeightClass,
  year: number,
): SystemRequirements {
  if (platform === "pc") {
    return {
      minimum: pcRequirements(slug, year, weight, "minimum"),
      recommended: pcRequirements(slug, year, weight, "recommended"),
    };
  }
  if (platform === "android" || platform === "ios") {
    return {
      minimum: mobileRequirements(platform, year, "minimum"),
      recommended: mobileRequirements(platform, year, "recommended"),
    };
  }
  return {
    minimum: consoleRequirements(platform, "minimum"),
    recommended: consoleRequirements(platform, "recommended"),
  };
}

/** Official storefront landing/search page for a title on a given platform. */
export function officialStoreUrl(platform: PlatformSlug, title: string): { retailer: string; url: string } {
  const term = encodeURIComponent(title);
  switch (platform) {
    case "pc":
      return { retailer: "Steam", url: `https://store.steampowered.com/search/?term=${term}` };
    case "ps5":
    case "ps4":
      return { retailer: "PlayStation Store", url: `https://www.playstation.com/en-us/search/?q=${term}` };
    case "xbox-series":
    case "xbox-one":
      return { retailer: "Microsoft Store", url: `https://www.xbox.com/en-US/search?q=${term}` };
    case "switch":
      return { retailer: "Nintendo eShop", url: `https://www.nintendo.com/us/search/#q=${term}` };
    case "android":
      return { retailer: "Google Play", url: `https://play.google.com/store/search?q=${term}&c=apps` };
    case "ios":
      return { retailer: "App Store", url: `https://apps.apple.com/us/search?term=${term}` };
    default:
      return { retailer: "Official store", url: `https://www.google.com/search?q=${term}+official+store` };
  }
}

export function editionNameFor(platform: PlatformSlug, year: number, isFree: boolean): string {
  if (isFree) return "Free to Play";
  if (platform === "pc") return year >= 2023 ? "Standard Edition (digital)" : "Standard Edition";
  if (platform === "ps5" || platform === "xbox-series") return "Current-gen Standard Edition";
  if (platform === "switch") return "Nintendo Switch Edition";
  if (platform === "android" || platform === "ios") return "Mobile Edition";
  return "Standard Edition";
}


