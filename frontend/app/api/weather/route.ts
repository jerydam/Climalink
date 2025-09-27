// app/api/weather/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("latitude");
  const lon = searchParams.get("longitude");

  // Validate inputs
  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Latitude and longitude are required" },
      { status: 400 }
    );
  }

  try {
    console.log(`Fetching weather for lat: ${lat}, lon: ${lon}`);
    
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://climalink-l1md.vercel.app/api/current?latitude=${lat}&longitude=${lon}`, {
        headers: {
          'User-Agent': 'ClimateApp/1.0',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }),
      fetch(`https://climalink-l1md.vercel.app/api/forecast?latitude=${lat}&longitude=${lon}`, {
        headers: {
          'User-Agent': 'ClimateApp/1.0',
        },
        signal: AbortSignal.timeout(10000)
      })
    ]);

    console.log(`Current API status: ${currentRes.status}, Forecast API status: ${forecastRes.status}`);

    if (!currentRes.ok) {
      console.error(`Current weather API failed: ${currentRes.status} ${currentRes.statusText}`);
      const errorText = await currentRes.text();
      console.error('Current API error response:', errorText);
    }

    if (!forecastRes.ok) {
      console.error(`Forecast API failed: ${forecastRes.status} ${forecastRes.statusText}`);
      const errorText = await forecastRes.text();
      console.error('Forecast API error response:', errorText);
    }

    // If both fail, return error
    if (!currentRes.ok && !forecastRes.ok) {
      throw new Error("Both weather APIs failed");
    }

    // Handle partial success
    let current = null;
    let forecast = null;

    try {
      if (currentRes.ok) {
        current = await currentRes.json();
      }
    } catch (e) {
      console.error('Failed to parse current weather JSON:', e);
    }

    try {
      if (forecastRes.ok) {
        forecast = await forecastRes.json();
      }
    } catch (e) {
      console.error('Failed to parse forecast JSON:', e);
    }

    // Return whatever we have
    return NextResponse.json({ current, forecast });
    
  } catch (err) {
    console.error("Weather proxy error:", err);
    
    // Check if it's a timeout error
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: "Weather service timeout" },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: "Weather service unavailable" },
      { status: 500 }
    );
  }
}