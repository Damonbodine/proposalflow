"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters?: Array<{
    name: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onChange: (value: string | undefined) => void;
  }>;
  onReset?: () => void;
}

export function FilterBar({ searchPlaceholder = "Search...", onSearchChange, filters, onReset }: FilterBarProps) {
  const [search, setSearch] = useState("");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const hasActiveFilters = search || filters?.some((f) => f.value);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {filters?.map((filter) => (
        <Select key={filter.name} value={filter.value ?? "all"} onValueChange={(v) => filter.onChange(v === "all" || v == null ? undefined : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch("");
            onSearchChange?.("");
            onReset?.();
          }}
        >
          <X className="mr-1 h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}