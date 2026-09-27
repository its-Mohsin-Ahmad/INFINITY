import type { GenreSlug, PlatformSlug } from "@/lib/types";
import { GENRE_SLUGS, PLATFORM_SLUGS, SUBGENRE_MAP } from "./taxonomy";

import { BLOCK as B01 } from "./records/01-marquee";
import { BLOCK as B02 } from "./records/02-open-world";
import { BLOCK as B03 } from "./records/03-playstation";
import { BLOCK as B04 } from "./records/04-xbox";
import { BLOCK as B05 } from "./records/05-microsoft-family";
import { BLOCK as B06 } from "./records/06-nintendo";
import { BLOCK as B07 } from "./records/07-nintendo-rpg";
import { BLOCK as B08 } from "./records/08-shooters";
import { BLOCK as B09 } from "./records/09-competitive-shooters";
import { BLOCK as B10 } from "./records/10-live-service";
import { BLOCK as B11 } from "./records/11-mmorpg";
import { BLOCK as B12 } from "./records/12-soulslike";
import { BLOCK as B13 } from "./records/13-western-rpg";
import { BLOCK as B14 } from "./records/14-crpg";
import { BLOCK as B15 } from "./records/15-jrpg";
import { BLOCK as B16 } from "./records/16-jrpg-tactics";
import { BLOCK as B17 } from "./records/17-racing";
import { BLOCK as B18 } from "./records/18-kart-motorsport";
import { BLOCK as B19 } from "./records/19-life-sim";
import { BLOCK as B20 } from "./records/20-city-builder";
import { BLOCK as B21 } from "./records/21-grand-strategy";
import { BLOCK as B22 } from "./records/22-tactics-rts";
import { BLOCK as B23 } from "./records/23-survival-horror";
import { BLOCK as B24 } from "./records/24-horror-coop";
import { BLOCK as B25 } from "./records/25-survival-crafting";
import { BLOCK as B26 } from "./records/26-space-engineering";
import { BLOCK as B27 } from "./records/27-indie-landmarks";
import { BLOCK as B28 } from "./records/28-puzzle-narrative";
import { BLOCK as B29 } from "./records/29-coop-party";
import { BLOCK as B30 } from "./records/30-sports-sim";
import { BLOCK as B31 } from "./records/31-sports-arcade";
import { BLOCK as B32 } from "./records/32-fighting";
import { BLOCK as B33 } from "./records/33-mobile-blockbusters";
import { BLOCK as B34 } from "./records/34-mobile-strategy";
import { BLOCK as B35 } from "./records/35-free-to-play";
import { BLOCK as B36 } from "./records/36-crime-legends";

export interface RawGameFlags {
  free: boolean;
  featured: boolean;
  trending: boolean;
  newRelease: boolean;
  comingSoon: boolean;
}

export interface RawGameRow {
  title: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  genres: GenreSlug[];
  platforms: PlatformSlug[];
  rating: number;
  price: number;
  flags: RawGameFlags;
  subgenres: string[];
}

const BLOCKS: string[] = [
  B01, B02, B03, B04, B05, B06, B07, B08, B09, B10, B11, B12, B13, B14, B15, B16, B17, B18,
  B19, B20, B21, B22, B23, B24, B25, B26, B27, B28, B29, B30, B31, B32, B33, B34, B35, B36,
];

const VALID_GENRES = new Set<string>(GENRE_SLUGS);
const VALID_PLATFORMS = new Set<string>(PLATFORM_SLUGS);

function toList(value: string): string[] {
  return value
    .split(";")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Parses the authored rows into structured records.
 *
 * The parser is deliberately forgiving in two specific ways so that an editor
 * can add rows quickly without breaking the build:
 *   · a blank publisher field inherits the developer;
 *   · a code in the genre column that is actually a sub-genre is promoted to
 *     the sub-genre column instead of being discarded.
 * Anything else that is unrecognised is dropped from the typed field and
 * reported by `npm run verify`.
 */
function parseRows(): RawGameRow[] {
  const rows: RawGameRow[] = [];

  for (const block of BLOCKS) {
    for (const rawLine of block.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const f = line.split("|").map((v) => v.trim());
      if (f.length < 9) continue;

      const [title, releaseDate, developer, publisherField, genreField, platformField, rating, price, flagField, subgenreField] = f;

      const genres: GenreSlug[] = [];
      const subgenres: string[] = [];

      for (const code of toList(genreField)) {
        if (VALID_GENRES.has(code)) genres.push(code as GenreSlug);
        else if (SUBGENRE_MAP[code]) subgenres.push(code);
      }
      for (const code of toList(subgenreField ?? "")) {
        if (SUBGENRE_MAP[code] && !subgenres.includes(code)) subgenres.push(code);
      }

      const platforms = toList(platformField).filter((p) => VALID_PLATFORMS.has(p)) as PlatformSlug[];
      const flags = toList(flagField).map((x) => x.toUpperCase());

      rows.push({
        title,
        releaseDate,
        developer,
        publisher: publisherField || developer,
        genres: genres.length ? genres : (["action"] as GenreSlug[]),
        platforms: platforms.length ? platforms : (["pc"] as PlatformSlug[]),
        rating: Number.parseFloat(rating) || 7.5,
        price: Number.parseFloat(price) || 0,
        flags: {
          free: flags.includes("F"),
          featured: flags.includes("E"),
          trending: flags.includes("T"),
          newRelease: flags.includes("N"),
          comingSoon: flags.includes("C"),
        },
        subgenres,
      });
    }
  }

  return rows;
}

/** Every authored row in the catalogue, in editorial order. */
export const RAW_ROWS: RawGameRow[] = parseRows();

/** Live catalogue size — this is the number the UI reports. */
export const CATALOGUE_SIZE = RAW_ROWS.length;
