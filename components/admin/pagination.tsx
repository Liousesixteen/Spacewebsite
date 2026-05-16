import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Function that builds the href for a given page number */
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 text-sm">
      <div className="text-star-dim">
        第 {page} / {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(prev)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-space-600 text-white hover:border-cosmic-blue/40 ${
            page === 1 ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-label="上一页"
        >
          <ChevronLeft className="w-4 h-4" /> 上一页
        </Link>
        <Link
          href={buildHref(next)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-space-600 text-white hover:border-cosmic-blue/40 ${
            page === totalPages ? 'pointer-events-none opacity-50' : ''
          }`}
          aria-label="下一页"
        >
          下一页 <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
