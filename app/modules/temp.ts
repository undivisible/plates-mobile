import { Http } from "@nativescript/core";
import * as Geolocation from "@nativescript/geolocation";

interface WeatherResponse {
    current_weather?: {
        temperature: number;
    };
}

export async function getTemperature(): Promise<string | undefined> {
    try {
        // Check for location permissions first
        const hasPermission = await Geolocation.hasLocationPermission();
        if (!hasPermission) {
            const granted = await Geolocation.requestLocationPermission();
            if (!granted) {
                throw new Error("Location permission denied");
            }
        }

        // Enable location services if needed
        const isEnabled = await Geolocation.isEnabled();
        if (!isEnabled) {
            await Geolocation.enableLocationRequest();
        }

        const location = await Geolocation.getCurrentLocation({
            desiredAccuracy: 3,
            updateDistance: 10,
            maximumAge: 5000,
            timeout: 20000
        });

        if (!location) {
            throw new Error("Could not retrieve location");
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true`;
        const response = await Http.request({
            url,
            method: "GET",
        });

        const data = response.content.toJSON() as WeatherResponse;
        if (data?.current_weather?.temperature !== undefined) {
            return `Temperature: ${data.current_weather.temperature}°C`;
        } else {
            throw new Error("Invalid response from API");
        }
    } catch (error) {
        console.error("Error fetching temperature:", error);
        return error instanceof Error ? error.message : "Failed to get temperature";
    }
}
