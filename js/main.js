const apiKey = 'e788e8b7f6414e6f9ff180354242110';
const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=Floridablanca, Colombia&hours=6`;

async function fetchWeatherData() {
  console.log("Fetching weather data..."); // Para depuración
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    console.log("Data received:", data); // Verificar datos recibidos
    displayCurrentWeather(data);
    displayHourlyForecast(data);
    
    // Llama a la función para comparar la velocidad del viento
    compareWindSpeed(data);

    // Llama a la función para mostrar probabilidades de lluvia
    displayRainProbabilities(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function displayCurrentWeather(data) {
  const location = `${data.location.name}, ${data.location.country}`; // Actualizar ubicación
  const temperatureC = data.current.temp_c;
  const feelsLikeC = data.current.feelslike_c; // Agregar temperatura "Feels Like"
  const conditionText = data.current.condition.text;
  const conditionIcon = data.current.condition.icon;
  const windSpeedMph = data.current.wind_mph; // Velocidad del viento en mph
  const rainChance = data.forecast.forecastday[0].hour[0].chance_of_rain; // Probabilidad de lluvia actual
  const pressure = data.current.pressure_mb; // Presión en mb
  const uvIndex = data.current.uv; // Índice UV
  const currentTime = new Date(data.location.localtime); // Hora local

  // Convertir la velocidad del viento a km/h
  const windSpeedKmh = (windSpeedMph * 1.60934).toFixed(2); // Conversión de mph a km/h

  document.getElementById('location').textContent = `${location}`;
  document.getElementById('temperature').innerHTML = `
    ${temperatureC}°C
    <img src="${conditionIcon}" alt="${conditionText}" class="weather-icon">
  `;
  
  // Mostrar temperatura "Feels Like"
  document.getElementById('feels-like').textContent = `Feels Like: ${feelsLikeC}°C`;

  document.getElementById('condition').textContent = `Condition: ${conditionText}`;
  
  // Formatear fecha y hora
  const formattedTime = currentTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  document.getElementById('current-time').textContent = `${formattedTime}`;

  // Mostrar velocidad del viento con más espacio
  document.getElementById('wind-speed').innerHTML = `
    <div class="wind-speed">Wind Speed: ${windSpeedKmh} km/h</div>
  `;
  document.getElementById('rain-chance').textContent = `Chance of Rain: ${rainChance}%`;
  document.getElementById('pressure').textContent = `Pressure: ${pressure} mb`;
  document.getElementById('uv-index').textContent = `UV Index: ${uvIndex}`;
}

function displayHourlyForecast(data) {
  const forecastHours = data.forecast.forecastday[0].hour;
  const timesToCheck = ['now', '10', '11', '12', '13', '14']; // Horas a consultar
  const hourlyForecastContainer = document.getElementById('hourly-forecast');
  hourlyForecastContainer.innerHTML = ''; // Limpiar contenido previo

  timesToCheck.forEach((hour) => {
    let forecast;
    if (hour === 'now') {
      forecast = data.current; // Usar la información actual para "now"
    } else {
      forecast = forecastHours.find(h => h.time.split(' ')[1].startsWith(hour)); // Filtrar por hora
    }

    if (forecast) {
      const forecastDiv = document.createElement('div');
      
      // Convertir la hora de 24 horas a formato de 12 horas
      const hour12 = hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayTime = hour === 'now' ? 'Now' : `${hour12} ${ampm}`; // Mostrar solo la hora sin :00

      const conditionIcon = forecast.condition.icon;
      const temperatureC = hour === 'now' ? forecast.temp_c : forecast.temp_c; // Grados actuales

      forecastDiv.innerHTML = `
        <h3>${displayTime}</h3>
        <img src="${conditionIcon}" alt="Icono del clima" class="hourly-icon">
        <p>${temperatureC}°</p>
      `;
      hourlyForecastContainer.appendChild(forecastDiv);
    }
  });
}

function compareWindSpeed(data) {
  const currentSpeed = (data.current.wind_mph * 1.60934).toFixed(2); // Velocidad actual en km/h
  const forecastHours = data.forecast.forecastday[0].hour;

  // Verificar si hay datos futuros disponibles
  if (forecastHours.length > 1) {
    const futureSpeed = (forecastHours[1].wind_mph * 1.60934).toFixed(2); // Velocidad en la próxima hora en km/h
    console.log(`Current speed: ${currentSpeed} km/h`); // Mostrar en consola
    console.log(`Speed in the next hour: ${futureSpeed} km/h`); // Mostrar en consola

    // Calcular la diferencia
    const difference = (futureSpeed - currentSpeed).toFixed(2);
    let changeText = '';
    let arrow = ''; // Para almacenar el triángulo

    if (difference > 0) {
      changeText = `  ${difference} km/h`;
      arrow = `<span class="up-arrow">&#9650;</span>`; // Triángulo verde hacia arriba
    } else if (difference < 0) {
      changeText = `  ${Math.abs(difference)} km/h`;
      arrow = `<span class="down-arrow">&#9660;</span>`; // Triángulo rojo hacia abajo
    } else {
      changeText = ' no change';
    }

    // Actualizar el texto en el HTML
    document.getElementById('wind-speed').innerHTML += ` <div class="wind-change">${arrow} ${changeText}</div>`; // Agregar el cambio y la flecha al texto existente
  } else {
    console.log("Not enough future data to compare.");
  }
}

function displayRainProbabilities(data) {
    const rainProbabilitiesContainer = document.getElementById('rain-probabilities');
    const forecastHours = data.forecast.forecastday[0].hour;
  
    // Horas específicas que quieres mostrar
    const hoursToCheck = ['19', '20', '21', '22']; // 7 PM, 8 PM, 9 PM, 10 PM
    rainProbabilitiesContainer.innerHTML = ''; // Limpiar contenido previo
  
    // Encapsular la sección en un cuadrado
    rainProbabilitiesContainer.classList.add('rain-probabilities-container');
  
    hoursToCheck.forEach((hour) => {
      const forecast = forecastHours.find(h => h.time.split(' ')[1].startsWith(hour)); // Filtrar por hora
  
      if (forecast) {
        const rainChance = forecast.chance_of_rain; // Probabilidad de lluvia
        const hour12 = hour > 12 ? hour - 12 : hour; // Convertir a formato 12 horas
        const ampm = hour >= 12 ? 'PM' : 'AM'; // Determinar AM/PM
        const progressBar = `
          <div class="progress-bar-container">
            <strong class="progress-bar-time">${hour12} ${ampm}</strong>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${rainChance}%;"></div>
            </div>
            <span class="progress-bar-percentage">${rainChance}%</span>
          </div>
        `;
        rainProbabilitiesContainer.innerHTML += progressBar;
      }
    });
  }
  
// Llama a la función de obtener datos del clima al cargar el script
fetchWeatherData();
