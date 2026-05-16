'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SearchBoxProps {
  placeholder?: string;
  /** Query param name. Defaults to 'q'. */
  paramName?: string;
}

export function SearchBox({ placeholder = '搜索...', paramName = 'q' }: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? '');

  // Keep input in sync if the URL changes externally.
  useEffect(() => {
    setValue(searchParams.get(paramName) ?? '');
  }, [searchParams, paramName]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(paramName, value.trim());
    } else {
      params.delete(paramName);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-star-dim" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-space-800 border border-space-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-star-dim focus:outline-none focus:border-cosmic-blue w-64"
      />
    </form>
  );
}
