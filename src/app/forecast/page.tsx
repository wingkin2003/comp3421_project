"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Button, Flex, Select, Alert } from "@radix-ui/themes";
import { AlertTriangle, Sun, CloudRain } from "lucide-react";
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
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function WeatherPage({ isCelsius, toggleUnit }: { isCelsius: boolean; toggleUnit: () => void }) {
    const [temperatureData, setTemperatureData] = useState<RegionalTemperature | null>(null);
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [localWeather, setLocalWeather] = useState<LocalWeather | null>(null);
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState<string>("Hong Kong Observatory");
    const [isLoading, setIsLoading] = useState(false);
    const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "cloudy" | "default">("default");
    const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "night">("morning");

    const fetchData = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const [temps, warnings, local, forecastData] = await Promise.all([
                getRegionalTemperatures(),
                getCurrentWarnings(),
                getLocalWeatherReport(),
                getWeatherForecast(),
            ]);
            setDistricts(temps.map((t) => t.place));
            setTemperatureData(temps.find((t) => t.place === selectedDistrict) || temps[0]);
            setWarnings(warnings);
            setLocalWeather(local);
            setForecast(forecastData);

            // Determine weather condition
            let condition: "sunny" | "rainy" | "cloudy" | "default" = "default";
            if (warnings.length > 0 && warnings.some((w) => w.name.toLowerCase().includes("rain"))) {
                condition = "rainy";
            } else if (local?.generalSituation) {
                const situation = local.generalSituation.toLowerCase();
                if (situation.includes("sunny")) condition = "sunny";
                else if (situation.includes("cloudy")) condition = "cloudy";
                else if (situation.includes("rain") || situation.includes("shower")) condition = "rainy";
            }
            setWeatherCondition(condition);

            // Determine time of day
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
        fetchData();
    }, [selectedDistrict]);

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

    // Prepare chart data
    const chartData = forecast.map((day) => {
        const date = new Date(
            parseInt(day.date.slice(0, 4)),
            parseInt(day.date.slice(4, 6)) - 1,
            parseInt(day.date.slice(6, 8))
        );
        return {
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            maxTemp: isCelsius ? day.maxTemp : (day.maxTemp * 9) / 5 + 32,
            minTemp: isCelsius ? day.minTemp : (day.minTemp * 9) / 5 + 32,
            rainProbability: parseInt(day.rainProbability.replace("%", "")) || 0,
        };
    });

    return (
        <div className={`weather-page ${getBackgroundClass()}`}>
            {/* Cloud Logo */}
            <div className="cloud-logo">
                <svg viewBox="0 0 100 60" className="cloud-logo-svg">
                    <path className="cloud-base" d="M80 30a20 20 0 0 0-40 0 15 15 0 0 0-10 28h60a15 15 0 0 0-10-28z" />
                    <path className="cloud-puff-1" d="M50 25a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z" />
                    <path className="cloud-puff-2" d="M65 28a7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7z" />
                </svg>
            </div>

            {/* Weather Effects */}
            {weatherCondition === "rainy" && (
                <div className="rain-effect">
                    <svg className="w-full h-full">
                        {[...Array(60)].map((_, i) => (
                            <line
                                key={i}
                                x1={`${Math.random() * 100}%`}
                                y1="0"
                                x2={`${Math.random() * 100}%`}
                                y2="15"
                                stroke="rgba(59, 130, 246, 0.8)"
                                strokeWidth={Math.random() * 1.5 + 1}
                                className="rain-drop"
                                style={{ animationDelay: `${Math.random() * 0.6}s` }}
                            />
                        ))}
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill="url(#lightning)"
                            className="lightning-flash"
                        />
                    </svg>
                    <svg>
                        <defs>
                            <filter id="lightning">
                                <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
                                <feColorMatrix type="saturate" values="0" />
                                <feBlend in="SourceGraphic" in2="noise" mode="screen" />
                            </filter>
                        </defs>
                    </svg>
                </div>
            )}
            {weatherCondition === "cloudy" && (
                <div className="cloud-effect">
                    <svg className="cloud cloud-1" viewBox="0 0 64 64"><path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" /></svg>
                    <svg className="cloud cloud-2" viewBox="0 0 64 64"><path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" /></svg>
                    <svg className="cloud cloud-3" viewBox="0 0 64 64"><path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" /></svg>
                    <svg className="cloud cloud-4" viewBox="0 0 64 64"><path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" /></svg>
                </div>
            )}
            {weatherCondition === "sunny" && timeOfDay === "morning" && (
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
            {timeOfDay === "night" && (
                <div className="night-effect">
                    <div className="star star-1" />
                    <div className="star star-2" />
                    <div className="star star-3" />
                    <div className="star star-4" />
                    <div className="star star-5" />
                    <div className="moon" />
                </div>
            )}

            <Flex direction="column" gap="8" p={{ initial: "4", md: "8" }} align="center" className="weather-container">
                {/* Weather Icon */}
                {getWeatherIcon() && (
                    <div className="weather-icon-container">
                        {getWeatherIcon()}
                    </div>
                )}

                {/* District Selector */}
                <div className="district-selector-container">
                    <Heading size="5" className="district-selector-title">
                        Select Your District
                    </Heading>
                    <Text size="3" className="district-selector-description">
                        Choose a district to view its current weather conditions.
                    </Text>
                    <Flex align="center" gap="4" className="district-selector">
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
                </div>

                {/* Warnings */}
                {warnings.length > 0 && (
                    <Alert className="weather-alert">
                        <Flex gap="3" align="center" p="4">
                            <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                            <Flex direction="column" gap="1">
                                <Text size="4" weight="bold" className="text-red-800">
                                    Active Weather Warnings
                                </Text>
                                <Text size="3" className="text-red-700">
                                    {warnings.map((w) => w.name).join(", ")}
                                </Text>
                            </Flex>
                        </Flex>
                    </Alert>
                )}

                {/* Current Weather */}
                <div className="weather-current">
                    {isLoading ? (
                        <Text size="5" className="loading-text">
                            Loading Weather Data...
                        </Text>
                    ) : temperatureData && localWeather ? (
                        <WeatherCard
                            temperatureData={{
                                ...temperatureData,
                                recordTime: new Date(temperatureData.recordTime).toLocaleString("en-US"),
                            }}
                            warnings={warnings}
                            localWeather={{
                                generalSituation: localWeather.generalSituation,
                                updateTime: new Date(localWeather.updateTime).toLocaleString("en-US"),
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

                {/* Temperature and Rain Chart */}
                {forecast.length > 0 && (
                    <div className="forecast-chart">
                        <Heading size="6" className="chart-title">
                            Temperature and Rain Probability
                        </Heading>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={chartData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="temp"
                                    domain={isCelsius ? [15, 35] : [60, 95]}
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
                                <Tooltip
                                    formatter={(value: number, name: string) =>
                                        name.includes("Temp")
                                            ? `${value.toFixed(1)}${isCelsius ? "°C" : "°F"}`
                                            : `${value}%`
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
                                <Bar
                                    yAxisId="rain"
                                    dataKey="rainProbability"
                                    name="Rain Probability"
                                    fill="#10b981"
                                    opacity={0.4}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Forecast Link */}
                <Button asChild className="forecast-button">
                    <Link href="/forecast">View Full Forecast</Link>
                </Button>

                {/* Weather Outlook */}
                {localWeather?.outlook && (
                    <div className="weather-outlook">
                        <Heading size="6" className="outlook-title">
                            Weather Outlook
                        </Heading>
                        <Text size="4" className="outlook-text">
                            {localWeather.outlook}
                        </Text>
                    </div>
                )}
            </Flex>
        </div>
    );
}