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

// Enter
searchInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();
    if (city) {
      getWeatherData(city);
    }
  }
});

async function getWeatherData(city) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no`;

  try {
    loader.parentElement.style.display = "flex"; // Show loader

    const response = await fetch(url);

    if (!response.ok) {
      error.style.display = "block"; // error message
      loader.parentElement.style.display = "none"; // ده فى حاله لو فيه ايرور
      return;
    }

    const data = await response.json();
    error.style.display = "none"; // Hide error if success

    //loading بتاع error
    setTimeout(() => {
      updateUI(data);
      loader.parentElement.style.display = "none";
    }, 2000);
  } catch (err) {
    console.log("Fetch error:", err);
    error.style.display = "block"; // مشكله فى الشبكه

    loader.parentElement.style.display = "none"; // loader -> none
  }
}

function updateUI(data) {
  const current = data.current;
  const forecast = data.forecast.forecastday;
  const city = data.location.name;
  cityElement.textContent = city;

  //date
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString(
    "en-US",
    {
      month: "short",
    }
  )}, ${currentDate.toLocaleString("en-US", { weekday: "long" })}`;
  dateElement.textContent = formattedDate;

  //temp
  tempElement.textContent = `${Math.round(current.temp_c)}°/${Math.round(
    current.feelslike_c
  )}°`;
  weatherImageElement.src = current.condition.icon;

  // forecast
  forecastSectionsElement.innerHTML = "";
  forecast.slice(0, 7).forEach((day, index) => {
    const forecastDiv = document.createElement("div");
    forecastDiv.classList.add("forecast" + (index + 1));
    forecastDiv.innerHTML = `
      <p class="timer">${day.date}</p>
      <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <p class="tempreture">${Math.round(day.day.avgtemp_c)}°</p>
    `;
    forecastSectionsElement.appendChild(forecastDiv);
  });

  // weather details
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
        <p class="p-fellslike2">${Math.round(current.feelslike_c)}°</p>
      </div>
      <div class="fellslike-right">
        <img src="images/fellslike.png" />
      </div>
    </div>
  `;

  // 7-days
  daysElement.innerHTML = "";
  forecast.forEach((day, index) => {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add(`day${index + 1}`);
    dayDiv.innerHTML = `
      <div class="day${index + 1}-1">
        ${new Date(day.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        })}
        <p class="dayname">${new Date(day.date).toLocaleString("en-US", {
          weekday: "short",
        })}</p>
      </div>
      <div class="day${index + 1}-2">
        <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
        ${day.day.condition.text}
      </div>
      <div class="day${index + 1}-3">${Math.round(
      day.day.maxtemp_c
    )}°/${Math.round(day.day.mintemp_c)}°</div>
    `;
    daysElement.appendChild(dayDiv);
  });
}