export type IndustryCoverageLevel = 'UPSTREAM' | 'MIDSTREAM' | 'DOWNSTREAM';

export interface IndustryCoverageCompany {
  id: string;
  name: string;
  country: string;
  type: string;
}

export interface IndustryCoverageSegment {
  id: string;
  name: string;
  level: IndustryCoverageLevel;
  category: string;
  description: string;
  companies: Array<{
    id: string;
    company: IndustryCoverageCompany;
  }>;
}

export interface IndustryCoverage {
  summary: {
    totalSegments: number;
    totalCompanies: number;
  };
  countries: Array<{ country: string; count: number }>;
  levels: Array<{
    level: IndustryCoverageLevel;
    segmentCount: number;
    companyCount: number;
    segments: Array<{
      id: string;
      name: string;
      category: string;
      description: string;
      companies: IndustryCoverageCompany[];
    }>;
  }>;
}

const LEVELS: IndustryCoverageLevel[] = [
  'UPSTREAM',
  'MIDSTREAM',
  'DOWNSTREAM',
];

export function buildIndustryCoverage(
  segments: IndustryCoverageSegment[],
  options: { country?: string } = {}
): IndustryCoverage {
  const country = options.country?.trim();
  const filteredCompanies = (segment: IndustryCoverageSegment) =>
    segment.companies
      .map((relation) => relation.company)
      .filter((company) => !country || company.country === country);

  const levels = LEVELS.map((level) => {
    const levelSegments = segments
      .filter((segment) => segment.level === level)
      .map((segment) => ({
        id: segment.id,
        name: segment.name,
        category: segment.category,
        description: segment.description,
        companies: filteredCompanies(segment)
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 6),
      }));
    const companyIds = new Set(
      levelSegments.flatMap((segment) =>
        segment.companies.map((company) => company.id)
      )
    );

    return {
      level,
      segmentCount: levelSegments.length,
      companyCount: companyIds.size,
      segments: levelSegments,
    };
  });

  const companiesById = new Map<string, IndustryCoverageCompany>();
  for (const segment of segments) {
    for (const company of filteredCompanies(segment)) {
      companiesById.set(company.id, company);
    }
  }

  const countryCounts = new Map<string, number>();
  for (const company of Array.from(companiesById.values())) {
    countryCounts.set(
      company.country,
      (countryCounts.get(company.country) ?? 0) + 1
    );
  }

  return {
    summary: {
      totalSegments: segments.length,
      totalCompanies: companiesById.size,
    },
    countries: Array.from(countryCounts, ([countryName, count]) => ({
      country: countryName,
      count,
    })).sort((a, b) => a.country.localeCompare(b.country)),
    levels,
  };
}
