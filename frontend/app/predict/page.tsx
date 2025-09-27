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
                  </div>
                )}
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => setActiveModal("upgrade-validator")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3"
                    size="lg"
                    disabled={!isConnected}
                  >
                    <Coins className="h-5 w-5 mr-2" />
                    {isConnected ? "Upgrade to Validator" : "Connect Wallet First"}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Requires 100 BDAG tokens • 60-day lock period • Instant 1000 CLT bonus
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">Validator Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Validation Rewards */}
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Validation Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Earn CLT tokens for every report you validate correctly. Accurate validators share reward pools.
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Variable CLT Rewards
                  </Badge>
                </CardContent>
              </Card>

              {/* Staking Bonus */}
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center mb-3">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Instant Bonus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive 1000 CLT tokens immediately upon staking your BDAG tokens.
                  </p>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    1000 CLT Bonus
                  </Badge>
                </CardContent>
              </Card>

              {/* DAO Eligibility */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">DAO Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Become eligible to join the DAO for governance participation and proposal creation.
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Governance Rights
                  </Badge>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Requirements Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Validator Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Coins className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">BDAG Stake</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stake 100 BDAG tokens to participate in validation
                  </p>
                  <Badge variant="outline">100 BDAG Required</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Lock Period</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tokens are locked for 60 days to ensure network security
                  </p>
                  <Badge variant="outline">60 Day Lock</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Membership</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Must be a ClimaLink reporter before upgrading
                  </p>
                  <Badge variant="outline">Reporter Status</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-6">
                  Join the validator network and start earning rewards for securing the ClimaLink ecosystem.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => router.push("/validate")}>
                    Go to Validation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      <MobileNav />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={activeModal === "upgrade-validator"}
        onClose={() => setActiveModal(null)}
        title="Upgrade to Validator"
        description="Stake 100 BDAG tokens to become a Validator. You'll receive 1000 CLT tokens immediately as a bonus, then earn rewards by correctly validating community reports. Validators who vote correctly share additional reward pools. Tokens are locked for 60 days."
        onConfirm={handleUpgradeToValidator}
      />
    </div>
    </>
  );
}