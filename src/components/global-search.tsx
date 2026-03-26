"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, User, FileText } from "lucide-react";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const contactResults = useQuery(
    api.contacts.search,
    query.length >= 2 ? { query } : "skip"
  );
  const proposalResults = useQuery(
    api.proposals.search,
    query.length >= 2 ? { query } : "skip"
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults =
    (contactResults && contactResults.length > 0) ||
    (proposalResults && proposalResults.length > 0);

  const handleNavigate = (path: string) => {
    router.push(path);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="pl-8 h-8 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40 text-sm"
        />
      </div>
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto">
          {!hasResults && (
            <div className="p-3 text-sm text-muted-foreground text-center">No results found</div>
          )}
          {contactResults && contactResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                Contacts
              </div>
              {contactResults.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => handleNavigate(`/contacts/${contact._id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    {contact.company && (
                      <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {proposalResults && proposalResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/50">
                Proposals
              </div>
              {proposalResults.map((proposal) => (
                <button
                  key={proposal._id}
                  onClick={() => handleNavigate(`/proposals/${proposal._id}`)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                >
                  <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{proposal.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{proposal.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
