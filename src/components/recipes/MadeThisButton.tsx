"use client";

import { Button } from "react-bootstrap";
import { CheckCircleFill } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import swal from "sweetalert";
import { loadTotals, saveTotals } from "@/components/dashboard/MacroTracker";

type Props = {
  recipeId: number;
  initialCount?: number;
  onIncrement?: (newCount: number) => void;
  layout?: "full" | "compact";
  disabled?: boolean;
  // Optional macro logging (absorbed from CookRecipeButton)
  owner?: string | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
};

export default function MadeThisButton({
  recipeId,
  initialCount = 0,
  onIncrement,
  layout = "full",
  disabled = false,
  owner,
  proteinGrams,
  carbsGrams,
  fatGrams,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

    const getRatingStatus = async () => {
    const res = await fetch(`/api/recipes/${recipeId}/rating`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) throw new Error(data?.error ?? "Failed to fetch rating status");

    return {
      hasRated: Boolean(data?.hasRated),
      rating: data?.rating ?? null,
    };
  };

  const submitRating = async (rating: number) => {
    const res = await fetch(`/api/recipes/${recipeId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) throw new Error(data?.error ?? "Failed to save rating");

    return data;
  };

    const promptForRating = async () => {
    let selectedRating = 0;

    const wrapper = document.createElement("div");
    wrapper.style.textAlign = "center";

    const label = document.createElement("div");
    label.style.cssText = "margin-bottom:0.75rem;font-size:0.95rem;color:#495057;";
    label.textContent = "How would you rate this recipe?";
    wrapper.appendChild(label);

    const starsRow = document.createElement("div");
    starsRow.style.cssText =
      "display:flex;justify-content:center;gap:0.5rem;margin-bottom:0.75rem;";
    wrapper.appendChild(starsRow);

    const helper = document.createElement("div");
    helper.style.cssText = "font-size:0.85rem;color:#007FFF;";
    helper.textContent = "Select 1 to 5 stars";
    wrapper.appendChild(helper);

    const starButtons: HTMLButtonElement[] = [];

    const paintStars = () => {
      starButtons.forEach((btn, index) => {
        btn.textContent = index < selectedRating ? "★" : "☆";
        btn.style.color = index < selectedRating ? "#f5c518" : "#adb5bd";
      });

      helper.textContent =
        selectedRating > 0 ? `${selectedRating}/5 selected` : "Select 1 to 5 stars";
    };

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("button");
      star.type = "button";
      star.textContent = "☆";
      star.style.cssText =
        "font-size:2rem;background:none;border:none;cursor:pointer;line-height:1;";
      star.onclick = () => {
        selectedRating = i;
        paintStars();
      };

      starButtons.push(star);
      starsRow.appendChild(star);
    }

    paintStars();

    const willSubmit = await swal({
      title: "Rate this recipe",
      content: wrapper as any,
      buttons: {
        cancel: {
          text: "Maybe later",
          value: null,
          visible: true,
          className: "swal-btn-cancel",
        },
        confirm: {
          text: "Submit rating",
          value: true,
          visible: true,
          className: "swal-btn-azure",
        },
      },
    });

    if (!willSubmit) return;

    if (selectedRating < 1 || selectedRating > 5) {
      await swal({
        title: "No rating selected",
        text: "Please choose a star rating from 1 to 5.",
        icon: "warning",
      });
      return;
    }

    await submitRating(selectedRating);

    await swal({
      title: "Thanks!",
      text: `You rated this recipe ${selectedRating}/5.`,
      icon: "success",
      timer: 1800,
      buttons: false as any,
    });
  };

  const handleMadeThis = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/recipes/${recipeId}/made`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) throw new Error(data?.error ?? "Failed to update");

      const newCount = data.count;
      const firstTime = Boolean(data.firstTime);

      setCount(newCount);
      onIncrement?.(newCount);

      // --- Macro logging (CookRecipeButton logic) ---
      let macroLines: string[] = [];
      if (owner) {
        const p = proteinGrams ?? 0;
        const c = carbsGrams   ?? 0;
        const f = fatGrams     ?? 0;
        const current = loadTotals(owner);
        saveTotals(owner, {
          protein:  current.protein  + p,
          carbs:    current.carbs    + c,
          fat:      current.fat      + f,
          calories: current.calories + Math.round(4 * p + 4 * c + 9 * f),
        });
        if (p > 0) macroLines.push(`Protein: +${p}g`);
        if (c > 0) macroLines.push(`Carbs: +${c}g`);
        if (f > 0) macroLines.push(`Fat: +${f}g`);
        if (p > 0 || c > 0 || f > 0)
          macroLines.push(`Calories: +${Math.round(4 * p + 4 * c + 9 * f)}kcal`);
      }

      // --- Two-column popup ---
      const content = document.createElement("div");
      content.style.cssText =
        "display:flex;gap:1.25rem;text-align:left;align-items:flex-start;";

      // Left: made count
      const left = document.createElement("div");
      left.style.cssText =
        "flex:1;border-right:1px solid #dee2e6;padding-right:1.25rem;text-align:center;";
      left.innerHTML = `
        <div style="font-size:0.8rem;color:#6c757d;text-transform:uppercase;letter-spacing:0.05em;">Times Made</div>
        <div style="font-size:2rem;font-weight:700;line-height:1.1;">${newCount}</div>
        <div style="font-size:0.85rem;color:#6c757d;">time${newCount === 1 ? "" : "s"}</div>
      `;

      // Right: macros added
      const right = document.createElement("div");
      right.style.cssText = "flex:1;padding-left:0.25rem;";
      if (!owner) {
        right.innerHTML = `<div style="font-size:0.8rem;color:#6c757d;">Sign in to log macros.</div>`;
      } else if (macroLines.length === 0) {
        right.innerHTML = `<div style="font-size:0.8rem;color:#6c757d;">No macro data for this recipe.</div>`;
      } else {
        right.innerHTML = `
          <div style="font-size:0.8rem;color:#6c757d;text-transform:uppercase;letter-spacing:0.05em;
          margin-bottom:0.4rem;">Added to Daily Macros</div>
          ${macroLines
            .map(
              (line) =>
                `<div style="font-size:0.9rem;font-weight:500;">${line}</div>`
            )
            .join("")}
        `;
      }

      content.appendChild(left);
      content.appendChild(right);

      await swal({
        title: "Logged!",
        icon: "success",
        content: content as any,
        timer: 2500,
        buttons: false as any,
      });
            if (owner) {
        try {
          const ratingStatus = await getRatingStatus();

          if (!ratingStatus.hasRated) {
            await promptForRating();
          }
        } catch (error) {
          console.error("Rating popup failed:", error);
        }
      }
    } catch (err: any) {
      swal({
        title: "Error",
        text: err?.message ?? "Something went wrong",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCompact = layout === "compact";

  return (
    <div className={isCompact ? "" : "d-grid gap-2"}>
      {!isCompact && (
        <div className="text-muted">
          Made <strong>{count}</strong> time{count === 1 ? "" : "s"}
        </div>
      )}

      <Button
        variant="success"
        className={isCompact ? "" : "w-100"}
        onClick={handleMadeThis}
        disabled={disabled || loading}
      >
        <CheckCircleFill className="me-2" />
        {loading ? "Saving..." : isCompact ? `Made ${count}` : "I Made This"}
      </Button>

      {!owner && !isCompact && (
        <small className="text-muted text-center">Sign in to log macros</small>
      )}
    </div>
  );
}
