"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { threatLevelToColor } from "./threat-colors";

export type BeachPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  patrolType: string;
  flagStatus: string;
  threatLevel: number;
};

function FlyToBeach({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

function makeIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px ${color}55"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function BeachMap({
  beaches,
  selectedBeachId,
  flyToBeachId,
}: {
  beaches: BeachPin[];
  selectedBeachId?: string;
  flyToBeachId?: string;
}) {
  const flyTarget = beaches.find((b) => b.id === flyToBeachId);

  const icons = useMemo(() => {
    return new Map(
      beaches.map((b) => [b.id, makeIcon(threatLevelToColor(b.threatLevel))]),
    );
  }, [beaches]);

  return (
    <MapContainer
      center={[-33.78, 151.29]}
      zoom={12}
      className="h-full w-full rounded-xl"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {flyTarget ? (
        <FlyToBeach lat={flyTarget.lat} lng={flyTarget.lng} />
      ) : null}
      {beaches.map((beach) => (
        <Marker
          key={beach.id}
          position={[beach.lat, beach.lng]}
          icon={icons.get(beach.id) ?? makeIcon(threatLevelToColor(beach.threatLevel))}
          opacity={selectedBeachId && selectedBeachId !== beach.id ? 0.6 : 1}
        >
          <Popup>
            <strong>{beach.name}</strong>
            <br />
            {beach.patrolType} · flag {beach.flagStatus} · L{beach.threatLevel}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
