/**
 * Curated public-domain fallback images for popular space-domain entities.
 *
 * Sourced from Wikimedia Commons / NASA. URLs use the canonical Wikimedia
 * `commons/thumb/.../1024px-...jpg` form so they resolve as fixed-width JPEGs
 * suitable for next/image optimization.
 *
 * If a record arrives from upstream sync (LL2, SpaceX) with a real image URL,
 * the helper functions below prefer it. The curated map is only used when the
 * record's `images` array is empty or only contains `example.com` placeholders.
 *
 * Lookup keys are matched two ways:
 *   1. By exact id (e.g. `falcon-9`)
 *   2. By case-insensitive substring match against the entity name
 * This means even when seed-data ids differ, popular names still resolve.
 */

export const ROCKET_IMAGES: Record<string, string> = {
  'falcon-9':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Falcon_9_in_December_2015.jpg/1024px-Falcon_9_in_December_2015.jpg',
  'falcon-heavy':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Falcon_Heavy_Demo_Mission_%2840126461851%29.jpg/1024px-Falcon_Heavy_Demo_Mission_%2840126461851%29.jpg',
  starship:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Starship_S20_and_BN4_at_Starbase.jpg/1024px-Starship_S20_and_BN4_at_Starbase.jpg',
  'long-march-5':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Long_March_5_Y2_launching_Shijian-18.jpg/1024px-Long_March_5_Y2_launching_Shijian-18.jpg',
  'long-march-2f':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Shenzhou_10_launch.jpg/1024px-Shenzhou_10_launch.jpg',
  sls: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Artemis_1_liftoff_from_LC-39B_-_cropped.jpg/1024px-Artemis_1_liftoff_from_LC-39B_-_cropped.jpg',
  'saturn-v':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Apollo_11_Launch_-_GPN-2000-000630.jpg/1024px-Apollo_11_Launch_-_GPN-2000-000630.jpg',
  ariane5:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ariane_5ECA_launch_2007.jpg/1024px-Ariane_5ECA_launch_2007.jpg',
  'ariane-5':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Ariane_5ECA_launch_2007.jpg/1024px-Ariane_5ECA_launch_2007.jpg',
  soyuz:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Soyuz_TMA-9_launch.jpg/1024px-Soyuz_TMA-9_launch.jpg',
  'electron':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Electron_first_stage_test_fire.jpg/1024px-Electron_first_stage_test_fire.jpg',
};

export const SPACECRAFT_IMAGES: Record<string, string> = {
  iss: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/International_Space_Station_after_undocking_of_STS-132.jpg/1024px-International_Space_Station_after_undocking_of_STS-132.jpg',
  hubble:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HST-SM4.jpeg/1024px-HST-SM4.jpeg',
  'hubble-space-telescope':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HST-SM4.jpeg/1024px-HST-SM4.jpeg',
  jwst: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/James_Webb_Space_Telescope_revealed_in_full.jpg/1024px-James_Webb_Space_Telescope_revealed_in_full.jpg',
  'james-webb':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/James_Webb_Space_Telescope_revealed_in_full.jpg/1024px-James_Webb_Space_Telescope_revealed_in_full.jpg',
  'voyager-1':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Voyager.jpg/1024px-Voyager.jpg',
  'voyager-2':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Voyager.jpg/1024px-Voyager.jpg',
  tiangong:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Tiangong_space_station_in_November_2022_%28cropped%29.png/1024px-Tiangong_space_station_in_November_2022_%28cropped%29.png',
  dragon:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Crew_Dragon_C206_approaches_the_ISS_for_docking_with_DM-2.jpg/1024px-Crew_Dragon_C206_approaches_the_ISS_for_docking_with_DM-2.jpg',
  'crew-dragon':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Crew_Dragon_C206_approaches_the_ISS_for_docking_with_DM-2.jpg/1024px-Crew_Dragon_C206_approaches_the_ISS_for_docking_with_DM-2.jpg',
  shenzhou:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Shenzhou_spacecraft_diagram.png/1024px-Shenzhou_spacecraft_diagram.png',
  starlink:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Starlink_Mission_%2847926144123%29.jpg/1024px-Starlink_Mission_%2847926144123%29.jpg',
};

export const COMPANY_IMAGES: Record<string, string> = {
  spacex:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SpaceX-Logo.svg/1024px-SpaceX-Logo.svg.png',
  nasa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1024px-NASA_logo.svg.png',
  esa: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/ESA_logo_simple.svg/1024px-ESA_logo_simple.svg.png',
  roscosmos:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Roscosmos.svg/1024px-Roscosmos.svg.png',
  'blue-origin':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Blue_Origin_logo.svg/1024px-Blue_Origin_logo.svg.png',
  'rocket-lab':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Rocket_Lab_logo.svg/1024px-Rocket_Lab_logo.svg.png',
  boeing:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Boeing_full_logo.svg/1024px-Boeing_full_logo.svg.png',
  'lockheed-martin':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Lockheed_Martin_logo.svg/1024px-Lockheed_Martin_logo.svg.png',
};

function isPlaceholder(url?: string | null): boolean {
  if (!url) return true;
  if (url.includes('example.com')) return true;
  if (url.startsWith('http://')) return true;
  return false;
}

function findFirstValid(images?: string[] | null): string | undefined {
  if (!images) return undefined;
  return images.find((img) => !isPlaceholder(img));
}

function lookupByNameOrId(
  table: Record<string, string>,
  id?: string,
  name?: string
): string | undefined {
  if (id) {
    const direct = table[id];
    if (direct) return direct;
  }
  if (name) {
    const lower = name.toLowerCase();
    for (const key of Object.keys(table)) {
      const keyAsName = key.replace(/-/g, ' ');
      if (lower.includes(keyAsName) || keyAsName.includes(lower)) {
        return table[key];
      }
    }
  }
  return undefined;
}

export function getRocketImage(
  id?: string,
  providedImages?: string[] | null,
  name?: string
): string | undefined {
  const valid = findFirstValid(providedImages);
  if (valid) return valid;
  return lookupByNameOrId(ROCKET_IMAGES, id, name);
}

export function getSpacecraftImage(
  id?: string,
  providedImages?: string[] | null,
  name?: string
): string | undefined {
  const valid = findFirstValid(providedImages);
  if (valid) return valid;
  return lookupByNameOrId(SPACECRAFT_IMAGES, id, name);
}

export function getCompanyImage(
  id?: string,
  logo?: string | null,
  name?: string
): string | undefined {
  if (!isPlaceholder(logo)) return logo!;
  return lookupByNameOrId(COMPANY_IMAGES, id, name);
}

export function getLaunchImage(
  id?: string,
  providedImages?: string[] | null,
  rocketName?: string
): string | undefined {
  const valid = findFirstValid(providedImages);
  if (valid) return valid;
  // Fall back to the rocket image if we can identify the rocket.
  return lookupByNameOrId(ROCKET_IMAGES, undefined, rocketName);
}

export function getAstronautImage(photo?: string | null): string | undefined {
  if (!isPlaceholder(photo)) return photo!;
  return undefined;
}
