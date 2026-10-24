"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinIcon, SearchIcon, SpinnerIcon } from "@/components/icons";

export default function LocationInput({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const boxRef = useRef(null);
  const skipNextSearch = useRef(false);

  // Keep local text in sync if parent resets it (e.g. form reset after save)
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Debounced address search via OpenStreetMap Nominatim (free, no API key)
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await res.json();
        setSuggestions(data);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(s) {
    skipNextSearch.current = true;
    setQuery(s.display_name);
    setSuggestions([]);
    setOpen(false);
    onChange(s.display_name, parseFloat(s.lat), parseFloat(s.lon));
  }

  function handleTyping(e) {
    const text = e.target.value;
    setQuery(text);
    onChange(text, null, null); // typing freehand clears coordinates until a suggestion is picked
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device/browser.");
      return;
    }
    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          const name = data.display_name || `${lat}, ${lng}`;
          skipNextSearch.current = true;
          setQuery(name);
          onChange(name, lat, lng);
        } catch {
          skipNextSearch.current = true;
          setQuery(`${lat}, ${lng}`);
          onChange(`${lat}, ${lng}`, lat, lng);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            "Location access is blocked. Allow it for this site in your browser's settings, then try again."
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("Your location couldn't be determined. Try again or search for the address instead.");
        } else if (err.code === err.TIMEOUT) {
          setError("Getting your location took too long. Try again.");
        } else {
          setError("Could not get your location.");
        }
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <SearchIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={handleTyping}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search for a location..."
            aria-label="Location"
            className="focus-ring w-full min-w-0 min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl pl-10 pr-3.5 text-sm sm:text-base focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
          />
        </div>
        <button
          type="button"
          onClick={detectLocation}
          disabled={locating}
          aria-label="Use my current location"
          title="Use my current location"
          className="focus-ring shrink-0 flex items-center justify-center w-11 min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500 disabled:opacity-50 transition-colors duration-150"
        >
          {locating ? (
            <SpinnerIcon className="w-4 h-4" />
          ) : (
            <MapPinIcon className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>

      {searching && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">Searching...</p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

      {open && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1.5 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-56 overflow-auto py-1">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onClick={() => selectSuggestion(s)}
              className="focus-ring w-full flex items-start gap-2 text-left px-3.5 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/60"
            >
              <MapPinIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <span className="min-w-0">{s.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
