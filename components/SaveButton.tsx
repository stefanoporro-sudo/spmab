"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export type SavedItem = {
  type: "post" | "recipe";
  id: string;
  title: string;
  url: string;
  savedAt: string;
};

const STORAGE_KEY = "spmab_saved";

export function getSavedItems(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function setSavedItems(items: SavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

interface SaveButtonProps {
  type: "post" | "recipe";
  id: string;
  title: string;
  url: string;
}

export default function SaveButton({ type, id, title, url }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const items = getSavedItems();
    setSaved(items.some((i) => i.type === type && i.id === id));
  }, [type, id]);

  function toggle() {
    const items = getSavedItems();
    if (saved) {
      setSavedItems(items.filter((i) => !(i.type === type && i.id === id)));
      setSaved(false);
    } else {
      setSavedItems([{ type, id, title, url, savedAt: new Date().toISOString() }, ...items]);
      setSaved(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        saved
          ? "bg-brand-500/15 text-brand-300 border-brand-500/30"
          : "bg-dark-800 hover:bg-dark-700 text-gray-400 hover:text-gray-200 border-dark-600 hover:border-dark-500"
      }`}
      aria-label={saved ? "Rimuovi dai salvati" : "Salva per dopo"}
    >
      <Bookmark
        size={15}
        fill={saved ? "currentColor" : "none"}
        strokeWidth={saved ? 0 : 2}
        className="transition-all duration-200"
      />
      <span>{saved ? "Salvato" : "Salva"}</span>
    </button>
  );
}
