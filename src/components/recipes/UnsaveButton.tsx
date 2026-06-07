"use client";

import { Button } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import { useState } from "react";
import swal from "sweetalert";

type Props = {
  recipeId: number;
  ownerEmail: string;
  onRemoved: (recipeId: number) => void;
};

export default function UnsaveButton({ recipeId, ownerEmail, onRemoved }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUnsave = async () => {
  
    const ok = await swal({
      title: "Unsave recipe?",
      text: "Remove this recipe from your saved list?",
      icon: "warning",
      buttons: ["Cancel", "Unsave"],
      dangerMode: true,
    });

    if (!ok) return;

    setLoading(true);
    try {
      const url = new URL("/api/saved-recipes", window.location.origin);
      url.searchParams.set("owner", ownerEmail);
      url.searchParams.set("recipeId", String(recipeId));

      const res = await fetch(url.toString(), { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());


      onRemoved(recipeId);


      await swal("Removed", "Recipe unsaved", "success", { timer: 1500 });
    } catch (err) {
      console.error(err);
      await swal("Error", "Failed to remove saved recipe.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="danger"
      className="btn-delete w-100 py-2"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        handleUnsave();
      }}
    >
      {loading ? "Removing…" : <Trash color="white" size={18} />}
    </Button>
  );
}

