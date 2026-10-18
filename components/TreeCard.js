import Link from "next/link";
import { getCoverImage, HEALTH_STATUSES } from "@/lib/trees";
import {
  DocumentDuplicateIcon,
  MapPinIcon,
  PencilIcon,
  TreeIcon,
  TrashIcon,
} from "@/components/icons";

export default function TreeCard({ tree, onDelete, onDuplicate }) {
  const accent = tree.color || "#22c55e";
  const cover = getCoverImage(tree);
  const photoCount = tree.images?.length || 0;
  const healthInfo = HEALTH_STATUSES.find((h) => h.value === tree.health);

  return (
    <div className="group h-full flex flex-row sm:flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 sm:hover:-translate-y-1 transition-all duration-300">
      <div className="hidden sm:block h-1 w-full shrink-0" style={{ background: accent }} />

      <div className="w-24 sm:w-full aspect-square shrink-0 bg-slate-100 dark:bg-slate-700 overflow-hidden relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={tree.name}
            className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 30% 25%, ${accent}3d, transparent 60%), linear-gradient(135deg, ${accent}2a, ${accent}0a)`,
            }}
          >
            <TreeIcon
              className="w-7 h-7 sm:w-14 sm:h-14 drop-shadow-sm"
              style={{ color: accent }}
            />
          </div>
        )}

        {healthInfo && (
          <span
            className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
            style={{ backgroundColor: healthInfo.color }}
            title={healthInfo.label}
          />
        )}

        {photoCount > 1 && (
          <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            +{photoCount - 1}
          </span>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col justify-center sm:justify-start gap-0.5 sm:gap-1.5 flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span
            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ring-2 ring-offset-1"
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
            <button
              onClick={() => onDuplicate(tree.id)}
              aria-label={`Duplicate ${tree.name}`}
              className="focus-ring rounded flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150"
            >
              <DocumentDuplicateIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <Link
              href={`/edit/${tree.id}`}
              aria-label={`Edit ${tree.name}`}
              className="focus-ring rounded flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500 hover:text-green-700 hover:bg-green-50 transition-colors duration-150"
            >
              <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <button
              onClick={() => onDelete(tree.id)}
              aria-label={`Delete ${tree.name}`}
              className="focus-ring rounded flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
