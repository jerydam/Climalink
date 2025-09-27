"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression, Map as LeafletMap } from "leaflet";

interface MapProps {
  onLocationFound?: (lat: number, lon: number) => void;
}

// Dynamically import react-leaflet components (no SSR)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const DramaticMap: React.FC<MapProps> = ({ onLocationFound }) => {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(
    null
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const mapRef = useRef<LeafletMap | null>(null);

  const initialCenter: LatLngExpression = [40.7128, -74.006]; // NYC
  const initialZoom = 3;

  // ✅ Fix icon issue in useEffect (client-side only)
  useEffect(() => {
    const fixLeafletIcons = async () => {
      const L = await import("leaflet");
      const markerIcon2x = await import(
        "leaflet/dist/images/marker-icon-2x.png"
      );
      const markerIcon = await import("leaflet/dist/images/marker-icon.png");
      const markerShadow = await import(
        "leaflet/dist/images/marker-shadow.png"
      );

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.default,
        iconUrl: markerIcon.default,
        shadowUrl: markerShadow.default,
      });
    };

    fixLeafletIcons();
  }, []);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const getUserLocation = (): void => {
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setIsLocating(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const onSuccess = (position: GeolocationPosition): void => {
      const { latitude, longitude } = position.coords;
      const location: LatLngExpression = [latitude, longitude];
    //   setUserLocation(location);

    //   const { latitude, longitude } = position.coords;
      setUserLocation([latitude, longitude]);

      if (onLocationFound) {
        onLocationFound(latitude, longitude); // <-- notify parent
      }

      if (mapRef.current) {
        const map = mapRef.current;
        // map.setView(initialCenter, 2, { duration: 1.5, easeLinearity: 0.1 });

        // setTimeout(() => {
          map.flyTo(location, 16, { duration: 3, easeLinearity: 0.1 });
        // }, 1600);
      }

      setIsLocating(false);
    };

    const onError = (error: GeolocationPositionError): void => {
      setError(`Error getting location: ${error.message}`);
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  };

  const formatCoordinates = (location: LatLngExpression): string => {
    if (Array.isArray(location)) {
      return `${location[0].toFixed(4)}, ${location[1].toFixed(4)}`;
    }
    if (
      typeof location === "object" &&
      "lat" in location &&
      "lng" in location
    ) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
    return "Unknown coordinates";
  };

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <button
          onClick={getUserLocation}
          disabled={isLocating || !isMapReady}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
            isLocating || !isMapReady
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-primary hover:bg-primary/70 hover:shadow-lg transform hover:scale-105"
          }`}
          type="button"
          aria-label="Get current location"
        >
          {isLocating ? (
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Loading"
              />
              Locating...
            </div>
          ) : !isMapReady ? (
            "🗺️ Loading Map..."
          ) : (
            "🎯 Predict Weather Forecast"
          )}
        </button>

        {error && (
          <div
            className="mt-2 p-2 bg-red-100 text-red-700 rounded text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLocating && (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-[999] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"
                role="status"
                aria-label="Loading"
              />
              <span className="text-lg font-medium">
                Preparing...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        whenReady={handleMapReady}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <div className="text-lg font-semibold">📍 You are here!</div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatCoordinates(userLocation)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Styling for dramatic effects */}
      <style jsx global>{`
        .leaflet-container {
          transition: filter 0.3s ease;
        }

        .leaflet-container.locating {
          filter: brightness(0.8) contrast(1.2);
        }

        .leaflet-marker-icon {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default DramaticMap;
