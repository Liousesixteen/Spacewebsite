import { Calendar, Camera } from 'lucide-react';

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
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.warn('NASA APOD API returned non-OK:', res.status);
      return null;
    }

    const data: ApodData = await res.json();

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
    <section className="relative overflow-hidden rounded-3xl mx-4 md:mx-8 lg:mx-auto lg:max-w-7xl">
      {/* The actual APOD image — displayed cleanly, no blur */}
      <div className="aspect-[21/9] md:aspect-[21/7] relative overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={apod.hdurl || apod.url}
          alt={apod.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle gradient overlay — darkens bottom for text readability without blurring */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Text content — bottom-left aligned, clean overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              {/* NASA label with icon */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-xs font-medium mb-4">
                <Camera className="w-3.5 h-3.5" />
                NASA 每日天文图
                <span className="text-white/40">•</span>
                <Calendar className="w-3.5 h-3.5" />
                {apod.date}
              </div>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
                {apod.title}
              </h2>
              <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-xl line-clamp-3 drop-shadow-md">
                {apod.explanation}
              </p>
              {apod.copyright && (
                <p className="mt-2 text-xs text-white/50">
                  © {apod.copyright}
                </p>
              )}
            </div>

            {/* Action button */}
            <div className="flex-shrink-0">
              <a
                href={apod.hdurl || apod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all text-sm font-medium"
              >
                查看原图
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
