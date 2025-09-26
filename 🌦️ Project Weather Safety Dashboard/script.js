const API_KEY = 'cd6a26cd3034b474eca2f6dbcabfa4aa';

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const themeToggleBtn = document.getElementById('theme-toggle');

    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '🌙';
    }

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        } else {
            alert('Please enter a city name.');
        }
    });

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggleBtn.textContent = '🌙 ';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggleBtn.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }
    });

    getWeather('London');
});

async function getWeather(city) {
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found or API error.');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(currentData);
        checkSafetyAlerts(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert(error.message);
    }
}

function displayWeather(data) {
    const cityName = document.getElementById('city-name');
    const dateTime = document.getElementById('date-time');
    const temperature = document.getElementById('temperature');
    const weatherIcon = document.getElementById('weather-icon');
    const description = document.getElementById('description');

    const date = new Date();
    cityName.textContent = data.name;
    dateTime.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
}

function checkSafetyAlerts(data) {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    let alertText = 'No safety alerts.';
    let alertClass = 'safe';

    if (data.main.temp > 40) {
        alertText = '🔥 Heatwave Warning! Drink plenty of water.';
        alertClass = 'danger';
    } else if (data.wind.speed > 60 / 3.6) {
        alertText = '⛈️ Storm Warning! Stay indoors and avoid travel.';
        alertClass = 'danger';
    } else if (data.weather[0].main.toLowerCase().includes('rain') && data.rain && data.rain['1h'] > 20) {
        alertText = '🌧️ Heavy Rainfall Alert! Watch for flash floods.';
        alertClass = 'caution';
    }

    alertBox.className = `alert-box ${alertClass}`;
    alertMessage.textContent = alertText;
}

function displayForecast(data) {
    const forecastContainer = document.querySelector('.forecast-container');
    forecastContainer.innerHTML = '';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.slice(0, 5).forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p>${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="Weather Icon">
            <p>${temp}°C</p>
        `;
        forecastContainer.appendChild(card);
    });
}