import { Card, Text, Heading, Flex, IconButton } from "@radix-ui/themes";
import { Sun, Cloud, CloudRain, Droplets } from "lucide-react";
import { JSX } from "react";

interface WeatherCardProps {
    temperature: number;
    humidity: number;
    condition: string;
    updateTime: string;
    rainfall?: number;
    uvIndex?: number;
    windSpeed?: number;
    isCelsius: boolean;
    toggleUnit: () => void;
}

const conditionIcons: Record<string, JSX.Element> = {
    Sunny: <Sun className="w-12 h-12 text-yellow-400 animate-pulse" />,
    Cloudy: <Cloud className="w-12 h-12 text-gray-500" />,
    Rainy: <CloudRain className="w-12 h-12 text-blue-500 animate-bounce" />,
    Humid: <Droplets className="w-12 h-12 text-blue-300" />,
};

export default function WeatherCard({
    temperature,
    humidity,
    condition,
    updateTime,
    rainfall,
    uvIndex,
    windSpeed,
    isCelsius,
    toggleUnit,
}: WeatherCardProps) {
    const displayTemp = isCelsius ? temperature : (temperature * 9) / 5 + 32;
    const unit = isCelsius ? "°C" : "°F";

    return (
        <Card
            className="w-[28rem] bg-white/60 backdrop-blur-xl shadow-2xl hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-500 border border-blue-200/50 rounded-3xl relative overflow-hidden animate-slideUp"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/15 to-blue-500/15 hover:from-blue-300/25 hover:to-blue-500/25 transition-all duration-300" />
            <Flex direction="column" gap="4" p="6">
                <Flex align="center" gap="4">
                    {conditionIcons[condition] || <Cloud className="w-12 h-12 text-gray-500" />}
                    <Heading size="6" className="text-blue-900 drop-shadow-sm">{condition}</Heading>
                </Flex>
                <Text size="8" weight="bold" className="text-blue-800">
                    {displayTemp.toFixed(1)}{unit}
                </Text>
                <Text size="4" className="text-gray-800">Humidity: {humidity.toFixed(0)}%</Text>
                {rainfall !== undefined && (
                    <Text size="4" className="text-gray-800">Rainfall: {rainfall.toFixed(1)} mm</Text>
                )}
                {windSpeed !== undefined && (
                    <Text size="4" className="text-gray-800">Wind: {windSpeed.toFixed(1)} km/h</Text>
                )}
                <Text size="3" color="gray">
                    Updated: {new Date(updateTime).toLocaleString("en-US")}
                </Text>
                <IconButton
                    variant="soft"
                    className="mt-4 bg-blue-100/80 hover:bg-blue-200/80 transition-colors w-14 h-14 rounded-full shadow-md"
                    onClick={toggleUnit}
                    title={`Switch to ${isCelsius ? "Fahrenheit" : "Celsius"}`}
                >
                    <span className="text-xl font-semibold">{isCelsius ? "°F" : "°C"}</span>
                </IconButton>
            </Flex>
        </Card>
    );
}