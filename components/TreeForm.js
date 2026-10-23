"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { uploadTreeImage } from "@/lib/trees";
import { useReferenceData } from "@/lib/reference/ReferenceDataProvider";
import TreeTypeSelect from "@/components/TreeTypeSelect";
import LocationInput from "@/components/LocationInput";
import {
  CameraIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  LeafIcon,
  MapPinIcon,
  PhotoIcon,
  SpinnerIcon,
  XMarkIcon,
} from "@/components/icons";

const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

export default function TreeForm({
  heading,
  initial = null,
  submitLabel = "Save Tree",
  onSubmit,
  embedded = false,
}) {
  const { healthStatuses, locationTypes } = useReferenceData();
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState(initial?.color || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? null);
  const [longitude, setLongitude] = useState(initial?.longitude ?? null);
  const [health, setHealth] = useState(initial?.health || "");
  const [locationType, setLocationType] = useState(initial?.location_type || "");
  const [images, setImages] = useState(() => {
    if (initial?.images?.length) return initial.images;
    if (initial?.image_url) return [initial.image_url];
    return [];
  });
  const [saving, setSaving] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saveError, setSaveError] = useState("");
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const isValid = name.trim().length > 0;

  async function acceptFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;
    setProcessingImages(true);
    setSaveError("");
    try {
      const urls = await Promise.all(files.map((f) => uploadTreeImage(f)));
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setSaveError(err.message || "Could not upload that photo.");
    } finally {
      setProcessingImages(false);
    }
  }

  function handleImageChange(e) {
    acceptFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    acceptFiles(e.dataTransfer.files);
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setCoverImage(index) {
    setImages((prev) => {
      if (index === 0) return prev;
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAttempted(true);
    if (!isValid || processingImages) return;
    setSaving(true);
    setSaveError("");

    try {
      await onSubmit({
        name: name.trim(),
        description,
        location,
        latitude,
        longitude,
        images,
        health,
        locationType,
      });
    } catch (err) {
      setSaveError(err.message || "Something went wrong saving this tree.");
    } finally {
      setSaving(false);
    }
  }

  const formBody = (
    <>
      {!embedded && (
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-green-600 text-white shrink-0">
            <LeafIcon className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {heading}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Record the type, location, and photos of the tree.
            </p>
          </div>
        </div>
      )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>
              Tree Type <span className="text-red-500">*</span>
            </label>
            <TreeTypeSelect
              value={name}
              color={color}
              invalid={attempted && !isValid}
              onChange={(selectedName, selectedColor) => {
                setName(selectedName);
                setColor(selectedColor);
              }}
            />
            {attempted && !isValid && (
              <p className="mt-1.5 text-sm text-red-600">
                Please select a tree type to continue.
              </p>
            )}
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              Every tree of this type shares its color — pick a type&apos;s color
              when creating it, or from the admin panel.
            </p>
          </div>

          <div>
            <label className={labelClass}>Health Status</label>
            <div className="grid grid-cols-3 gap-2">
              {healthStatuses.map((status) => {
                const active = health === status.value;
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() =>
                      setHealth(active ? "" : status.value)
                    }
                    className={`focus-ring flex items-center justify-center gap-1.5 min-h-[44px] px-2 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-150 ${
                      active
                        ? "text-white border-transparent shadow-sm"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    }`}
                    style={active ? { backgroundColor: status.color } : undefined}
                  >
                    {active ? (
                      <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                    )}
                    {status.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="tree-description">
              Description
            </label>
            <textarea
              id="tree-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any notes about this tree — condition, planting story, etc."
              className="focus-ring w-full min-h-[88px] border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150 resize-y"
            />
          </div>

          <div>
            <label className={labelClass}>Location</label>
            <LocationInput
              value={location}
              onChange={(loc, lat, lng) => {
                setLocation(loc);
                setLatitude(lat);
                setLongitude(lng);
              }}
            />

            {latitude && longitude ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <MapPinIcon className="w-3.5 h-3.5" />
                {latitude.toFixed(5)}, {longitude.toFixed(5)} — will show on
                map
              </p>
            ) : (
              location && (
                <p className="mt-1.5 text-xs text-amber-600">
                  No coordinates yet — pick a suggestion from the dropdown or
                  tap the pin button so this shows up on the map.
                </p>
              )
            )}

            <div className="mt-3">
              <label className={labelClass} htmlFor="tree-location-type">
                Location Type
              </label>
              <div className="relative">
                <select
                  id="tree-location-type"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="focus-ring appearance-none w-full min-h-[40px] border border-slate-300 dark:border-slate-600 rounded-xl pl-3 pr-8 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-shadow duration-150"
                >
                  <option value="">Not specified</option>
                  {locationTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Photos {images.length > 0 && `(${images.length})`}
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-lg ${
                      i === 0 ? "ring-2 ring-green-500" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      aria-label={`Remove photo ${i + 1}`}
                      className="focus-ring absolute top-1 right-1 flex items-center justify-center w-6 h-6 bg-white/95 backdrop-blur text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-full shadow-sm transition-colors duration-150"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                    </button>
                    {i === 0 ? (
                      <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCoverImage(i)}
                        className="focus-ring absolute bottom-1 left-1 bg-black/60 hover:bg-black/75 text-white text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors duration-150"
                      >
                        Set as cover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="focus-ring flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl py-6 text-sm font-medium text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/60 transition-colors duration-150"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
                  <CameraIcon className="w-[18px] h-[18px]" />
                </span>
                Take Photo
              </button>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`focus-ring flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 text-sm font-medium transition-colors duration-150 ${
                  dragOver
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50/60"
                }`}
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
                  <PhotoIcon className="w-[18px] h-[18px]" />
                </span>
                {dragOver ? "Drop to upload" : "Gallery"}
              </button>
            </div>
            {processingImages ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                <SpinnerIcon className="w-3.5 h-3.5" />
                Processing photo...
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                Add as many photos as you like. The first one is used as the
                cover photo.
              </p>
            )}

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {saveError && (
            <p className="-mt-2 text-sm text-red-600 dark:text-red-400">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || processingImages || (attempted && !isValid)}
            className={`focus-ring flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl font-semibold shadow-sm transition-colors duration-150 ${
              saving || processingImages
                ? "bg-green-600/70 text-white cursor-wait"
                : attempted && !isValid
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                  : "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-green-600/20"
            }`}
          >
            {(saving || processingImages) && <SpinnerIcon className="w-4 h-4" />}
            {saving ? "Saving..." : processingImages ? "Processing photo..." : submitLabel}
          </button>
        </form>
    </>
  );

  if (embedded) return formBody;

  return (
    <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link
        href="/"
        className="focus-ring rounded inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-4 transition-colors duration-150"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back
      </Link>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm shadow-slate-200/60 dark:shadow-none p-5 sm:p-8">
        {formBody}
      </div>
    </main>
  );
}
