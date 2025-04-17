"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Flex, Table, ScrollArea } from "@radix-ui/themes";
import { getWeatherForecast, ForecastDay } from "@/app/lib/weather";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ForecastCard = ({ day, isCelsius }: { day: ForecastDay; isCelsius: boolean }) => {
    const displayMaxTemp = isCelsius ? day.maxTemp : (day.maxTemp * 9) / 5 + 32;
    const displayMinTemp = isCelsius ? day.minTemp : (day.minTemp * 9) / 5 + 32;
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
                    {displayMaxTemp.toFixed(1)}/{displayMinTemp.toFixed(1)}{isCelsius ? "°C" : "°F"}
                </Text>
                <Text size="2" className="text-gray-600">Rain: {day.rainProbability}</Text>
                <Text size="2" className="text-gray-600">Humidity: {day.minRh}% - {day.maxRh}%</Text>
            </Flex>
        </div>
    );
};

export default function ForecastPage({ isCelsius }: { isCelsius: boolean }) {
    const [forecast, setForecast] = useState<ForecastDay[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await getWeatherForecast();
                setForecast(data);
            } catch (error) {
                console.error("Error fetching forecast data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

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
            minRh: day.minRh,
            maxRh: day.maxRh,
        };
    });

    // Summary metrics
    const avgMaxTemp = chartData.length ? chartData.reduce((sum, d) => sum + d.maxTemp, 0) / chartData.length : 0;
    const avgMinTemp = chartData.length ? chartData.reduce((sum, d) => sum + d.minTemp, 0) / chartData.length : 0;
    const totalRainProb = chartData.length ? chartData.reduce((sum, d) => sum + d.rainProbability, 0) : 0;

    return (
        <div className="forecast-page">
            {/* Cloud Logo */}
            <div className="cloud-logo">
                <svg viewBox="0 0 100 60" className="cloud-logo-svg">
                    <path className="cloud-base" d="M80 30a20 20 0 0 0-40 0 15 15 0 0 0-10 28h60a15 15 0 0 0-10-28z" />
                    <path className="cloud-puff-1" d="M50 25a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z" />
                    <path className="cloud-puff-2" d="M65 28a7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7z" />
                </svg>
            </div>

            <Flex direction="column" gap="8" p={{ initial: "4", md: "8" }} align="center" className="forecast-container">
                <Heading size="8" className="forecast-title">
                    9-Day Weather Forecast
                </Heading>

                {isLoading ? (
                    <Text size="5" className="loading-text">
                        Loading Forecast Data...
                    </Text>
                ) : forecast.length > 0 ? (
                    <>
                        {/* Humidity Chart */}
                        <div className="forecast-chart">
                            <Heading size="6" className="chart-title">
                                Humidity Range
                            </Heading>
                            <ResponsiveContainer width="100%" height={300}>
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
                                    <Tooltip
                                        formatter={(value: number) => `${value}%`}
                                        contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "8px", border: "none" }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="maxRh"
                                        name="Max Humidity"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="minRh"
                                        name="Min Humidity"
                                        stroke="#60a5fa"
                                        fill="#60a5fa"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Rain Probability Bar Chart */}
                        <div className="forecast-chart">
                            <Heading size="6" className="chart-title">
                                Rain Probability Analysis
                            </Heading>
                            <ResponsiveContainer width="100%" height={300}>
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
                                    <Tooltip
                                        formatter={(value: number) => `${value}%`}
                                        contentStyle={{ backgroundColor: "#ffffffee", borderRadius: "8px", border: "none" }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="rainProbability"
                                        name="Rain Probability"
                                        fill="#10b981"
                                        fillOpacity={(d) => (d.rainProbability > 70 ? 0.8 : d.rainProbability > 30 ? 0.6 : 0.4)}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Forecast Carousel */}
                        <div className="forecast-carousel">
                            <Heading size="6" className="forecast-title">
                                Daily Forecast Overview
                            </Heading>
                            <ScrollArea className="w-full">
                                <Flex gap="4" className="pb-4" style={{ overflowX: "auto" }}>
                                    {forecast.map((day) => (
                                        <ForecastCard key={day.date} day={day} isCelsius={isCelsius} />
                                    ))}
                                </Flex>
                            </ScrollArea>
                        </div>

                        {/* Summary Table */}
                        <div className="forecast-summary">
                            <Heading size="6" className="summary-title">
                                Forecast Summary
                            </Heading>
                            <Table.Root className="summary-table">
                                <Table.Header>
                                    <Table.Row>
                                        <Table.ColumnHeaderCell>Metric</Table.ColumnHeaderCell>
                                        <Table.ColumnHeaderCell>Value</Table.ColumnHeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    <Table.Row>
                                        <Table.Cell>Average Max Temperature</Table.Cell>
                                        <Table.Cell>{avgMaxTemp.toFixed(1)}{isCelsius ? "°C" : "°F"}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell>Average Min Temperature</Table.Cell>
                                        <Table.Cell>{avgMinTemp.toFixed(1)}{isCelsius ? "°C" : "°F"}</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell>Total Rain Probability</Table.Cell>
                                        <Table.Cell>{totalRainProb.toFixed(0)}%</Table.Cell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.Cell>Days with High Rain (&gt;70%)</Table.Cell>
                                        <Table.Cell>{chartData.filter((d) => d.rainProbability > 70).length}</Table.Cell>
                                    </Table.Row>
                                </Table.Body>
                            </Table.Root>
                        </div>
                    </>
                ) : (
                    <Text size="5" className="error-text">
                        Unable to load forecast data
                    </Text>
                )}
            </Flex>
        </div>
    );
}