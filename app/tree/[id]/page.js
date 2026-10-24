"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getTree, deleteTree } from "@/lib/trees";
import { useReferenceData } from "@/lib/reference/ReferenceDataProvider";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  TreeIcon,
  UserIcon,
} from "@/components/icons";

export default function TreeDetailPage() {
  return (
    <Suspense fallback={null}>
      <TreeDetail />
    </Suspense>
  );
}

function TreeDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { healthStatuses } = useReferenceData();
  const [tree, setTree] = useState(undefined); // undefined = loading, null = not found
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    getTree(id).then(setTree).catch(() => setTree(null));
  }, [id]);

  if (tree === undefined) {
    return (
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse flex flex-col gap-3">
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </main>
    );
  }

  if (tree === null) {
    return (
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-slate-800 dark:text-slate-200 font-semibold">
          Tree not found
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">
          It may have been deleted already.
        </p>
        <Link
          href="/"
          className="focus-ring rounded text-green-700 dark:text-green-400 hover:underline text-sm font-medium"
        >
          ← Back to list
        </Link>
      </main>
    );
  }

  const images = tree.images?.length
    ? tree.images
    : tree.image_url
      ? [tree.image_url]
      : [];
  const accent = tree.color || "#22c55e";
  const healthInfo = healthStatuses.find((h) => h.value === tree.health);
  const showOwner = !!tree.owner_name;
  const addedOn = tree.created_at
    ? new Date(tree.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  function prevImage() {
    setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function nextImage() {
    setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Delete ${tree.name}? This can't be undone.`);
    if (!confirmed) return;
    await deleteTree(tree.id);
    router.push("/");
  }

  return (
    <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link
        href="/"
        className="focus-ring rounded inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors duration-150"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to list
      </Link>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none overflow-hidden">
        <div className="aspect-square bg-slate-100 dark:bg-slate-700 relative">
          {images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImage]}
                alt={`${tree.name} photo ${activeImage + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    aria-label="Previous photo"
                    className="focus-ring absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors duration-150"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Next photo"
                    className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors duration-150"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`Show photo ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-150 ${
                          i === activeImage
                            ? "bg-white w-4"
                            : "bg-white/60 hover:bg-white/80 w-1.5"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(160deg, ${accent}1f, ${accent}08 55%, transparent)`,
              }}
            >
              <span
                className="flex items-center justify-center w-24 h-24 rounded-full ring-1"
                style={{ backgroundColor: `${accent}1a`, "--tw-ring-color": `${accent}30` }}
              >
                <TreeIcon className="w-11 h-11" style={{ color: accent }} />
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto border-b border-slate-100 dark:border-slate-700/60">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`focus-ring shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                  i === activeImage
                    ? "border-green-500"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {tree.name}
              </h1>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/edit/${tree.id}`}
                aria-label={`Edit ${tree.name}`}
                className="focus-ring rounded-lg flex items-center justify-center w-9 h-9 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
              >
                <PencilIcon className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                aria-label={`Delete ${tree.name}`}
                className="focus-ring rounded-lg flex items-center justify-center w-9 h-9 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(healthInfo || tree.location_type || tree.has_bird_nesting) && (
            <div className="flex flex-wrap gap-2">
              {healthInfo && (
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full text-white"
                  style={{ backgroundColor: healthInfo.color }}
                >
                  {healthInfo.label}
                </span>
              )}
              {tree.location_type && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                  {tree.location_type}
                </span>
              )}
              {tree.has_bird_nesting && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                  🪹 Bird nesting
                </span>
              )}
            </div>
          )}

          {tree.description && (
            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {tree.description}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
            {tree.location && (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
                  <MapPinIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tree.location}</span>
                </span>
                {tree.latitude && tree.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${tree.latitude},${tree.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring rounded shrink-0 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    View on map
                  </a>
                )}
              </div>
            )}

            {showOwner && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <UserIcon className="w-4 h-4 shrink-0" />
                Added by {tree.owner_name}
              </p>
            )}

            {addedOn && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                Added {addedOn}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
