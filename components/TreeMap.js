"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import { getCoverImage } from "@/lib/trees";

// Roughly bounds India (mainland + islands) so the map stays focused on the country
const INDIA_BOUNDS = [
  [6.5, 68.0],
  [37.6, 97.5],
];

// Backs up maxBounds/maxBoundsViscosity below: snaps the view back inside
// India once a drag/zoom gesture finishes. Correcting mid-drag instead would
// race Leaflet's own drag loop and desync the rendered tiles from center.
function BoundsGuard() {
  const map = useMap();
  useEffect(() => {
    function enforce() {
      map.panInsideBounds(INDIA_BOUNDS, { animate: false });
    }
    map.on("dragend", enforce);
    map.on("zoomend", enforce);
    return () => {
      map.off("dragend", enforce);
      map.off("zoomend", enforce);
    };
  }, [map]);
  return null;
}

function dotIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${color || "#9ca3af"};
      border: 2.5px solid white;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function TreeMap({ trees }) {
  const located = trees.filter((t) => t.latitude && t.longitude);

  // Fit the view to however the located trees are actually spread out,
  // rather than a fixed zoom on their geometric average — with trees across
  // several distant cities, that average can land far from any of them.
  const viewProps = located.length
    ? {
        bounds: located.map((t) => [t.latitude, t.longitude]),
        boundsOptions: { padding: [40, 40], maxZoom: 13 },
      }
    : {
        center: [20.5937, 78.9629], // fallback: center of India
        zoom: 5,
      };

  return (
    <MapContainer
      {...viewProps}
      minZoom={5}
      maxBounds={INDIA_BOUNDS}
      maxBoundsViscosity={1.0}
      className="absolute inset-0"
    >
      <BoundsGuard />
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />
      <MarkerClusterGroup chunkedLoading>
        {located.map((tree) => {
          const cover = getCoverImage(tree);
          return (
            <Marker
              key={tree.id}
              position={[tree.latitude, tree.longitude]}
              icon={dotIcon(tree.color)}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div
                  className="flex gap-2.5 items-start w-[200px]"
                  style={{ whiteSpace: "normal" }}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={tree.name}
                      className="w-11 h-11 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: tree.color || "#9ca3af" }}
                      />
                      {tree.name}
                    </p>
                    {tree.location && (
                      <p className="text-xs text-slate-500 break-words leading-snug mt-0.5">
                        {tree.location}
                      </p>
                    )}
                    {tree.owner_name && (
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        by {tree.owner_name}
                      </p>
                    )}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
