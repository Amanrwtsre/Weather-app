
const searchButton = document.querySelector(".search-btn");
const cityInput = document.querySelector(".city-input");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentweatherCardsDiv = document.querySelector(".current-weather");
const locationButton = document.querySelector(".location-btn");

const API_KEY = "130f51e9d448809c668cb16b5d65c72a"; // API key for OpenWeatherMap API

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index == 0) {   // HTML for main weather card
        return `<div class="details">
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
            <h4>${weatherItem.weather[0].description}</h4>    
        </div>`;
    } else { // HTML for the other five day forecast cards
        return `<li class="card">
            <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
            <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
        </li>`;
    }
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;  
    
    console.log(`Fetching weather data for: ${cityName} (Lat: ${lat}, Lon: ${lon})`); // Log the city name and coordinates
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            console.log('Weather data:', data); // Log the weather data

            if (!data.list || data.list.length === 0) {
                throw new Error('No weather data found for the given coordinates.');
            }

            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Clear previous weather data
            cityInput.value = "";
            weatherCardsDiv.innerHTML = "";
            currentweatherCardsDiv.innerHTML = "";

            // Create weather cards and add them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentweatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                }
            });
        })
        .catch(error => {
            console.error('Error fetching weather details:', error);
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    console.log(`Fetching coordinates for city: ${cityName}`); // Log the city name
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            console.log('City coordinates data:', data); // Log the city coordinates data

            if (!data.length) throw new Error(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            console.error('Error fetching city coordinates:', error);
            alert("An error occurred while fetching the city coordinates!");
        });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            console.log(`User coordinates: Latitude: ${latitude}, Longitude: ${longitude}`); // Log the coordinates

            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            console.log(`Fetching city name for coordinates: Lat: ${latitude}, Lon: ${longitude}`); // Log the reverse geocoding request
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    console.log('Reverse geocoding data:', data); // Log the reverse geocoding data

                    if (!data.length) {
                        throw new Error("No location found for the given coordinates!");
                    }

                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(error => {
                    console.error('Error fetching city name:', error);
                    alert("An error occurred while fetching the city name!");
                });
        },
        error => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("An error occurred while fetching the location!");
            }
        },
        {
            enableHighAccuracy: true // Request high accuracy for geolocation
        }
    );
};

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);

