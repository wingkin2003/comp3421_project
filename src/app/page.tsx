"use client";

import { useState, useEffect, JSX } from "react";
import { Heading, Text, Button, Flex, IconButton } from "@radix-ui/themes";
import { RefreshCw, Sun, Cloud, CloudRain, Droplets, Share2 } from "lucide-react";
import WeatherCard from "@/app/components/WeatherCard";
import { getHongKongWeather, getLast7DaysWeather, getTodayLast8Hours, getNext8HoursForecast, WeatherData, WeatherHistory } from "@/app/lib/weather";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [history, setHistory] = useState<WeatherHistory[]>([]);
  const [view, setView] = useState<"current" | "last7days" | "today8hours" | "forecast8hours">("current");
  const [isCelsius, setIsCelsius] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fetchData = async (viewType: typeof view) => {
    if (isLoading || viewType === view) return;
    setIsLoading(true);
    try {
      if (viewType === "current") {
        const data = await getHongKongWeather();
        setWeather(data);
        setHistory([]);
      } else if (viewType === "last7days") {
        const data = await getLast7DaysWeather();
        setWeather(null);
        setHistory(data);
      } else if (viewType === "today8hours") {
        const data = await getTodayLast8Hours();
        setWeather(null);
        setHistory(data);
      } else {
        const data = await getNext8HoursForecast();
        setWeather(null);
        setHistory(data);
      }
      setView(viewType);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData("current");
  }, []);

  const toggleUnit = () => setIsCelsius(!isCelsius);
  const refreshData = () => fetchData(view);
  const toggleMap = () => setShowMap(!showMap);
  const shareWeather = () => {
    const text = weather
      ? `Hong Kong Weather: ${weather.condition}, ${weather.temperature.toFixed(1)}°C, Rain: ${weather.rainfall?.toFixed(1)} mm`
      : "Check out Hong Kong Weather!";
    navigator.clipboard.writeText(text);
    alert("Weather copied to clipboard!");
  };

  const conditionIcons: Record<string, JSX.Element> = {
    Sunny: <Sun className="w-6 h-6 text-yellow-400 animate-pulse" />,
    Cloudy: <Cloud className="w-6 h-6 text-gray-500" />,
    Rainy: <CloudRain className="w-6 h-6 text-blue-500 animate-bounce" />,
    Humid: <Droplets className="w-6 h-6 text-blue-300" />,
  };

  return (
    <div className="min-h-screen bg-cloudy animate-fadeIn">
      <Flex direction="column" gap="8" p="8" align="center" className="max-w-6xl mx-auto">
        <Flex justify="between" align="center" width="100%">
          <Heading size="8" className="text-blue-900 drop-shadow-lg">
            Hong Kong Weather
          </Heading>
          <Flex gap="4">
            <IconButton
              variant="ghost"
              className="hover:bg-blue-200/50 transition-colors rounded-full"
              onClick={shareWeather}
              title="Share Weather"
            >
              <Share2 className="w-6 h-6 text-blue-800" />
            </IconButton>
            <IconButton
              variant="ghost"
              className="hover:bg-blue-200/50 transition-colors rounded-full"
              onClick={refreshData}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw className={`w-6 h-6 ${isLoading ? "animate-spin" : ""} text-blue-800`} />
            </IconButton>
          </Flex>
        </Flex>

        {/* Time Range Buttons */}
        <Flex gap="4" wrap="wrap" justify="center">
          {[
            { id: "current", label: "Current Weather" },
            { id: "last7days", label: "Last 7 Days" },
            { id: "today8hours", label: "Today (Last 8 Hours)" },
            { id: "forecast8hours", label: "Next 8 Hours" },
          ].map(({ id, label }) => (
            <Button
              key={id}
              variant={view === id ? "solid" : "outline"}
              className={`px-6 py-2 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md ${view === id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white/40 text-blue-800 hover:bg-blue-100/60"
                }`}
              onClick={() => fetchData(id as typeof view)}
              disabled={isLoading}
            >
              {label}
            </Button>
          ))}
        </Flex>

        {/* Current Weather */}
        {view === "current" && (
          <>
            {isLoading ? (
              <Text size="5" className="text-blue-700 animate-pulse">Loading...</Text>
            ) : weather ? (
              <Flex direction="column" gap="4" align="center">
                <WeatherCard
                  temperature={weather.temperature}
                  humidity={weather.humidity}
                  condition={weather.condition}
                  updateTime={weather.updateTime}
                  rainfall={weather.rainfall}
                  uvIndex={weather.uvIndex}
                  windSpeed={weather.windSpeed}
                  isCelsius={isCelsius}
                  toggleUnit={toggleUnit}
                />
                {weather.uvIndex !== undefined && (
                  <Text
                    size="4"
                    className="text-blue-800 bg-white/70 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm"
                  >
                    UV Index: {weather.uvIndex.toFixed(1)} (
                    {weather.uvIndex < 3 ? "Low" : weather.uvIndex < 6 ? "Moderate" : "High"})
                  </Text>
                )}
              </Flex>
            ) : (
              <Text size="5" color="red" className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-lg">
                Unable to load weather data
              </Text>
            )}
          </>
        )}

        {/* Historical/Forecast Data */}
        {history.length > 0 && (
          <div className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-slideUp chart-container">
            <Heading size="6" className="mb-6 text-blue-900">
              {view === "last7days"
                ? "Last 7 Days Weather"
                : view === "today8hours"
                  ? "Today’s Last 8 Hours"
                  : "Next 8 Hours Forecast"}
            </Heading>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={history}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleString("en-US", {
                      month: view === "last7days" ? "short" : undefined,
                      day: view === "last7days" ? "numeric" : undefined,
                      hour: view !== "last7days" ? "numeric" : undefined,
                      minute: view !== "last7days" ? "numeric" : undefined,
                    })
                  }
                  stroke="#1e40af"
                />
                <YAxis
                  yAxisId="temp"
                  domain={isCelsius ? [15, 35] : [60, 95]}
                  unit={isCelsius ? "°C" : "°F"}
                  stroke="#1e40af"
                />
                <YAxis yAxisId="rain" orientation="right" domain={[0, 20]} unit="mm" stroke="#1e40af" />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "Temperature"
                      ? `${value.toFixed(1)}${isCelsius ? "°C" : "°F"}`
                      : `${value.toFixed(1)} mm`
                  }
                  contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "10px", border: "none" }}
                />
                <Legend />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey={(item) => (isCelsius ? item.temperature : (item.temperature * 9) / 5 + 32)}
                  name="Temperature"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#3b82f6", strokeWidth: 2 }}
                />
                <Line
                  yAxisId="rain"
                  type="monotone"
                  dataKey="rainfall"
                  name="Rainfall"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 6, fill: "#10b981", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <Flex wrap="wrap" gap="4" justify="center" className="mt-8">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="w-52 bg-white/70 backdrop-blur-md rounded-xl p-5 text-center shadow-lg hover:shadow-xl hover:scale-105 hover:-rotate-2 transition-all duration-300"
                >
                  <Flex direction="column" gap="2">
                    <Flex justify="center">
                      {conditionIcons[item.condition] || <Cloud className="w-6 h-6 text-gray-500" />}
                    </Flex>
                    <Text size="3" weight="bold" className="text-blue-900">
                      {new Date(item.date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text size="4" className="text-blue-800">
                      {(isCelsius ? item.temperature : (item.temperature * 9) / 5 + 32).toFixed(1)}
                      {isCelsius ? "°C" : "°F"}
                    </Text>
                    <Text size="3" className="text-gray-700">Rain: {item.rainfall.toFixed(1)} mm</Text>
                    <Text size="3" className="text-gray-700">{item.condition}</Text>
                    {item.windSpeed !== undefined && (
                      <Text size="3" className="text-gray-700">Wind: {item.windSpeed.toFixed(1)} km/h</Text>
                    )}
                    {item.uvIndex !== undefined && (
                      <Text size="3" className="text-gray-700">UV: {item.uvIndex.toFixed(1)}</Text>
                    )}
                  </Flex>
                </div>
              ))}
            </Flex>
          </div>
        )}

        {/* Interactive Map */}
        {view === "current" && (
          <div className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mt-8 animate-slideUp">
            <Flex justify="between" align="center" mb="4">
              <Heading size="5" className="text-blue-900">
                Hong Kong Weather Map
              </Heading>
              <Button
                variant="soft"
                className="bg-blue-100/80 hover:bg-blue-200/80 transition-colors rounded-full"
                onClick={toggleMap}
              >
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </Flex>
            {showMap && (
              <div className="relative h-72 bg-blue-50 rounded-lg overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Text size="4" className="text-blue-800">
                    [Interactive Map: Click Hong Kong Regions]
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weather Effect */}
        {weather?.condition === "Rainy" && (
          <div className="fixed inset-0 pointer-events-none">
            <svg className="w-full h-full">
              {[...Array(20)].map((_, i) => (
                <line
                  key={i}
                  x1={Math.random() * 100 + "%"}
                  y1="0"
                  x2={Math.random() * 100 + "%"}
                  y2="10"
                  stroke="rgba(59, 130, 246, 0.7)"
                  strokeWidth="1"
                  className="animate-rain"
                />
              ))}
            </svg>
          </div>
        )}
      </Flex>
    </div>
  );
}