export interface ForecastDay {
    date: string;
    weekday: string;
    maxTemp: number;
    minTemp: number;
    weather: string;
    wind: string;
    maxRh: number;
    minRh: number;
    rainProbability: string;
}

export interface Warning {
    name: string;
    code: string;
    action: string;
    issueTime: string;
    updateTime: string;
}

export interface LocalWeather {
    generalSituation: string;
    forecastPeriod: string;
    forecastDescription: string;
    outlook: string;
    updateTime: string;
}

export interface RegionalTemperature {
    place: string;
    temperature: number;
    unit: string;
    recordTime: string;
}

export async function getWeatherForecast(): Promise<ForecastDay[]> {
    const url = `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch forecast');
        const data = await response.json();

        return data.weatherForecast.map((day: any) => ({
            date: day.forecastDate, // e.g., "20250416"
            weekday: day.week,
            maxTemp: day.forecastMaxtemp.value,
            minTemp: day.forecastMintemp.value,
            weather: day.forecastWeather,
            wind: day.forecastWind,
            maxRh: day.forecastMaxrh.value,
            minRh: day.forecastMinrh.value,
            rainProbability: day.PSR
        }));
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return [];
    }
}

export async function getCurrentWarnings(): Promise<Warning[]> {
    const url = `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch warnings');
        const data = await response.json();

        return Object.entries(data || {}).map(([code, details]: [string, any]) => ({
            name: details.name || 'Unknown Warning',
            code: details.code || code,
            action: details.actionCode || '',
            issueTime: details.issueTime || '',
            updateTime: details.updateTime || ''
        }));
    } catch (error) {
        console.error('Error fetching warnings:', error);
        return [];
    }
}

export async function getLocalWeatherReport(): Promise<LocalWeather | null> {
    const url = `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch local weather');
        const data = await response.json();

        return {
            generalSituation: data.generalSituation || 'No data available',
            forecastPeriod: data.forecastPeriod || '',
            forecastDescription: data.forecastDesc || '',
            outlook: data.outlook || 'No outlook available',
            updateTime: data.updateTime || ''
        };
    } catch (error) {
        console.error('Error fetching local weather:', error);
        return null;
    }
}

export async function getRegionalTemperatures(): Promise<RegionalTemperature[]> {
    const url = `https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch temperatures');
        const data = await response.json();

        return data.temperature.data.map((station: any) => ({
            place: station.place || 'Unknown',
            temperature: station.value || 0,
            unit: station.unit || 'C',
            recordTime: station.recordTime || ''
        }));
    } catch (error) {
        console.error('Error fetching temperatures:', error);
        return [];
    }
}