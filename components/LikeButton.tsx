"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  type: "post" | "recipe";
  id: string;
  initialCount: number;
}

export default function LikeButton({ type, id, initialCount }: LikeButtonProps) {
  const storageKey = `spmab_liked_${type}_${id}`;
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    localStorage.setItem(storageKey, "1");

    fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id }),
    }).catch(() => {});
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
        liked
          ? "bg-brand-500/15 text-brand-300 border-brand-500/30 cursor-default"
          : "bg-dark-800 hover:bg-brand-500/10 text-gray-400 hover:text-brand-300 border-dark-600 hover:border-brand-500/30"
      }`}
      aria-label={liked ? "Già apprezzato" : "Questo articolo ti è stato utile?"}
    >
      <Heart
        size={15}
        className={`transition-transform duration-300 ${animating ? "scale-150" : "scale-100"}`}
        fill={liked ? "currentColor" : "none"}
        strokeWidth={liked ? 0 : 2}
      />
      <span>{count > 0 ? `${count} utile${count === 1 ? "" : "i"}` : liked ? "1 utile" : "È stato utile?"}</span>
    </button>
  );
}
