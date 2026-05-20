import { cn } from '@/lib/utils';

export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  date: string;
  copyright?: string;
}

async function fetchApod(): Promise<ApodData | null> {
  try {
    const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
      { next: { revalidate: 3600 } } // Revalidate every hour
    );

    if (!res.ok) {
      console.warn('NASA APOD API returned non-OK:', res.status);
      return null;
    }

    const data: ApodData = await res.json();

    // Only use it if it's an image (videos don't make good backgrounds)
    if (data.media_type !== 'image') {
      return null;
    }

    return data;
  } catch (err) {
    console.warn('Failed to fetch NASA APOD:', err);
    return null;
  }
}

export async function getApodData(): Promise<ApodData | null> {
  return fetchApod();
}

interface ApodSectionProps {
  apod: ApodData | null;
}

export function ApodSection({ apod }: ApodSectionProps) {
  if (!apod) {
    return null;
  }

  return (
    <section className="relative py-24 overflow-hidden">
      {/* APOD image as full-width background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${apod.url})` }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-space-900/80 backdrop-blur-[2px]" />
      {/* Gradient fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-900 via-space-900/60 to-space-900" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-cosmic-blue mb-4">
            NASA Astronomy Picture of the Day
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-star-white mb-6 leading-tight">
            {apod.title}
          </h2>
          <p className="text-star-dim text-base md:text-lg leading-relaxed">
            {apod.explanation.slice(0, 300)}
            {apod.explanation.length > 300 ? '...' : ''}
          </p>
          {apod.copyright && (
            <p className="mt-4 text-xs text-star-dim/60">
              Image credit: {apod.copyright}
            </p>
          )}
          <div className="mt-8">
            <a
              href={`https://apod.nasa.gov/apod/ap${apod.date.replace(/-/g, '').slice(2)}.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cosmic-blue/20 text-cosmic-blue hover:bg-cosmic-blue/30 transition-colors text-sm font-medium"
            >
              View on NASA APOD
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
