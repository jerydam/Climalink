// app/api/weather/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("latitude");
  const lon = searchParams.get("longitude");

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://climalink-l1md.vercel.app/api/current?latitude=${lat}&longitude=${lon}`),
      fetch(`https://climalink-l1md.vercel.app/api/forecast?latitude=${lat}&longitude=${lon}`)
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error("Weather fetch failed");
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    return NextResponse.json({ current, forecast });
  } catch (err) {
    console.error("Weather proxy error:", err);
    return NextResponse.json(
      { error: "Weather service unavailable" },
      { status: 500 }
    );
  }
}
