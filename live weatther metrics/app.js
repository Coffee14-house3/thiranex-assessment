// API Configuration
// API configuration for weatherapi.com
const API_KEY = '1b4f34dd60a9423eb02171639260207';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

const locationEl = document.getElementById('location');
const temperatureEl = document.getElementById('temperature');
const descriptionEl = document.getElementById('description');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

/**
 * Fetch weather data from the REST API asynchronously
 * @param {string} city 
 */
async function getWeatherData(city) {
    // Construct the URL for WeatherAPI.com
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

    try {
        // Show loading state / Clear previous states
        hideError();
        
        const response = await fetch(url);

        // Comprehensive Error Handling for failed HTTP status codes (e.g., 404, 500)
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 400 && errorData.error?.code === 1006) {
                throw new Error('City not found. Please check the spelling.');
            } else if (response.status === 401 || (response.status === 403 && errorData.error?.code === 2007)) {
                throw new Error('Invalid API key. Please verify your credentials.');
            } else {
                throw new Error(`Server returned status: ${response.status}`);
            }
        }

        // Parse JSON response data
        const data = await response.json();
        
        // Dynamically render the parsed nested data
        renderWeather(data);

    } catch (error) {
        // Handle network drops or thrown errors above
        console.error('Fetch operation failed:', error);
        displayError(error.message || 'An unexpected network error occurred.');
    }
}

/**
 * Parses the complex JSON payload and maps it to DOM elements
 * @param {Object} data - The JSON response from WeatherAPI.com
 */
function renderWeather(data) {
    // Destructuring nested properties from the JSON object
    const { location: { name, country }, current: { temp_c, humidity, wind_kph, condition, is_day } } = data;

    // Mutate DOM text contents
    locationEl.textContent = `${name}, ${country}`;
    temperatureEl.textContent = `${Math.round(temp_c)}°C`;
    descriptionEl.textContent = condition.text;
    humidityEl.textContent = `${humidity}%`;
    windSpeedEl.textContent = `${(wind_kph / 3.6).toFixed(1)} m/s`; // Convert kph to m/s

    // Update the background based on weather and time of day
    updateDynamicBackground(condition.text, is_day); // This handles the gradient

    // Add particle effects based on the weather condition
    applyWeatherEffects(condition.text);

    // Make the card visible
    weatherCard.classList.remove('weather-hidden');
}


/**
 * Updates the body's background gradient based on weather conditions and time.
 * @param {string} conditionText - The weather condition text (e.g., "Sunny", "Partly cloudy").
 * @param {number} is_day - 1 for day, 0 for night.
 */
function updateDynamicBackground(conditionText, is_day) {
    const body = document.body;
    const condition = conditionText.toLowerCase();
    let gradient = '';

    // Night has priority
    if (is_day === 0) {
        gradient = 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'; // Deep space
    } else if (condition.includes('sun') || condition.includes('clear')) {
        gradient = 'linear-gradient(135deg, #f6d365, #fda085)'; // Sunny
    } else if (condition.includes('thunder')) {
        gradient = 'linear-gradient(135deg, #614385, #516395)'; // Thunderstorm
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        gradient = 'linear-gradient(135deg, #4b79a1, #283e51)'; // Rain
    } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
        gradient = 'linear-gradient(135deg, #e6dada, #f0f2f5, #e6dada)'; // Snow
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        gradient = 'linear-gradient(135deg, #bdc3c7, #2c3e50)'; // Cloudy
    } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
        gradient = 'linear-gradient(135deg, #d3d3d3, #757f9a)'; // Mist/Fog
    } else {
        // Default day gradient
        gradient = 'linear-gradient(135deg, #6dd5ed, #2193b0)';
    }

    // To prevent a jarring flash, we transition the background on a pseudo-element
    // but for simplicity here, we'll set it directly. For a production app, a more
    // complex transition would be ideal.
    body.style.background = gradient;
    body.style.backgroundSize = '400% 400%'; // Re-apply animation properties
    body.style.animation = 'gradientMove 15s ease infinite';
}

/**
 * --- Dynamic Weather Particle Effects ---
 */

const effectsContainer = document.getElementById('weather-effects');

/**
 * Orchestrates which weather effect to display based on the condition text.
 * @param {string} conditionText - The weather condition from the API.
 */
function applyWeatherEffects(conditionText) {
    effectsContainer.innerHTML = ''; // Clear previous effects
    const condition = conditionText.toLowerCase();

    if (condition.includes('thunder')) {
        createRain(150); // Heavy rain for thunderstorms
        effectsContainer.innerHTML += '<div class="flash"></div>';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
        createRain(100);
    } else if (condition.includes('snow') || condition.includes('sleet') || condition.includes('ice')) {
        createSnow(100);
    } else if (condition.includes('sun') || condition.includes('clear')) {
        effectsContainer.innerHTML = '<div class="sun"></div>';
    } else if (condition.includes('cloud') || condition.includes('overcast')) {
        createClouds(5);
    }
}

/**
 * Creates animated rain drop elements.
 * @param {number} count - The number of raindrops to create.
 */
function createRain(count) {
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}vw`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        effectsContainer.appendChild(drop);
    }
}

/**
 * Creates animated snowflake elements.
 * @param {number} count - The number of snowflakes to create.
 */
function createSnow(count) {
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.left = `${Math.random() * 100}vw`;
        flake.style.fontSize = `${10 + Math.random() * 10}px`;
        flake.style.animationDuration = `${5 + Math.random() * 5}s`;
        flake.style.animationDelay = `${Math.random() * 10}s`;
        flake.style.opacity = Math.random();
        effectsContainer.appendChild(flake);
    }
}

/**
 * Creates animated cloud elements.
 * @param {number} count - The number of clouds to create.
 */
function createClouds(count) {
    for (let i = 0; i < count; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.innerHTML = '☁';
        cloud.style.top = `${Math.random() * 25}vh`;
        cloud.style.fontSize = `${60 + Math.random() * 80}px`;
        cloud.style.opacity = 0.3 + Math.random() * 0.3;
        cloud.style.animationDuration = `${25 + Math.random() * 20}s`;
        cloud.style.animationDelay = `-${Math.random() * 20}s`; // Start at different points
        effectsContainer.appendChild(cloud);
    }
}

/**
 * UI State Error Helpers
 */
function displayError(message) {
    weatherCard.classList.add('weather-hidden'); // Hide weather card on failure
    errorMessage.textContent = message;
    errorMessage.classList.remove('error-hidden');
}

function hideError() {
    errorMessage.classList.add('error-hidden');
}

// --- Event Listeners ---

/**
 * Handles the search action, trims the input, and calls the weather fetch function.
 */
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
}

// Handle Button Click
searchBtn.addEventListener('click', handleSearch);

// Handle "Enter" Key Press in Input field
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') handleSearch();
});

// --- 3D Interactive Tilt Effect ---

const dashboardContainer = document.querySelector('.dashboard-container');

/**
 * Applies a 3D tilt effect based on mouse position within the element.
 */
dashboardContainer.addEventListener('mousemove', (e) => {
    const rect = dashboardContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse X position relative to the element
    const y = e.clientY - rect.top;  // Mouse Y position relative to the element

    const centerX = dashboardContainer.clientWidth / 2;
    const centerY = dashboardContainer.clientHeight / 2;

    // Calculate rotation values (the divisor controls sensitivity)
    const rotateY = (x - centerX) / 20;
    const rotateX = (y - centerY) / -20;

    // Apply the transform, keeping the existing parallax for children
    dashboardContainer.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
});

/**
 * Resets the 3D tilt effect when the mouse leaves the element.
 */
dashboardContainer.addEventListener('mouseleave', () => {
    dashboardContainer.style.transform = 'perspective(1500px) rotateX(0deg) rotateY(0deg) scale(1)';
});