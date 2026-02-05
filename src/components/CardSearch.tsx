"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { CardInfo } from "@/types";

interface CardSearchProps {
  onSelect: (card: CardInfo) => void;
  onSkip: () => void;
}

export default function CardSearch({ onSelect, onSkip }: CardSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search-cards?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.cards || []);
        setHasSearched(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = useCallback((card: CardInfo) => {
    onSelect(card);
  }, [onSelect]);

  // Extract year from release date
  const getYear = (releaseDate?: string) => {
    if (!releaseDate) return null;
    return new Date(releaseDate).getFullYear();
  };

  return (
    <div className="min-h-screen min-h-[-webkit-fill-available] bg-gradient-to-b from-blue-900 to-blue-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-blue-900/95 backdrop-blur-sm border-b border-white/10 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={onSkip} 
            className="text-white/70 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            Skip
          </button>
          <span className="text-white font-medium text-lg">Identify Your Card</span>
          <div className="w-11" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search card name (e.g., Charizard, Pikachu)"
            className="w-full px-4 py-4 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20"
            autoFocus
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-yellow-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Instructions */}
        {!hasSearched && query.length < 2 && (
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/60 text-sm text-center">
              Type at least 2 characters to search for your card
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/60 text-sm px-1">
              {results.length} cards found - tap to select
            </p>
            <div className="grid grid-cols-2 gap-3">
              {results.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelect(card)}
                  className="bg-white/10 rounded-xl p-3 text-left hover:bg-white/20 active:scale-[0.98] transition-all border border-transparent hover:border-yellow-400/30"
                >
                  <div className="flex gap-3">
                    {/* Card Image */}
                    <div className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                      {card.images?.small && (
                        <Image
                          src={card.images.small}
                          alt={card.name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                    {/* Card Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{card.name}</p>
                      <p className="text-white/50 text-xs truncate">{card.set.name}</p>
                      <p className="text-white/40 text-xs mt-1">
                        #{card.number} • {getYear(card.set.releaseDate)}
                      </p>
                      {card.rarity && (
                        <p className="text-yellow-400/70 text-xs mt-1 truncate">{card.rarity}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {hasSearched && results.length === 0 && !isSearching && (
          <div className="bg-white/5 rounded-xl p-6 text-center">
            <p className="text-white/60 text-sm">
              No cards found for &quot;{query}&quot;
            </p>
            <p className="text-white/40 text-xs mt-2">
              Try a different spelling or the Pokemon name only
            </p>
          </div>
        )}
      </div>

      {/* Bottom Skip Button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pt-4 pb-4 bg-gradient-to-t from-blue-950 via-blue-950/95 to-transparent safe-bottom">
        <button
          onClick={onSkip}
          className="w-full py-4 px-6 rounded-xl bg-white/10 text-white font-medium text-base border border-white/20 active:bg-white/20 transition-all min-h-[56px]"
        >
          Skip Card Identification
        </button>
      </div>
    </div>
  );
}
