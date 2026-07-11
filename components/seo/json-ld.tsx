/**
 * JSON-LD structured data component for schema.org markup.
 * Renders a <script type="application/ld+json"> tag.
 */

import type { ReactNode } from 'react';

export function JsonLd({
  data,
}: {
  data: Record<string, unknown>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Build schema.org Event for a launch.
 */
export function buildLaunchSchema(params: {
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  status?: string | null;
  url: string;
  image?: string | null;
  organizer?: { name: string; url?: string | null } | null;
}): Record<string, unknown> {
  const eventStatus = mapEventStatus(params.status);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: params.name,
    startDate: params.startDate,
    url: params.url,
  };

  if (params.description) schema.description = params.description;
  if (params.endDate) schema.endDate = params.endDate;
  if (eventStatus) schema.eventStatus = eventStatus;
  if (params.image) schema.image = params.image;

  if (params.location) {
    schema.location = {
      '@type': 'Place',
      name: params.location,
    };
  }

  if (params.organizer?.name) {
    const organizer: Record<string, unknown> = {
      '@type': 'Organization',
      name: params.organizer.name,
    };
    if (params.organizer.url) organizer.url = params.organizer.url;
    schema.organizer = organizer;
  }

  return schema;
}

/**
 * Build schema.org Organization for an agency or company.
 */
export function buildOrganizationSchema(params: {
  name: string;
  description?: string | null;
  url: string;
  logo?: string | null;
  country?: string | null;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: params.name,
    url: params.url,
  };

  if (params.description) schema.description = params.description;
  if (params.logo) schema.logo = params.logo;
  if (params.country) {
    schema.address = { '@type': 'PostalAddress', addressCountry: params.country };
  }

  return schema;
}

/**
 * Map our launch status to schema.org EventStatusType.
 */
function mapEventStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  switch (status) {
    case 'PLANNED':
      return 'https://schema.org/EventScheduled';
    case 'POSTPONED':
      return 'https://schema.org/EventPostponed';
    case 'IN_FLIGHT':
    case 'SUCCESS':
      return 'https://schema.org/EventMovedOnline';
    case 'FAILURE':
    case 'CANCELLED':
      return 'https://schema.org/EventCancelled';
    default:
      return null;
  }
}
