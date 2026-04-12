'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue, getCategoryEmoji, URGENCY_COLORS } from '@/lib/types';

// Prevent Leaflet default icon from trying to load missing PNGs in Next.js
function fixLeafletIcons() {
  // eslint-disable-next-line -- Leaflet icon hack requires `any` casting
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl:       '/leaflet/marker-icon.png',
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    shadowUrl:     '/leaflet/marker-shadow.png',
  });
}

const DARK_TILE = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// ── Geocoding helpers (Nominatim, no API key required) ───────────────────────
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  const key = location.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const result = data[0]
      ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      : null;
    geocodeCache.set(key, result);
    return result;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
}
const DARK_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function createMarkerIcon(urgency: string, category: string) {
  const color = URGENCY_COLORS[urgency] || URGENCY_COLORS.low;
  const shadowColor = urgency === 'high'
    ? 'rgba(239,68,68,0.5)'
    : urgency === 'medium'
    ? 'rgba(245,158,11,0.5)'
    : 'rgba(99,102,241,0.5)';
  const emoji = getCategoryEmoji(category);

  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${color};
      border:2px solid rgba(255,255,255,0.3);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 0 12px ${shadowColor};
      font-size:14px;cursor:pointer;
    ">${emoji}</div>`,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
}

// Inner component that gets access to the map instance via useMap()
function MarkersLayer({
  issues,
  onIssueClick,
}: {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
}) {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    fixLeafletIcons();

    // Clear old markers immediately
    markersRef.current.forEach((m) => m.removeFrom(map));
    markersRef.current = [];

    let cancelled = false;

    async function placeMarkers() {
      // Resolve coordinates: use stored ones or geocode from location string
      const resolved: Array<{ issue: Issue; lat: number; lng: number }> = [];

      await Promise.all(
        issues.map(async (issue) => {
          if (issue.coordinates?.lat && issue.coordinates?.lng) {
            resolved.push({ issue, lat: issue.coordinates.lat, lng: issue.coordinates.lng });
          } else if (issue.location) {
            const coords = await geocodeLocation(issue.location);
            if (coords) resolved.push({ issue, lat: coords.lat, lng: coords.lng });
          }
        })
      );

      if (cancelled) return;

      resolved.forEach(({ issue, lat, lng }) => {
        const marker = L.marker(
          [lat, lng],
          { icon: createMarkerIcon(issue.urgency, issue.suggestedCategory || issue.category) }
        ).addTo(map);

        if (onIssueClick) marker.on('click', () => onIssueClick(issue));
        markersRef.current.push(marker);
      });

      // Auto-fit bounds
      if (resolved.length > 1) {
        const group = L.featureGroup(markersRef.current);
        map.fitBounds(group.getBounds().pad(0.2));
      } else if (resolved.length === 1) {
        map.setView([resolved[0].lat, resolved[0].lng], 12);
      }
    }

    placeMarkers();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.removeFrom(map));
      markersRef.current = [];
    };
  }, [issues, map, onIssueClick]);

  return null;
}

// FlyTo controller — receives external flyTo requests
function FlyToController({ target }: { target: [number, number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target[0], target[1]], target[2], { duration: 1.2 });
  }, [target, map]);
  return null;
}

interface Props {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  flyTo?: [number, number, number] | null; // [lat, lng, zoom]
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  mapRef?: React.MutableRefObject<L.Map | null>;
}

export default function LeafletMapComponent({
  issues,
  onIssueClick,
  flyTo,
  center = [20.5937, 78.9629],
  zoom = 5,
  interactive = true,
  mapRef,
}: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', background: '#1a1a2e' }}
      zoomControl={false}
      scrollWheelZoom={interactive}
      dragging={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      keyboard={interactive}
      ref={mapRef}
    >
      <TileLayer url={DARK_TILE} attribution={DARK_ATTR} />
      <MarkersLayer issues={issues} onIssueClick={onIssueClick} />
      {flyTo && <FlyToController target={flyTo} />}
    </MapContainer>
  );
}
