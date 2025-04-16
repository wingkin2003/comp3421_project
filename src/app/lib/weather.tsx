export interface WeatherData {
    temperature: number;
    humidity: number;
    condition: string;
    updateTime: string;
    rainfall?: number;
    uvIndex?: number;
    windSpeed?: number;
}

export interface WeatherHistory {
    date: string;
    temperature: number;
    rainfall: number;
    condition: string;
    uvIndex?: number;
    windSpeed?: number;
}

export async function getHongKongWeather(): Promise<WeatherData | null> {
    try {
        const res = await fetch(
            "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en",
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        const data = await res.json();
        const weather = data.temperature.data.find((d: any) => d.place === "Hong Kong Observatory");
        const humidity = data.humidity.data[0];
        const rainfall = data.rainfall.data.find((d: any) => d.place === "Hong Kong Observatory");
        const uv = data.uvindex?.data?.[0]?.value;
        const wind = data.wind.data.find((d: any) => d.station === "King's Park");

        return {
            temperature: weather.value,
            humidity: humidity.value,
            condition: data.icon[0] >= 80 ? "Rainy" : data.icon[0] >= 60 ? "Cloudy" : "Sunny",
            updateTime: data.updateTime,
            rainfall: rainfall?.value ?? 0,
            uvIndex: uv ?? undefined,
            windSpeed: wind?.speed ?? undefined,
        };
    } catch {
        return null;
    }
}

export async function getLast7DaysWeather(): Promise<WeatherHistory[]> {
    try {
        const res = await fetch(
            "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en",
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.weatherForecast.slice(0, 7).map((day: any) => ({
            date: day.forecastDate,
            temperature: (day.forecastMintemp.value + day.forecastMaxtemp.value) / 2,
            rainfall: 0, // API doesn't provide historical rainfall
            condition: day.PSR.includes("LOW") ? "Sunny" : day.PSR.includes("HIGH") ? "Rainy" : "Cloudy",
            uvIndex: undefined, // API doesn't provide UV for forecast
            windSpeed: undefined, // API doesn't provide wind for forecast
        }));
    } catch {
        return [];
    }
}

export async function getTodayLast8Hours(): Promise<WeatherHistory[]> {
    try {
        const res = await fetch(
            "https://data.weather.gov.hk/weatherAPI/opendata/hourly.php?dataType=temp&lang=en",
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const data = await res.json();
        const hours = data.temperature.data
            .filter((d: any) => d.place === "Hong Kong Observatory")
            .slice(-8)
            .map((d: any, i: number) => ({
                date: new Date(Date.now() - (7 - i) * 3600000).toISOString(),
                temperature: d.value,
                rainfall: 0, // No hourly rainfall
                condition: "Cloudy", // No hourly condition
                uvIndex: undefined,
                windSpeed: undefined,
            }));
        return hours.length ? hours : [];
    } catch {
        return [];
    }
}

export async function getNext8HoursForecast(): Promise<WeatherHistory[]> {
    try {
        const res = await fetch(
            "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=en",
            { cache: "no-store" }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return new Array(8).fill(null).map((_, i) => ({
            date: new Date(Date.now() + i * 3600000).toISOString(),
            temperature: data.forecastWeather.temperature.value,
            rainfall: 0, // No hourly rainfall
            condition: data.forecastWeather.PSR.includes("LOW") ? "Sunny" : data.forecastWeather.PSR.includes("HIGH") ? "Rainy" : "Cloudy",
            uvIndex: undefined,
            windSpeed: undefined,
        }));
    } catch {
        return [];
    }
}