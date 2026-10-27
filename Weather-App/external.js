const API_KEY = "65b06815870f4237887171958250405";
const searchInput = document.querySelector(".search");
const cityElement = document.querySelector(".name");
const error = document.querySelector(".error");
const loader = document.querySelector(".loader");
const dateElement = document.querySelector(".date");
const tempElement = document.querySelector(".temp");
const conditionDescElement = document.querySelector(".condition-desc");
const weatherImageElement = document.querySelector(".img-weather");
const forecastSectionsElement = document.querySelector(".forecastsections");
const weatherDetailsElement = document.querySelector(".weatherdetails2");
const daysElement = document.querySelector(".days");
const cSpan = document.querySelector(".C");
const fSpan = document.querySelector(".F");
const darkModeBtn = document.querySelector(".dark-mode");
const lightModeBtn = document.querySelector(".light-mode");

let isFahrenheit = false;
let weatherData = null;
let errorTimeout = null;

function showError() {
  error.style.display = "block";
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    error.style.display = "none";
  }, 1200);
}

const suggestionList = document.querySelector(".suggestion-list");
let debounceTimer = null;

// Search Input Suggestions & Hide error message
searchInput.addEventListener("input", () => {
  error.style.display = "none";
  if (errorTimeout) clearTimeout(errorTimeout);
  const query = searchInput.value.trim();
  if (query.length === 0) {
    suggestionList.innerHTML = "";
    suggestionList.classList.remove("active");
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchSuggestions(query);
  }, 250);
});

// Arabic & Popular Cities fallback database
const popularCities = [
  { name: "Cairo", nameAr: "القاهرة", country: "Egypt", countryAr: "مصر" },
  {
    name: "Alexandria",
    nameAr: "الإسكندرية",
    country: "Egypt",
    countryAr: "مصر",
  },
  { name: "Giza", nameAr: "الجيزة", country: "Egypt", countryAr: "مصر" },
  { name: "Port Said", nameAr: "بورسعيد", country: "Egypt", countryAr: "مصر" },
  { name: "Suez", nameAr: "السويس", country: "Egypt", countryAr: "مصر" },
  { name: "Luxor", nameAr: "الأقصر", country: "Egypt", countryAr: "مصر" },
  { name: "Aswan", nameAr: "أسوان", country: "Egypt", countryAr: "مصر" },
  { name: "Mansoura", nameAr: "المنصورة", country: "Egypt", countryAr: "مصر" },
  { name: "Tanta", nameAr: "طنطا", country: "Egypt", countryAr: "مصر" },
  {
    name: "Ismailia",
    nameAr: "الإسماعيلية",
    country: "Egypt",
    countryAr: "مصر",
  },
  { name: "Fayoum", nameAr: "الفيوم", country: "Egypt", countryAr: "مصر" },
  { name: "Zagazig", nameAr: "الزقازيق", country: "Egypt", countryAr: "مصر" },
  { name: "Damietta", nameAr: "دمياط", country: "Egypt", countryAr: "مصر" },
  { name: "Asyut", nameAr: "أسيوط", country: "Egypt", countryAr: "مصر" },
  { name: "Minya", nameAr: "المنيا", country: "Egypt", countryAr: "مصر" },
  { name: "Beni Suef", nameAr: "بني سويف", country: "Egypt", countryAr: "مصر" },
  { name: "Hurghada", nameAr: "الغردقة", country: "Egypt", countryAr: "مصر" },
  {
    name: "Sharm El Sheikh",
    nameAr: "شرم الشيخ",
    country: "Egypt",
    countryAr: "مصر",
  },
  { name: "Sohag", nameAr: "سوهاج", country: "Egypt", countryAr: "مصر" },
  { name: "Qena", nameAr: "قنا", country: "Egypt", countryAr: "مصر" },
  { name: "Dubai", nameAr: "دبي", country: "UAE", countryAr: "الإمارات" },
  {
    name: "Abu Dhabi",
    nameAr: "أبوظبي",
    country: "UAE",
    countryAr: "الإمارات",
  },
  {
    name: "Riyadh",
    nameAr: "الرياض",
    country: "Saudi Arabia",
    countryAr: "السعودية",
  },
  {
    name: "Jeddah",
    nameAr: "جدة",
    country: "Saudi Arabia",
    countryAr: "السعودية",
  },
  {
    name: "Mecca",
    nameAr: "مكة المكرمة",
    country: "Saudi Arabia",
    countryAr: "السعودية",
  },
  {
    name: "Medina",
    nameAr: "المدينة المنورة",
    country: "Saudi Arabia",
    countryAr: "السعودية",
  },
  { name: "Doha", nameAr: "الدوحة", country: "Qatar", countryAr: "قطر" },
  {
    name: "Kuwait City",
    nameAr: "الكويت",
    country: "Kuwait",
    countryAr: "الكويت",
  },
  { name: "Amman", nameAr: "عمان", country: "Jordan", countryAr: "الأردن" },
  { name: "Beirut", nameAr: "بيروت", country: "Lebanon", countryAr: "لبنان" },
  { name: "Baghdad", nameAr: "بغداد", country: "Iraq", countryAr: "العراق" },
  { name: "Damascus", nameAr: "دمشق", country: "Syria", countryAr: "سوريا" },
  {
    name: "London",
    nameAr: "لندن",
    country: "United Kingdom",
    countryAr: "بريطانيا",
  },
  { name: "Paris", nameAr: "باريس", country: "France", countryAr: "فرنسا" },
  {
    name: "New York",
    nameAr: "نيويورك",
    country: "United States",
    countryAr: "أمريكا",
  },
];

// Fetch city suggestions from WeatherAPI + Arabic fallback
async function fetchSuggestions(query) {
  const isArabic = /[\u0600-\u06FF]/.test(query);

  let localMatches = popularCities
    .filter(
      (c) =>
        c.nameAr.includes(query) ||
        c.name.toLowerCase().includes(query.toLowerCase()),
    )
    .map((c) => ({
      name: c.name,
      displayName: `${c.nameAr} (${c.name})`,
      country: c.countryAr || c.country,
    }));

  if (isArabic) {
    renderSuggestions(localMatches);
    return;
  }

  const url = `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      renderSuggestions(localMatches);
      return;
    }

    const apiCities = await response.json();
    const formattedApi = apiCities.map((c) => ({
      name: c.name,
      displayName: c.name,
      country: c.country,
    }));

    // Combine results without duplicates
    const combined = [...formattedApi];
    localMatches.forEach((loc) => {
      if (
        !combined.some(
          (item) => item.name.toLowerCase() === loc.name.toLowerCase(),
        )
      ) {
        combined.push(loc);
      }
    });

    renderSuggestions(combined);
  } catch (err) {
    console.log("Suggestions error:", err);
    renderSuggestions(localMatches);
  }
}

// Render suggestions list
function renderSuggestions(cities) {
  if (!cities || cities.length === 0) {
    suggestionList.innerHTML = "";
    suggestionList.classList.remove("active");
    return;
  }

  suggestionList.innerHTML = cities
    .slice(0, 7)
    .map(
      (city) => `
    <li class="suggestion-item" data-name="${city.name}">
      <i class="fa-solid fa-location-dot"></i>
      <span><strong>${city.displayName || city.name}</strong>, <small style="color: #64748b;">${city.country}</small></span>
    </li>
  `,
    )
    .join("");

  suggestionList.classList.add("active");

  const items = suggestionList.querySelectorAll(".suggestion-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      const cityName = item.getAttribute("data-name");
      searchInput.value = cityName;
      suggestionList.classList.remove("active");
      getWeatherData(cityName);
    });
  });
}

// Close suggestions dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-box")) {
    suggestionList.classList.remove("active");
  }
});

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

// Search Input //Enter & Escape
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    suggestionList.classList.remove("active");
    const city = searchInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  } else if (e.key === "Escape") {
    suggestionList.classList.remove("active");
  }
});
getWeatherData(`Cairo`);
// Fetch Weather Data
async function getWeatherData(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`;

  try {
    loader.parentElement.style.display = "flex"; //show loader

    const response = await fetch(url);

    if (!response.ok) {
      showError();
      loader.parentElement.style.display = "none";
      return;
    }

    const data = await response.json();
    error.style.display = "none"; //hide error if success
    if (errorTimeout) clearTimeout(errorTimeout);

    weatherData = data; //  Save the data for switching units
    updateUI(weatherData);
    loader.parentElement.style.display = "none";
  } catch (err) {
    console.log("Fetch error:", err);
    showError();
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
  //Image Of The Day
  if (weatherImageElement) {
    weatherImageElement.src = `https:${current.condition.icon}`;
    weatherImageElement.alt = current.condition.text;
  }

  // Temperature Main
  tempElement.textContent = isFahrenheit
    ? `${Math.round(current.temp_f)}°/${Math.round(current.feelslike_f)}°`
    : `${Math.round(current.temp_c)}°/${Math.round(current.feelslike_c)}°`;

  if (conditionDescElement) {
    conditionDescElement.textContent = current.condition.text;
  }
  //DarkMode Main
  darkModeBtn.addEventListener("click", () => {
    document.body.classList.add("dark");
    darkModeBtn.classList.add("active");
    lightModeBtn.classList.remove("active");
    localStorage.setItem("theme", "dark");
  });
  lightModeBtn.addEventListener("click", () => {
    document.body.classList.remove("dark");
    lightModeBtn.classList.add("active");
    darkModeBtn.classList.remove("active");
    localStorage.setItem("theme", "light");
  });
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    darkModeBtn.classList.add("active");
    lightModeBtn.classList.remove("active");
  }

  // weatherImageElement.src = current.condition.icon;

  // 3-Hours Forecast (8 times a day)
  forecastSectionsElement.innerHTML = "";
  const hours = forecast[0].hour;
  const threeHourForecast = hours.filter((_, index) => index % 3 === 0);
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
      <img src="https:${hourData.condition.icon}" alt="${hourData.condition.text}"/>
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
  daysElement.innerHTML = "";
  forecast.slice(0, 3).forEach((day) => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-item");
    dayDiv.innerHTML = `  <p class="timer">${day.date}</p>
    <p class="day-name">${new Date(day.date).toLocaleString("en-US", { weekday: "short" })}
    </p>
    <img src="https:${day.day.condition.icon}"alt="${day.day.condition.text}"/>
    <p class="condition">${day.day.condition.text}</p>
    <p class="temperature">${isFahrenheit ? Math.round(day.day.avgtemp_f) : Math.round(day.day.avgtemp_c)}°</p>
     <div class="Tempreverse">${
       isFahrenheit
         ? `${Math.round(day.day.maxtemp_f)}°/${Math.round(day.day.mintemp_f)}°`
         : `${Math.round(day.day.maxtemp_c)}°/${Math.round(day.day.mintemp_c)}°`
     }</div>`;
    daysElement.appendChild(dayDiv);
  });
}
