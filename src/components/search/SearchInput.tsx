"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchInput({
  placeholder,
  debounceMs = 300,
}: {
  placeholder?: string;
  debounceMs?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.replace(`/products?${params.toString()}`);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [value, debounceMs, router, searchParams]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="field"
      aria-label="بحث في المنتجات"
    />
  );
}