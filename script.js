
const cityInput = document.getElementById("city");
const provinceInput = document.getElementById("province");
const countryInput = document.getElementById("country");

const getWeatherButton = document.getElementById("getWeather");

const errorMessage = document.getElementById("errorMessage");
const weatherResult = document.getElementById("weatherResult");

const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const feelsLikeElement = document.getElementById("feelsLike");
const windSpeedElement = document.getElementById("windSpeed");
const humidityElement = document.getElementById("humidity");

async function getCoordinates(city, province, country) {

    const encodedCity = encodeURIComponent(city);

    const geocodingURL =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodedCity}&count=20&language=en&format=json`;

    const response = await fetch(geocodingURL);

    if (!response.ok) {
        throw new Error("Unable to retrieve location information.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Location not found. Please check your information.");
    }

    const matchingLocation = data.results.find(location => {

        const cityMatches =
            location.name.toLowerCase() === city.toLowerCase();

        const provinceMatches =
            location.admin1 &&
            location.admin1.toLowerCase() === province.toLowerCase();

        const countryMatches =
            location.country &&
            location.country.toLowerCase() === country.toLowerCase();

        return cityMatches && provinceMatches && countryMatches;
    });

    if (!matchingLocation) {
        throw new Error(
            "The requested city, province/state, and country could not be found."
        );
    }

    return {
        latitude: matchingLocation.latitude,
        longitude: matchingLocation.longitude
    };
}

async function getWeather(latitude, longitude) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,relative_humidity_2m&temperature_unit=celsius&wind_speed_unit=kmh`;

    const response = await fetch(weatherURL);

    if (!response.ok) {
        throw new Error("Unable to retrieve weather information.");
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("Current weather information is unavailable.");
    }

    return data.current;
}

function displayWeather(weather, city, province, country) {

    locationElement.textContent =
        `${city}, ${province}, ${country}`;

    temperatureElement.textContent =
        `${weather.temperature_2m} °C`;

    feelsLikeElement.textContent =
        `${weather.apparent_temperature} °C`;

    windSpeedElement.textContent =
        `${weather.wind_speed_10m} km/h`;

    humidityElement.textContent =
        `${weather.relative_humidity_2m} %`;

    weatherResult.style.display = "block";
}

function displayError(message) {

    errorMessage.textContent = message;

    weatherResult.style.display = "none";
}

getWeatherButton.addEventListener("click", async function() {

    const city = cityInput.value.trim();
    const province = provinceInput.value.trim();
    const country = countryInput.value.trim();

    errorMessage.textContent = "";

    if (!city || !province || !country) {

        displayError("Please fill in all three fields.");

        return;
    }

    getWeatherButton.disabled = true;
    getWeatherButton.textContent = "Loading...";

    weatherResult.style.display = "none";

    try {

        const coordinates = await getCoordinates(
            city,
            province,
            country
        );

        const weather = await getWeather(
            coordinates.latitude,
            coordinates.longitude
        );

        displayWeather(weather, city, province, country);

    } catch (error) {

        displayError(error.message);

    } finally {

        getWeatherButton.disabled = false;
        getWeatherButton.textContent = "Get Weather";

    }

});
