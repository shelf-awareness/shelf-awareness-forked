"use client";

import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { BookmarkFill } from "react-bootstrap-icons";
import swal from "sweetalert";
import "../../styles/buttons.css";

type Props = {
  recipeId: number;
  owner: string | null;
};

export default function SavedRecipeButton({ recipeId, owner }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check initial saved state
  useEffect(() => {
    if (!owner) {
      setIsSaved(false);
      return;
    }

    let cancelled = false;

    const checkSaved = async () => {
      try {
        const url = new URL("/api/saved-recipes", window.location.origin);
        url.searchParams.set("owner", owner);

        const res = await fetch(url.toString(), { cache: "no-store" });
        if (!res.ok) return;

        const list = await res.json();
        const saved =
          Array.isArray(list) && list.some((r: any) => Number(r?.id) === Number(recipeId));

        if (!cancelled) setIsSaved(saved);
      } catch (err) {
        console.error("Error checking saved status:", err);
      }
    };

    checkSaved();

    return () => {
      cancelled = true;
    };
  }, [owner, recipeId]);

  const handleToggle = async () => {
    if (!owner || loading) return;

    setLoading(true);

    // optimistic UI
    const next = !isSaved;
    setIsSaved(next);

    try {
      if (next) {
        // SAVE
        const res = await fetch("/api/saved-recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId, owner }),
        });

        if (!res.ok) throw new Error(await res.text());

        await swal("Success", "Your item has been saved", "success", { timer: 2000 });
      } else {
        // UNSAVE
        const url = new URL("/api/saved-recipes", window.location.origin);
        url.searchParams.set("owner", owner);
        url.searchParams.set("recipeId", String(recipeId));

        const res = await fetch(url.toString(), { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());

        await swal("Removed", "Recipe unsaved", "success", { timer: 1500 });
      }
    } catch (err) {
      console.error("Error toggling save:", err);

      // revert optimistic update
      setIsSaved(!next);

      await swal("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="lg"
        className="w-100 d-flex align-items-center justify-content-center gap-2 dish-btn-primary"
        style={{
          fontWeight: 600,
          padding: "0.75rem 1.5rem",
          fontSize: "1.05rem",
          whiteSpace: "normal",
        }}
        onClick={handleToggle}
        disabled={!owner || loading}
      >
        <BookmarkFill size={18} />
        {loading ? "…" : isSaved ? "Unsave Recipe" : "Save Recipe"}
      </Button>

      {!owner && (
        <small className="text-muted d-block text-center mt-2">
          Sign in to save recipes
        </small>
      )}
    </>
  );
}
