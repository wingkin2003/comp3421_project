import { Card, Text, Heading, Flex, IconButton, Badge } from "@radix-ui/themes";
import { Sun, Cloud, CloudRain, Droplets, CloudLightning, Flame, Snowflake } from "lucide-react";
import { JSX } from "react";
import { RegionalTemperature, Warning } from "@/app/lib/weather";

interface WeatherCardProps {
    temperatureData: RegionalTemperature;
    warnings: Warning[];
    localWeather: {
        generalSituation: string;
        updateTime: string;
    };
    isCelsius: boolean;
    toggleUnit: () => void;
}

const conditionIcons: Record<string, JSX.Element> = {
    Sunny: <Sun className="w-12 h-12 text-yellow-400 animate-pulse" />,
    Cloudy: <Cloud className="w-12 h-12 text-gray-500 animate-pulse-slow" />,
    Rainy: <CloudRain className="w-12 h-12 text-blue-500 animate-bounce" />,
    Humid: <Droplets className="w-12 h-12 text-blue-300 animate-drip" />,
    Showers: <CloudRain className="w-12 h-12 text-blue-500 animate-bounce" />,
    Thunderstorms: <CloudLightning className="w-12 h-12 text-purple-500 animate-pulse" />,
    "Very Hot": <Flame className="w-12 h-12 text-red-500 animate-pulse" />,
    Cold: <Snowflake className="w-12 h-12 text-blue-200 animate-pulse-slow" />,
    Default: <Cloud className="w-12 h-12 text-gray-500" />,
};

// Map API conditions or warnings to simplified conditions
const getCondition = (warnings: Warning[], generalSituation: string): string => {
    if (warnings.length > 0) {
        const warningName = warnings[0].name.toLowerCase();
        if (warningName.includes("rain")) return "Rainy";
        if (warningName.includes("hot")) return "Very Hot";
        if (warningName.includes("cold")) return "Cold";
        if (warningName.includes("thunderstorm")) return "Thunderstorms";
    }
    const situation = generalSituation.toLowerCase();
    if (situation.includes("sunny")) return "Sunny";
    if (situation.includes("cloudy")) return "Cloudy";
    if (situation.includes("shower") || situation.includes("rain")) return "Showers";
    if (situation.includes("humid")) return "Humid";
    return "Default";
};

export default function WeatherCard({
    temperatureData,
    warnings,
    localWeather,
    isCelsius,
    toggleUnit,
}: WeatherCardProps) {
    const { temperature, place, unit, recordTime } = temperatureData;
    const displayTemp = isCelsius ? temperature : (temperature * 9) / 5 + 32;
    const displayUnit = isCelsius ? "°C" : "°F";
    const condition = getCondition(warnings, localWeather.generalSituation);

    return (
        <Card
            className="w-[28rem] bg-white/60 backdrop-blur-xl shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] transition-all duration-500 border border-blue-200/50 rounded-3xl relative overflow-hidden animate-slideUp"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-blue-500/20 hover:from-blue-300/30 hover:to-blue-500/30 transition-all duration-300" />
            <Flex direction="column" gap="4" p="6">
                <Flex align="center" gap="4">
                    {conditionIcons[condition] || conditionIcons.Default}
                    <Heading size="6" className="text-blue-900 drop-shadow-sm">
                        {place} - {condition}
                    </Heading>
                </Flex>
                <Text size="8" weight="bold" className="text-blue-800">
                    {displayTemp.toFixed(1)}{displayUnit}
                </Text>
                <Text size="4" className="text-gray-800">
                    General: {localWeather.generalSituation.split('.')[0] || 'N/A'}
                </Text>
                {warnings.length > 0 && (
                    <Flex direction="column" gap="2">
                        <Text size="4" weight="bold" className="text-gray-800">
                            Active Warnings:
                        </Text>
                        {warnings.map((warning) => (
                            <Badge key={warning.code} color="red" className="self-start">
                                {warning.name}
                            </Badge>
                        ))}
                    </Flex>
                )}
                <Text size="3" color="gray">
                    Updated: {new Date(recordTime || localWeather.updateTime).toLocaleString("en-US")}
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