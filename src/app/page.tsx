"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Button, Flex, Select, Callout, Tooltip } from "@radix-ui/themes";
import { AlertTriangle, Sun, CloudRain, Thermometer, Umbrella, Calendar, Droplet } from "lucide-react";
import Link from "next/link";
import {
  getRegionalTemperatures,
  getCurrentWarnings,
  getLocalWeatherReport,
  getWeatherForecast,
  RegionalTemperature,
  Warning,
  LocalWeather,
  ForecastDay,
} from "@/app/lib/weather";
import WeatherCard from "@/app/components/WeatherCard";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WeatherPage() {
  const [temperatureData, setTemperatureData] = useState<RegionalTemperature | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [localWeather, setLocalWeather] = useState<LocalWeather | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Hong Kong Observatory");
  const [isLoading, setIsLoading] = useState(true);
  const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "cloudy">("sunny");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "night">("morning");
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isCelsius, setIsCelsius] = useState(true);
  const [raindropPositions, setRaindropPositions] = useState<{
    background: Array<{ x: number; duration: number; delay: number; opacity: number }>;
    foreground: Array<{ x: number; duration: number; delay: number; opacity: number }>;
  }>({ background: [], foreground: [] });

  // Function to parse recordTime or return current HK time
  const formatRecordTime = (recordTime: string): string => {
    if (!recordTime) {
      // Fallback to current HK time
      return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Parse recordTime (e.g., "202504201230" -> "2025-04-20T12:30:00Z")
    const year = recordTime.slice(0, 4);
    const month = recordTime.slice(4, 6);
    const day = recordTime.slice(6, 8);
    const hour = recordTime.slice(8, 10);
    const minute = recordTime.slice(10, 12);
    const dateString = `${year}-${month}-${day}T${hour}:${minute}:00Z`;
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      // Invalid date, fallback to current HK time
      return new Date().toLocaleString("en-US", {
        timeZone: "Asia/Hong_Kong",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Valid date, format in HK timezone
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Hong_Kong",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    // Compute raindrop positions only on the client side
    setRaindropPositions({
      background: Array.from({ length: window.innerWidth >= 768 ? 30 : 20 }, () => ({
        x: Math.random() * 100,
        duration: Math.random() * 0.5 + 1,
        delay: Math.random() * 0.5,
        opacity: Math.random() * 0.3 + 0.3,
      })),
      foreground: Array.from({ length: window.innerWidth >= 768 ? 20 : 15 }, () => ({
        x: Math.random() * 100,
        duration: Math.random() * 0.4 + 0.6,
        delay: Math.random() * 0.3,
        opacity: Math.random() * 0.3 + 0.5,
      })),
    });
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [temps, warnings, local, forecastData] = await Promise.all([
        getRegionalTemperatures(),
        getCurrentWarnings(),
        getLocalWeatherReport(),
        getWeatherForecast(),
      ]);
      setDistricts(temps.map((t) => t.place));
      setTemperatureData(temps.find((t) => t.place === selectedDistrict) || temps[0] || null);
      setWarnings(warnings);
      setLocalWeather(local);
      setForecast(forecastData);

      let condition: "sunny" | "rainy" | "cloudy" = "sunny";
      if (warnings.length > 0 && warnings.some((w) => w.name.toLowerCase().includes("rain"))) {
        condition = "rainy";
      } else if (local?.generalSituation) {
        const situation = local.generalSituation.toLowerCase();
        if (situation.includes("sunny")) condition = "sunny";
        else if (situation.includes("cloudy")) condition = "cloudy";
        else if (situation.includes("rain") || situation.includes("shower")) condition = "rainy";
      }
      setWeatherCondition(condition);

      const hour = new Date().getHours();
      const time = hour >= 6 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "night";
      setTimeOfDay(time);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Hong_Kong", // Use HK timezone
      };
      setCurrentDateTime(now.toLocaleString("en-US", options));
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDistrict]);

  const toggleUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const getBackgroundClass = () => {
    if (weatherCondition === "sunny" && timeOfDay === "morning") return "bg-sunny-morning";
    if (weatherCondition === "rainy") return "bg-rainy";
    if (weatherCondition === "cloudy") return "bg-cloudy";
    if (timeOfDay === "night") return "bg-night";
    return "bg-default";
  };

  const getWeatherIcon = () => {
    if (weatherCondition === "sunny") return <Sun className="weather-icon sunny-icon" />;
    if (weatherCondition === "rainy") return <CloudRain className="weather-icon rainy-icon" />;
    if (weatherCondition === "cloudy") return (
      <svg className="weather-icon cloudy-icon" viewBox="0 0 64 64">
        <path className="cloud-path" d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
        <path className="cloud-puff" d="M28 20a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6z" fill="#9ca3af" />
      </svg>
    );
    return null;
  };

  const chartData = forecast.map((day) => {
    const date = new Date(
      parseInt(day.date.slice(0, 4)),
      parseInt(day.date.slice(4, 6)) - 1,
      parseInt(day.date.slice(6, 8))
    );
    const maxTemp = isCelsius ? day.maxTemp : day.maxTemp * 9 / 5 + 32;
    const minTemp = isCelsius ? day.minTemp : day.minTemp * 9 / 5 + 32;
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      maxTemp,
      minTemp,
      rainProbability: parseInt(day.rainProbability.replace("%", ""), 10) || 0,
    };
  });

  const avgTemp = temperatureData ? (isCelsius ? temperatureData.temperature : temperatureData.temperature * 9 / 5 + 32) : 0;
  const avgRainProb = forecast.length ? forecast.reduce((sum, d) => sum + parseInt(d.rainProbability.replace("%", ""), 10), 0) / forecast.length : 0;
  const avgHumidity = forecast.length ? forecast.reduce((sum, d) => sum + (d.minRh + d.maxRh) / 2, 0) / forecast.length : 0;

  const getTextBoxClass = () => ("text-box");

  return (
    <div className={`weather-page ${getBackgroundClass()} light-mode`}>
      <Flex direction="column" gap="8" p={{ initial: "4", md: "8" }} align="center" className="weather-container">
        {/* Cloud Logo */}
        <div className="cloud-logo">
          <svg viewBox="0 0 100 60" className="cloud-logo-svg">
            <path className="cloud-base" d="M80 30a20 20 0 0 0-40 0 15 15 0 0 0-10 28h60a15 15 0 0 0-10-28z" />
            <path className="cloud-puff-1" d="M50 25a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z" />
            <path className="cloud-puff-2" d="M65 28a7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7z" />
          </svg>
        </div>

        {/* Welcome Header */}
        <div className={`welcome-header ${getTextBoxClass()}`}>
          <Heading size="8" className="welcome-title">
            Hong Kong Weather Dashboard
          </Heading>
          <Text size="4" className="welcome-subtitle">
            Get real-time weather updates and forecasts for your district.
          </Text>
        </div>

        {/* Current Date and Time */}
        <div className={`date-time-box ${getTextBoxClass()}`}>
          <Flex gap="2" align="center" justify="center">
            <Calendar className="date-time-icon" />
            <Text size="4" weight="bold" className="date-time-text">
              {currentDateTime}
            </Text>
          </Flex>
        </div>

        {/* Weather Icon */}
        {getWeatherIcon() && (
          <div className="weather-icon-container">
            {getWeatherIcon()}
          </div>
        )}

        {/* Weather Effects */}
        {!isLoading && weatherCondition === "rainy" && (
          <div className="rain-effect">
            <svg
              className="rain-layer rain-background"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              width="100%"
              height="100%"
            >
              {raindropPositions.background.map((pos, i) => (
                <line
                  key={`bg-rain-${i}`}
                  x1={pos.x}
                  y1="10"
                  x2={pos.x}
                  y2="20"
                  stroke="rgba(179, 182, 187, 0.5)"
                  strokeWidth={Math.random() * 0.2 + 0.1}
                  strokeLinecap="round"
                  className="rain-drop rain-drop-bg"
                  style={{
                    animationDuration: `${pos.duration}s`,
                    animationDelay: `${pos.delay}s`,
                    opacity: pos.opacity,
                  }}
                />
              ))}
            </svg>
            <svg
              className="rain-layer rain-foreground"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              width="100%"
              height="100%"
            >
              {raindropPositions.foreground.map((pos, i) => (
                <line
                  key={`fg-rain-${i}`}
                  x1={pos.x}
                  y2="17"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth={Math.random() * 0.8 + 0.8}
                  strokeLinecap="round"
                  className="rain-drop rain-drop-fg"
                  style={{
                    animationDuration: `${pos.duration}s`,
                    animationDelay: `${pos.delay}s`,
                    opacity: pos.opacity,
                  }}
                />
              ))}
            </svg>
          </div>
        )}
        {!isLoading && weatherCondition === "cloudy" && (
          <div className="cloud-effect">
            <svg className="cloud cloud-1" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
            <svg className="cloud cloud-2" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
            <svg className="cloud cloud-3" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
            <svg className="cloud cloud-4" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
            <svg className="cloud cloud-left-side" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
            <svg className="cloud cloud-right-side" viewBox="0 0 64 64">
              <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
            </svg>
          </div>
        )}
        {!isLoading && weatherCondition === "sunny" && timeOfDay === "morning" && (
          <div className="sunny-effect">
            <div className="sun-ray ray-1" />
            <div className="sun-ray ray-2" />
            <div className="sun-ray ray-3" />
            <div className="lens-flare" />
            <div className="particle particle-1" />
            <div className="particle particle-2" />
            <div className="particle particle-3" />
            <div className="particle particle-4" />
          </div>
        )}
        {!isLoading && timeOfDay === "night" && (
          <div className="night-effect">
            <div className="star star-1" />
            <div className="star star-2" />
            <div className="star star-3" />
            <div className="star star-4" />
            <div className="star star-5" />
            <div className="moon" />
          </div>
        )}

        {/* Weather Outlook */}
        {localWeather?.outlook && (
          <div className={`weather-outlook ${getTextBoxClass()}`}>
            <Flex direction="column" align="center" gap="2">
              <Heading size="6" className="outlook-title" align="center">
                Weather Outlook
              </Heading>
              <Text size="3" className="description" align="center">
                A summary of the general weather conditions expected in Hong Kong.<br />
              </Text>
              <Text size="5" className="outlook-text" align="center">
                {localWeather.outlook}
              </Text>
            </Flex>
          </div>
        )}

        {/* District Selector */}
        <div className={`district-selector-container ${getTextBoxClass()}`}>
          <Flex direction="column" align="center" gap="2">
            <Heading size="7" className="district-selector-title" align="center">
              Select Your District
            </Heading>
            <Text size="3" className="description" align="center">
              Choose a district to view its current weather conditions and forecasts.
            </Text>
            <Tooltip content="Select a district to see its weather data">
              <Flex align="center" justify="center" gap="4" className="district-selector">
                <Text size="4" className="selector-label">District:</Text>
                <Select.Root
                  value={selectedDistrict}
                  onValueChange={(value) => setSelectedDistrict(value)}
                  defaultValue="Hong Kong Observatory"
                >
                  <Select.Trigger className="selector-trigger" />
                  <Select.Content className="selector-content">
                    {districts.map((district) => (
                      <Select.Item key={district} value={district} className="selector-item">
                        {district}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            </Tooltip>
          </Flex>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Callout.Root className="weather-alert" color="red">
            <Callout.Icon>
              <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
            </Callout.Icon>
            <Callout.Text>
              <Flex direction="column" gap="1">
                <Text size="4" weight="bold" className="text-red-800">
                  Active Weather Warnings
                </Text>
                <Text size="3" className="text-red-700">
                  {warnings.map((w) => w.name).join(", ")}
                </Text>
              </Flex>
            </Callout.Text>
          </Callout.Root>
        )}

        {/* Main Content: Two Columns */}
        <Flex direction={{ initial: "column", md: "row" }} gap="4" justify="center">
          {/* Left Column: Weather Card */}
          <div className="weather-current left-column">
            <Heading size="5" className="weather-card-title">
              Current Weather
            </Heading>
            <Text size="3" className="description2">
              Detailed weather information for your selected district.
            </Text>
            {isLoading ? (
              <Text size="5" className="loading-text">
                Loading Weather Data...
              </Text>
            ) : temperatureData && localWeather ? (
              <WeatherCard
                temperatureData={{
                  ...temperatureData,
                  recordTime: formatRecordTime(temperatureData.recordTime), // Use formatted time
                }}
                warnings={warnings}
                localWeather={{
                  generalSituation: localWeather.generalSituation,
                  updateTime: new Date(localWeather.updateTime).toLocaleString("en-US", {
                    timeZone: "Asia/Hong_Kong",
                  }),
                }}
                isCelsius={isCelsius}
                toggleUnit={toggleUnit}
              />
            ) : (
              <Text size="5" className="error-text">
                Unable to load weather data
              </Text>
            )}
          </div>

          {/* Right Column: Quick Stats */}
          <Flex direction="column" gap="2" className="quick-stats right-column">
            <Heading size="5" className="quick-stats-title">
              Quick Stats
            </Heading>
            <Text size="3" className="description2">
              At-a-glance weather metrics for the selected district.
            </Text>
            <div className="stat-card">
              <Flex gap="2" align="center">
                <Thermometer className="stat-icon" />
                <Text size="3" weight="bold">Current Temp</Text>
              </Flex>
              <Text size="5">{temperatureData ? avgTemp.toFixed(1) : "N/A"}{isCelsius ? "°C" : "°F"}</Text>
            </div>
            <div className="stat-card">
              <Flex gap="2" align="center">
                <Umbrella className="stat-icon" />
                <Text size="3" weight="bold">Avg Rain Chance</Text>
              </Flex>
              <Text size="5">{avgRainProb.toFixed(0)}%</Text>
            </div>
            <div className="stat-card">
              <Flex gap="2" align="center">
                <Droplet className="stat-icon" />
                <Text size="3" weight="bold">Avg Humidity</Text>
              </Flex>
              <Text size="5">{avgHumidity.toFixed(0)}%</Text>
            </div>
          </Flex>
        </Flex>

        {/* Temperature and Rain Chart */}
        {forecast.length > 0 && (
          <Tooltip content="View temperature trends and rain probability for the next 9 days">
            <div className="forecast-chart">
              <Heading size="6" className="chart-title">
                Temperature and Rain Probability
              </Heading>
              <Text size="3" className="description">
                A 9-day forecast showing temperature trends and rain probability.
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <XAxis dataKey="date" stroke="#1e40af" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="temp"
                    domain={isCelsius ? [15, 35] : [59, 95]}
                    unit={isCelsius ? "°C" : "°F"}
                    stroke="#1e40af"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="rain"
                    orientation="right"
                    domain={[0, 100]}
                    unit="%"
                    stroke="#10b981"
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip
                    formatter={(value: number, name: string) =>
                      name.includes("Temp") ? `${value.toFixed(1)}${isCelsius ? "°C" : "°F"}` : `${value}%`
                    }
                    contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "8px", border: "none" }}
                  />
                  <Legend />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="maxTemp"
                    name="Max Temperature"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#3b82f6" }}
                  />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="minTemp"
                    name="Min Temperature"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#f97316" }}
                  />
                  <Bar yAxisId="rain" dataKey="rainProbability" name="Rain Probability" fill="#10b981" opacity={0.4} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Tooltip>
        )}

        {/* Forecast Link */}
        <Button asChild className="forecast-button">
          <Link href="/forecast">View Full Forecast</Link>
        </Button>
      </Flex>
    </div>
  );
}