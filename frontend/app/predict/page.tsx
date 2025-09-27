// page.tsx
"use client";
import { useState } from "react";
import DramaticMap from "@/components/mapnav";
import { MainNav } from "@/components/navigation/main-nav";

export default function Page() {
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLocationFound = async (lat: number, lon: number) => {
    try {
      setError(null);

      // Reverse geocode
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await res.json();
      setLocationDetails(geoData);

      // Weather (current + forecast)
      try {
        const weatherRes = await fetch(
          `/api/weather?latitude=${lat}&longitude=${lon}`
        );
        
        if (!weatherRes.ok) {
          console.warn("Weather API returned error:", weatherRes.status);
          setWeather(null);
          return;
        }
        
        const weatherData = await weatherRes.json();
        
        // Check if the response has the expected structure
        if (weatherData.error) {
          console.warn("Weather API error:", weatherData.error);
          setWeather(null);
          return;
        }
        
        setWeather(weatherData);
      } catch (weatherError) {
        console.warn("Weather API not available:", weatherError);
        setWeather(null);
      }
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setError("Failed to fetch location data.");
    }
  };

  return (
    <>
    <MainNav />
    <div className="flex max-md:flex-col h-screen">
      {/* Map Side */}
      <div className="w-1/2 h-full">
        <DramaticMap onLocationFound={handleLocationFound} />
      </div>

      {/* Info Side */}
      <div className="w-1/2 h-full p-6 overflow-y-auto bg-gray-100">
        {error && <p className="text-red-600">{error}</p>}

        {locationDetails ? (
          <>
            <h2 className="text-2xl font-bold mb-2">📍 Location</h2>
            <p>
              {locationDetails.display_name ||
                `${locationDetails.address?.road || "Unknown road"}, ${
                  locationDetails.address?.city ||
                  locationDetails.address?.town ||
                  locationDetails.address?.village ||
                  "Unknown place"
                }`}
            </p>
          </>
        ) : (
          <p className="text-gray-500">No location selected yet.</p>
        )}

        {weather ? (
          <div className="mt-6 space-y-8">
            {/* Current Weather */}
            {weather.current && (
              <div className="p-4 bg-white rounded shadow">
                <h2 className="text-xl font-bold mb-2">🌡️ Current Weather</h2>
                <p>Temperature: {weather.current.temperature}°C</p>
                <p>Humidity: {weather.current.humidity}%</p>
                <p>Condition: {weather.current.weatherCondition}</p>
              </div>
            )}

            {/* Daily Forecast */}
            {weather.forecast?.forecast && (
              <div>
                <h2 className="text-xl font-bold mb-4">📅 Daily Forecast</h2>
                {Object.entries(
                  weather.forecast.forecast.reduce((acc: any, item: any) => {
                    const day = new Date(item.timestamp).toLocaleDateString(
                      "en-US",
                      { weekday: "short", day: "numeric", month: "short" }
                    );
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(item);
                    return acc;
                  }, {})
                ).map(([day, entries]: [string, any[]]) => {
                  const temps = entries.map((f) => f.temperature);
                  const min = Math.min(...temps).toFixed(1);
                  const max = Math.max(...temps).toFixed(1);
                  const condition = entries[0].weatherCondition;
                  return (
                    <div key={day} className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="font-semibold">{day}</p>
                      <p>
                        {condition}, {min}–{max}°C
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hourly Timeline */}
            {weather.forecast?.forecast && (
              <div>
                <h2 className="text-xl font-bold mb-4">⏰ Hourly Timeline</h2>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {weather.forecast.forecast.slice(0, 12).map((item: any, idx: number) => {
                    const time = new Date(item.timestamp).toLocaleTimeString(
                      "en-US",
                      { hour: "2-digit", minute: "2-digit" }
                    );
                    return (
                      <div
                        key={idx}
                        className="min-w-[120px] p-3 bg-white rounded shadow text-center"
                      >
                        <p className="font-semibold">{time}</p>
                        <p>{item.temperature}°C</p>
                        <p className="text-sm text-gray-600">
                          {item.weatherCondition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 mt-6">Weather not available yet.</p>
        )}
      </div>
    </div>
    </>
  );
}