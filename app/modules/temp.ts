import { Http } from "@nativescript/core";
import * as Geolocation from "@nativescript/geolocation";

export async function getTemperature(): Promise<string> {
    try {
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

        // @ts-ignore
      const data = response.content.toJSON();
        if (data && data.current_weather) {
            return `Temperature: ${data.current_weather.temperature}°C`;
        } else {
            throw new Error("Invalid response from API");
        }
    } catch (error) {
        console.error("Error fetching temperature:", error);
        return "Failed to get temperature";
    }
}
