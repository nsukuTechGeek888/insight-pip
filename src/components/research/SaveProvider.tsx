"use client";
import { useState } from "react";
import { Bookmark, Check } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { notify } from "@/components/ui/Feedback";
export default function SaveProvider({
  id,
  type,
}: {
  id: number;
  type: "brokers" | "prop-firms";
}) {
  const { user } = useUser();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="v2-button"
      disabled={busy}
      aria-pressed={saved}
      onClick={async () => {
        if (!user) {
          router.push(
            "/login?redirect=" +
              encodeURIComponent(
                window.location.pathname + window.location.search,
              ),
          );
          return;
        }
        setBusy(true);
        try {
          const r = saved
            ? null
            : await fetch("/api/user/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  entityType: type === "brokers" ? "broker" : "propFirm",
                  entityId: id,
                }),
              });
          if (saved) {
            const remove = await fetch(
              `/api/user/favorites?type=${type === "brokers" ? "broker" : "propFirm"}&entityId=${id}`,
              { method: "DELETE" },
            );
            if (!remove.ok) throw Error("Could not remove saved provider");
            setSaved(false);
          } else {
            const d = await r!.json();
            if (!r!.ok && d.error !== "Favorite already exists")
              throw Error(d.error);
            setSaved(true);
          }
        } catch (e) {
          notify(e instanceof Error ? e.message : "Could not save provider");
        } finally {
          setBusy(false);
        }
      }}
    >
      {saved ? <Check size={15} /> : <Bookmark size={15} />}{" "}
      {saved ? "Saved" : "Save provider"}
    </button>
  );
}
