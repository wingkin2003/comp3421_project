"use client";

import { useState, useEffect } from "react";
import { Heading, Text, Flex, Table, ScrollArea } from "@radix-ui/themes";
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
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const ForecastCard = ({ day, isCelsius }: { day: ForecastDay; isCelsius: boolean }) => {
    const displayMaxTemp = isCelsius ? day.maxTemp : (day.maxTemp * 9) / 5 + 32;
    const displayMinTemp = isCelsius ? day.minTemp : (day.minTemp * 9) / 5 + 32;
    const condition = day.weather.toLowerCase().includes("sunny")
        ? "Sunny"
        : day.weather.toLowerCase().includes("cloudy")
            ? "Cloudy"
            : day.weather.toLowerCase().includes("rain") || day.weather.toLowerCase().includes("shower")
                ? "Rainy"
                : "Humid";
    const date = new Date(
        parseInt(day.date.slice(0, 4)),
        parseInt(day.date.slice(4, 6)) - 1,
        parseInt(day.date.slice(6, 8))
    );

    return (
        <div className="forecast-card">
            <Text size="3" weight="bold" className="text-blue-900">
                {date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </Text>
            <Text size="4" className="text-blue-800 mt-2">
                {displayMaxTemp.toFixed(1)}/{displayMinTemp.toFixed(1)}{isCelsius ? "°C" : "°F"}
            </Text>
            <Text size="3" className="text-gray-700 capitalize">{condition}</Text>
            <Text size="2" className="text-gray-600 mt-1">Rain: {day.rainProbability}</Text>
            <Text size="2" className="text-gray-600">Humidity: {day.minRh}% - {day.maxRh}%</Text>
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
                        {/* Temperature and Rain Chart */}
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