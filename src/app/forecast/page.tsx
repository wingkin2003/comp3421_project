"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Flex, Table, ScrollArea } from "@radix-ui/themes";
import { Thermometer, Umbrella, Droplet } from "lucide-react";
import { getWeatherForecast, ForecastDay } from "@/app/lib/weather";
import {
    ComposedChart,
    Line,
    Bar,
    AreaChart,
    Area,
    BarChart,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// Function to generate random probability within the interval for each PSR category
const getRandomProbability = (psr: string): number => {
    switch (psr) {
        case 'High':
            return Math.random() * (100 - 80) + 80; // Random between 80 and 100
        case 'Medium High':
            return Math.random() * (80 - 60) + 60; // Random between 60 and 80
        case 'Medium':
            return Math.random() * (60 - 40) + 40; // Random between 40 and 60
        case 'Medium Low':
            return Math.random() * (40 - 20) + 20; // Random between 20 and 40
        case 'Low':
            return Math.random() * (20 - 0) + 0; // Random between 0 and 20
        default:
            return 0; // Fallback for unrecognized PSR values
    }
};

const ForecastCard = ({ day }: { day: ForecastDay }) => {
    const displayMaxTemp = day.maxTemp;
    const displayMinTemp = day.minTemp;
    const condition = day.weather.toLowerCase().includes("sunny")
        ? "sunny"
        : day.weather.toLowerCase().includes("cloudy")
            ? "cloudy"
            : day.weather.toLowerCase().includes("rain") || day.weather.toLowerCase().includes("shower")
                ? "rainy"
                : day.weather.toLowerCase().includes("wind")
                    ? "windy"
                    : "humid";
    const date = new Date(
        parseInt(day.date.slice(0, 4)),
        parseInt(day.date.slice(4, 6)) - 1,
        parseInt(day.date.slice(6, 8))
    );

    const getConditionLogo = () => {
        switch (condition) {
            case "sunny":
                return (
                    <svg className="condition-logo sunny-logo" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                );
            case "rainy":
                return (
                    <svg className="condition-logo rainy-logo" viewBox="0 0 24 24">
                        <path d="M7 12a5 5 0 0 1 10 0 4 4 0 0 1-2 3.46L13 20l-2-2 2-2.54A4 4 0 0 1 9 12a4 4 0 0 1-2-3.46L5 13l-2 2 2 2.54A4 4 0 0 1 7 12z" fill="#3b82f6" />
                    </svg>
                );
            case "cloudy":
                return (
                    <svg className="condition-logo cloudy-logo" viewBox="0 0 24 24">
                        <path d="M18 10a6 6 0 0 0-12 0 4 4 0 0 0-2 8h14a4 4 0 0 0-2-8z" fill="#6b7280" />
                        <path d="M10 8a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z" fill="#9ca3af" />
                    </svg>
                );
            case "windy":
                return (
                    <svg className="condition-logo windy-logo" viewBox="0 0 24 24">
                        <path d="M4 12h10a3 3 0 0 1 0 6h-4M6 6h12a3 3 0 0 0 0-6h-4" stroke="#10b981" strokeWidth="2" fill="none" />
                    </svg>
                );
            case "humid":
                return (
                    <svg className="condition-logo humid-logo" viewBox="0 0 24 24">
                        <path d="M12 2c-4 8-8 10-8 14a8 8 0 0 0 16 0c0-4-4-6-8-14z" fill="#60a5fa" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="forecast-card">
            <Flex direction="column" gap="2" align="center">
                <Text size="3" weight="bold" className="text-blue-900">
                    {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </Text>
                <div className="condition-logo-container">{getConditionLogo()}</div>
                <Text size="3" className="text-gray-700 capitalize condition-text">{condition}</Text>
                <Text size="4" className="text-blue-800">
                    {displayMaxTemp.toFixed(1)}/{displayMinTemp.toFixed(1)}°C
                </Text>
                <Text size="2" className="text-gray-600">Rain: {day.rainProbability}</Text>
                <Text size="2" className="text-gray-600">Humidity: {day.minRh}% - {day.maxRh}%</Text>
            </Flex>
        </div>
    );
};

export default function ForecastPage() {
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [weatherCondition, setWeatherCondition] = useState<"sunny" | "rainy" | "cloudy" | "default">("default");
    const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "night">("morning");
    const [raindropPositions, setRaindropPositions] = useState<{
        background: Array<{ x: number; duration: number; delay: number; opacity: number }>;
        foreground: Array<{ x: number; duration: number; delay: number; opacity: number }>;
    }>({ background: [], foreground: [] });

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
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getWeatherForecast();
                setForecast(data);

                // Determine weather condition (based on first day's weather)
                const firstDay = data[0]?.weather.toLowerCase();
                let condition: "sunny" | "rainy" | "cloudy" | "default" = "default";
                if (firstDay?.includes("sunny")) condition = "sunny";
                else if (firstDay?.includes("cloudy")) condition = "cloudy";
                else if (firstDay?.includes("rain") || firstDay?.includes("shower")) condition = "rainy";
                setWeatherCondition(condition);

                // Determine time of day
                const hour = new Date().getHours();
                const time = hour >= 6 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "night";
                setTimeOfDay(time);
            } catch (error) {
                console.error("Error fetching forecast data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Prepare chart data (fixed to Celsius)
    const chartData = forecast.map((day) => {
        const date = new Date(
            parseInt(day.date.slice(0, 4)),
            parseInt(day.date.slice(4, 6)) - 1,
            parseInt(day.date.slice(6, 8))
        );
        return {
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            maxTemp: day.maxTemp,
            minTemp: day.minTemp,
            rainProbability: getRandomProbability(day.rainProbability), // Convert PSR to random number in interval
            minRh: day.minRh,
            maxRh: day.maxRh,
        };
    });

    // Summary metrics
    const avgMaxTemp = chartData.length ? chartData.reduce((sum, d) => sum + d.maxTemp, 0) / chartData.length : 0;
    const avgMinTemp = chartData.length ? chartData.reduce((sum, d) => sum + d.minTemp, 0) / chartData.length : 0;
    const totalRainProb = chartData.length ? chartData.reduce((sum, d) => sum + d.rainProbability, 0) : 0;
    const highRainDays = chartData.filter((d) => d.rainProbability > 70).length;

    const getBackgroundClass = () => {
        if (weatherCondition === "sunny" && timeOfDay === "morning") return "bg-forecast bg-sunny-morning";
        if (weatherCondition === "rainy") return "bg-forecast bg-rainy";
        if (weatherCondition === "cloudy") return "bg-forecast bg-cloudy";
        if (timeOfDay === "night") return "bg-forecast bg-night";
        return "bg-forecast";
    };

    return (
        <div className={`forecast-page ${getBackgroundClass()}`}>
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
                                y1="10"
                                x2={pos.x}
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
            {weatherCondition === "cloudy" && (
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

            <Flex direction="column" gap="8" p={{ initial: "4", md: "8" }} align="center" className="forecast-container">
                {/* Forecast Header */}
                <div className="text-box">
                    <Heading size="8" className="forecast-title">
                        9-Day Weather Forecast
                    </Heading>
                    <Text size="4" className="description2">
                        Detailed weather predictions for Hong Kong over the next 9 days.
                    </Text>
                </div>

                {/* Temperature and Rain Chart */}
                {forecast.length > 0 && (
                    <div className="forecast-chart">
                        <Heading size="6" className="chart-title">
                            Temperature and Rain Probability
                        </Heading>
                        <Text size="3" className="description">
                            A 9-day forecast showing temperature trends and rain probability.
                        </Text>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={chartData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="temp"
                                    domain={[15, 35]}
                                    unit="°C"
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
                                        name.includes("Temp")
                                            ? `${value.toFixed(1)}°C`
                                            : `${value.toFixed(0)}%`
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

                {/* Humidity Chart */}
                {forecast.length > 0 && (
                    <div className="forecast-chart">
                        <Heading size="6" className="chart-title">
                            Humidity Forecast
                        </Heading>
                        <Text size="3" className="description">
                            A 9-day forecast showing humidity trends.
                        </Text>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={chartData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    unit="%"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    formatter={(value: number) => `${value}%`}
                                    contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "8px", border: "none" }}
                                />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="minRh"
                                    name="Min Humidity"
                                    stroke="#60a5fa"
                                    fill="#60a5fa"
                                    opacity={0.3}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="maxRh"
                                    name="Max Humidity"
                                    stroke="#2563eb"
                                    fill="#2563eb"
                                    opacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Rain Probability Chart */}
                {forecast.length > 0 && (
                    <div className="forecast-chart">
                        <Heading size="6" className="chart-title">
                            Rain Probability Forecast
                        </Heading>
                        <Text size="3" className="description">
                            A 9-day forecast showing rain probability trends.
                        </Text>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    unit="%"
                                    stroke="#1e40af"
                                    tick={{ fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    formatter={(value: number) => `${value.toFixed(0)}%`}
                                    contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "8px", border: "none" }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="rainProbability"
                                    name="Rain Probability"
                                    fill="#10b981"
                                    opacity={0.6}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Forecast Carousel */}
                {forecast.length > 0 && (
                    <div className="forecast-carousel">
                        <Heading size="6" className="chart-title">
                            Daily Forecast
                        </Heading>
                        <Text size="3" className="description">
                            Scroll through the daily weather predictions.
                        </Text>
                        <ScrollArea scrollbars="horizontal">
                            <Flex gap="4" style={{ overflowX: "auto", padding: "16px" }}>
                                {forecast.map((day, index) => (
                                    <ForecastCard key={index} day={day} />
                                ))}
                            </Flex>
                        </ScrollArea>
                    </div>
                )}

                {/* Forecast Summary */}
                {forecast.length > 0 && (
                    <div className="forecast-summary">
                        <Heading size="6" className="summary-title">
                            Forecast Summary
                        </Heading>
                        <Text size="3" className="description">
                            Key weather metrics for the next 9 days.
                        </Text>
                        <Table.Root className="summary-table">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>Metric</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row className="summary-row temp-row">
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <Thermometer className="summary-icon" />
                                            <Text>Average Max Temp</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{avgMaxTemp.toFixed(1)}°C</Table.Cell>
                                </Table.Row>
                                <Table.Row className="summary-row temp-row">
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <Thermometer className="summary-icon" />
                                            <Text>Average Min Temp</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{avgMinTemp.toFixed(1)}°C</Table.Cell>
                                </Table.Row>
                                <Table.Row className="summary-row rain-row">
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <Umbrella className="summary-icon" />
                                            <Text>Total Rain Probability</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{totalRainProb.toFixed(0)}%</Table.Cell>
                                </Table.Row>
                                <Table.Row className="summary-row rain-row">
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <Umbrella className="summary-icon" />
                                            <Text>High Rain Days ({">"}70%)</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{highRainDays} days</Table.Cell>
                                </Table.Row>
                                <Table.Row className="summary-row">
                                    <Table.Cell>
                                        <Flex gap="2" align="center">
                                            <Droplet className="summary-icon" />
                                            <Text>Average Humidity</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {(chartData.reduce((sum, d) => sum + (d.minRh + d.maxRh) / 2, 0) / chartData.length).toFixed(0)}%
                                    </Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table.Root>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <Text size="5" className="loading-text">
                        Loading Forecast Data...
                    </Text>
                )}
            </Flex>
        </div>
    );
}