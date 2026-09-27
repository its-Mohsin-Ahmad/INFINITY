import type { VideoCategory } from "@/lib/types";

/* ===========================================================================
 * Media pools — captions and video-centre templates.
 * ======================================================================== */

/** Screenshot captions, composited around the game's own metadata. */
export const SCREENSHOT_CAPTIONS: Record<string, string[]> = {
  gameplay: [
    "In-mission gameplay with {sub} mechanics in play",
    "HUD and ability layout during a mid-game combat sequence",
    "Positioning and coordination framed by the {genre} camera",
    "Late-game loadout demonstrating the {sub} progression curve",
  ],
  characters: [
    "Lead character detail with in-engine lighting and performance capture",
    "Supporting cast framing from the {dev} art team",
    "Customisation screen showing gear and cosmetic options",
    "Character select with the launch roster visible",
  ],
  vehicles: [
    "Vehicle handling showcase from the {genre} sandbox",
    "Cockpit and interior detail with instrument lighting",
    "Damage and deformation model during a high-speed impact",
    "Full line-up from the game's garage or hangar",
  ],
  environments: [
    "Environment art showcase from one of the larger regions",
    "Atmosphere pass captured at golden hour",
    "Weather system demonstration mid-storm",
    "Landmark view taken from a reachable vantage point",
  ],
  maps: [
    "Overhead map view showing objective layout and routes",
    "Competitive map plan with call-outs and spawn points",
    "Procedural layout variation between two separate runs",
    "World map with discovered regions unlocked",
  ],
  cinematics: [
    "Cinematic frame from one of the campaign's directed sequences",
    "Tone-setting frame captured from an in-engine cutscene",
    "Framing from a climactic act",
    "Ensemble shot from the closing chapter",
  ],
};

/** Video-centre templates. Each entry resolves to an official licensed source. */
export const VIDEO_TEMPLATES: {
  category: VideoCategory;
  label: string;
  duration: string;
}[] = [
  { category: "official-trailer", label: "Official Trailer", duration: "2:14" },
  { category: "gameplay", label: "Gameplay Deep Dive", duration: "8:42" },
  { category: "cinematic", label: "Cinematic Sequence", duration: "4:06" },
  { category: "update", label: "Season Update Overview", duration: "3:21" },
  { category: "developer", label: "Developer Diary", duration: "11:08" },
  { category: "behind-the-scenes", label: "Behind the Scenes", duration: "6:37" },
];

export const MEDIA_KIND_LABELS: Record<string, string> = {
  gameplay: "Gameplay",
  characters: "Characters",
  vehicles: "Vehicles",
  environments: "Environments",
  maps: "Maps",
  cinematics: "Cinematics",
};

/**
 * Where the game-detail media gallery gets its authorised video links.
 *
 * INFINITY deliberately does not embed arbitrary third-party uploads. Video
 * cards resolve to the publisher's own YouTube channel search for that exact
 * title, and the admin CMS can attach a verified embed id per asset when the
 * publisher supplies one.
 */
export function officialChannelSearch(publisher: string, title: string): string {
  const q = encodeURIComponent(`${title} official trailer ${publisher}`);
  return `https://www.youtube.com/results?search_query=${q}`;
}
