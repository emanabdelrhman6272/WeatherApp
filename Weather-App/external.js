const API_KEY = "65b06815870f4237887171958250405";
const searchInput = document.querySelector(".search");
const cityElement = document.querySelector(".name");
const error = document.querySelector(".error");
const loader = document.querySelector(".loader");
const dateElement = document.querySelector(".date");
const tempElement = document.querySelector(".temp");
const weatherImageElement = document.querySelector(".img-weather");
const forecastSectionsElement = document.querySelector(".forecastsections");
const weatherDetailsElement = document.querySelector(".weatherdetails2");
const daysElement = document.querySelector(".days");
const cSpan = document.querySelector(".C");
const fSpan = document.querySelector(".F");

let isFahrenheit = false;
let weatherData = null;

// Toggle Units
cSpan.addEventListener("click", () => {
  isFahrenheit = false;
  cSpan.classList.add("active");
  fSpan.classList.remove("active");
  updateTemperatureUI();
});

fSpan.addEventListener("click", () => {
  isFahrenheit = true;
  fSpan.classList.add("active");
  cSpan.classList.remove("active");
  updateTemperatureUI();
});

function updateTemperatureUI() {
  if (weatherData) {
    updateUI(weatherData);
  }
}

// Search Input //Enter
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  }
});

// Fetch Weather Data
async function getWeatherData(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`;

  try {
    loader.parentElement.style.display = "flex"; //show loader

    const response = await fetch(url);

    if (!response.ok) {
      error.style.display = "block"; //error message
      loader.parentElement.style.display = "none";
      return;
    }

    const data = await response.json();
    error.style.display = "none"; //hide error if success

    weatherData = data; //  Save the data for switching units
    //loading for error
    setTimeout(() => {
      updateUI(weatherData);
      loader.parentElement.style.display = "none";
    }, 2000);
  } catch (err) {
    console.log("Fetch error:", err);
    error.style.display = "block"; // مشكله فى الشبكه
    loader.parentElement.style.display = "none"; // loader -> none
  }
}

// Update UI
function updateUI(data) {
  const current = data.current;
  const forecast = data.forecast.forecastday;
  const city = data.location.name;
  cityElement.textContent = city;

  // Date
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString(
    "en-US",
    {
      month: "short",
    },
  )}, ${currentDate.toLocaleString("en-US", { weekday: "long" })}`;
  dateElement.textContent = formattedDate;

  // Temperature Main
  tempElement.textContent = isFahrenheit
    ? `${Math.round(current.temp_f)}°/${Math.round(current.feelslike_f)}°`
    : `${Math.round(current.temp_c)}°/${Math.round(current.feelslike_c)}°`;

  // weatherImageElement.src = current.condition.icon;

  // 7hoursForecast
  // 3-Hours Forecast (8 times a day)
  // const forecastSectionsElement = document.querySelector(".forecastsections");
  forecastSectionsElement.innerHTML = "";
  const hours = forecast[0].hour;
  const threeHourForecast = hours.filter((_, index) => index % 4 === 0);
  threeHourForecast.forEach((hourData) => {
    const hourTime = new Date(hourData.time).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const temp = isFahrenheit
      ? `${Math.round(hourData.temp_f)}°F`
      : `${Math.round(hourData.temp_c)}°C`;

    const forecastDiv = document.createElement("div");
    forecastDiv.classList.add("forecast-item");
    forecastDiv.innerHTML = `
      <p class="timer">${hourTime}</p>
      <img src="${hourData.condition.icon}" alt="${hourData.condition.text}"/>
      <p class="temperature">${temp}</p>
    `;
    forecastSectionsElement.appendChild(forecastDiv);
  });

  // Weather Details
  weatherDetailsElement.innerHTML = `
    <div class="sunrise">
      <div class="sunrise-left">
        <p class="p-sunrise1">Sunrise</p>
        <p class="p-sunrise2">${forecast[0].astro.sunrise}</p>
      </div>
      <div class="sunrise-right">
        <img src="images/sunrise.png" />
      </div>
    </div>

    <div class="sunset">
      <div class="sunset-left">
        <p class="p-sunset1">Sunset</p>
        <p class="p-sunset2">${forecast[0].astro.sunset}</p>
      </div>
      <div class="sunset-right">
        <img src="images/sunset.png" />
      </div>
    </div>

    <div class="chanceofrain">
      <div class="chanceofrain-left">
        <p class="p-chanceofrain1">Chance of Rain</p>
        <p class="p-chanceofrain2">${forecast[0].day.daily_chance_of_rain}%</p>
      </div>
      <div class="chanceofrain-right">
        <img src="images/rain.png" />
      </div>
    </div>

    <div class="wind">
      <div class="wind-left">
        <p class="p-wind1">Wind</p>
        <p class="p-wind2">${current.wind_kph} km/h</p>
      </div>
      <div class="wind-right">
        <img src="images/wind.png" />
      </div>
    </div>

    <div class="UVindex">
      <div class="UVindex-left">
        <p class="p-UVindex1">UV Index</p>
        <p class="p-UVindex2">${current.uv}</p>
      </div>
      <div class="UVindex-right">
        <img src="images/UV.png" />
      </div>
    </div>

    <div class="fellslike">
      <div class="fellslike-left">
        <p class="p-fellslike1">Feels Like</p>
        <p class="p-fellslike2">
          ${
            isFahrenheit
              ? Math.round(current.feelslike_f)
              : Math.round(current.feelslike_c)
          }°
        </p>
      </div>
      <div class="fellslike-right">
        <img src="images/fellslike.png" />
      </div>
    </div>
  `;

  // 3 Days Forecast
  const daysElement = document.querySelector(".days");
  daysElement.innerHTML = "";
  forecast.slice(0, 3).forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-item");
    dayDiv.innerHTML = `  <p class="timer">${day.date}</p>
    <p class="day'sname">${new Date(day.date).toLocaleString("en-US", { weekday: "short" })}
    </p>
    <img src="${day.day.condition.icon}"alt="${day.day.condition.text}"/>
    <p class="condition">${day.day.condition.text}</p>
    <p class="temperature">${Math.round(day.day.avgtemp_c)}°</p>
     <div class="Tempreverse">${
       isFahrenheit
         ? `${Math.round(day.day.maxtemp_f)}°/${Math.round(day.day.mintemp_f)}°`
         : `${Math.round(day.day.maxtemp_c)}°/${Math.round(day.day.mintemp_c)}°`
     }</div>`;
    daysElement.appendChild(dayDiv);
  });
}
