import type { IndustryCoverageLevel } from './industry-coverage';

export interface LaunchIndustryCompany {
  id: string;
  name: string;
  country: string;
  aliases?: string[];
  segments: Array<{
    segment: {
      id: string;
      name: string;
      level: IndustryCoverageLevel;
    };
  }>;
}

export function matchLaunchIndustry(
  agency: {
    agencyName?: string | null;
    agencyAbbrev?: string | null;
    country?: string | null;
  },
  companies: LaunchIndustryCompany[]
) {
  const agencyNames = new Set(
    [agency.agencyName, agency.agencyAbbrev]
      .map(normalizeOrganizationName)
      .filter((value): value is string => Boolean(value))
  );
  const matchedCompanies = companies.filter((company) => {
    const companyNames = [company.name, ...(company.aliases ?? [])]
      .map(normalizeOrganizationName)
      .filter((value): value is string => Boolean(value));

    return companyNames.some((name) => agencyNames.has(name));
  });

  const segments = new Map<
    string,
    { id: string; name: string; level: IndustryCoverageLevel }
  >();
  for (const company of matchedCompanies) {
    for (const relation of company.segments) {
      segments.set(relation.segment.id, relation.segment);
    }
  }

  return {
    companies: matchedCompanies,
    segments: Array.from(segments.values()),
  };
}

function normalizeOrganizationName(value?: string | null) {
  if (!value) return '';

  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[\s.,，。/#!$%^*;:{}=_`~()[\]<>?'"“”‘’+-]+/g, ' ')
    .replace(
      /\b(incorporated|inc|limited|ltd|llc|corporation|corp|company|co)\b/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}
