"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCoverImage } from "@/lib/trees";
import { useReferenceData } from "@/lib/reference/ReferenceDataProvider";
import {
  LeafIcon,
  MapPinIcon,
  PencilIcon,
  TreeIcon,
  TrashIcon,
  UserIcon,
} from "@/components/icons";

export default function TreeCard({ tree, onDelete }) {
  const router = useRouter();
  const { healthStatuses } = useReferenceData();
  const [imgFailed, setImgFailed] = useState(false);
  const accent = tree.color || "#22c55e";
  const cover = !imgFailed && getCoverImage(tree);
  const photoCount = tree.images?.length || 0;
  const healthInfo = healthStatuses.find((h) => h.value === tree.health);
  const showOwner = !!tree.owner_name;

  function goToDetail() {
    router.push(`/tree/${tree.id}`);
  }

  function stop(e) {
    e.stopPropagation();
  }

  return (
    <div
      onClick={goToDetail}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      aria-label={`View ${tree.name} details`}
      className="group h-full flex flex-row sm:flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 sm:hover:-translate-y-0.5 transition-all duration-200 cursor-pointer focus-ring"
    >
      <div className="w-24 sm:w-full aspect-square shrink-0 bg-slate-50 dark:bg-slate-700 overflow-hidden relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={tree.name}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, ${accent}14, ${accent}05 55%, transparent)`,
            }}
          >
            <LeafIcon
              className="absolute -right-3 -bottom-3 w-16 h-16 sm:w-24 sm:h-24 opacity-[0.07] rotate-12"
              style={{ color: accent }}
            />
            <span
              className="flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full ring-1"
              style={{
                backgroundColor: `${accent}1a`,
                "--tw-ring-color": `${accent}30`,
              }}
            >
              <TreeIcon
                className="w-4.5 h-4.5 sm:w-7 sm:h-7"
                style={{ color: accent }}
              />
            </span>
          </div>
        )}

        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex items-center gap-1">
          {healthInfo && (
            <>
              <span
                className="sm:hidden w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                style={{ backgroundColor: healthInfo.color }}
                title={healthInfo.label}
              />
              <span
                className="hidden sm:inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[11px] font-medium text-white shadow-sm backdrop-blur-sm"
                style={{ backgroundColor: `${healthInfo.color}e6` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                {healthInfo.label}
              </span>
            </>
          )}
        </div>

        {photoCount > 1 && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            +{photoCount - 1}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col justify-center sm:justify-start gap-0.5 sm:gap-1.5 flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 dark:ring-offset-slate-800"
            style={{ backgroundColor: accent, "--tw-ring-color": `${accent}40` }}
            aria-hidden="true"
          />
          <span className="truncate">{tree.name}</span>
        </h3>

        {tree.location && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            <MapPinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{tree.location}</span>
          </p>
        )}

        {showOwner && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
            <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{tree.owner_name}</span>
          </p>
        )}

        {tree.description && (
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {tree.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-1 mt-1 sm:mt-auto sm:pt-2.5 sm:border-t sm:border-slate-100 dark:border-slate-700/60">
          {tree.latitude && tree.longitude ? (
            <a
              href={`https://www.google.com/maps?q=${tree.latitude},${tree.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stop}
              className="focus-ring rounded flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors duration-150 min-h-[28px] sm:min-h-[32px] shrink-0"
            >
              <MapPinIcon className="w-3.5 h-3.5 hidden sm:block" />
              <span className="sm:hidden">Map</span>
              <span className="hidden sm:inline">Map</span>
            </a>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-0.5">
            <Link
              href={`/edit/${tree.id}`}
              onClick={stop}
              aria-label={`Edit ${tree.name}`}
              className="focus-ring rounded-lg flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors duration-150"
            >
              <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <button
              onClick={(e) => {
                stop(e);
                onDelete(tree.id);
              }}
              aria-label={`Delete ${tree.name}`}
              className="focus-ring rounded-lg flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
            >
              <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
