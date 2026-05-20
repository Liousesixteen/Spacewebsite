'use client';

import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  // On mobile: collapse to just "← 返回" showing the parent label (second-to-last item)
  const parentLabel = items.length >= 2 ? items[items.length - 2].label : items[0].label;

  return (
    <>
      {/* Desktop breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={cn('hidden md:flex items-center gap-1 text-sm', className)}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-star-dim shrink-0" />
              )}
              {isLast || !item.href ? (
                <span className="text-star-dim" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-cosmic-blue hover:text-star-white transition-colors hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {/* Mobile collapsed breadcrumb */}
      <div className="md:hidden">
        {items.length >= 2 && items[items.length - 2].href ? (
          <Link
            href={items[items.length - 2].href!}
            className="inline-flex items-center gap-1 text-sm text-cosmic-blue hover:text-star-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回 {parentLabel}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm text-star-dim">
            <ArrowLeft className="w-4 h-4" />
            返回 {parentLabel}
          </span>
        )}
      </div>
    </>
  );
}
