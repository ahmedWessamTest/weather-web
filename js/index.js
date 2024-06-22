"use strict";
// global key
const apiKey = "a1bd8217c5b74da687021800242006";
//search element
const weatherSearchInput = document.getElementById("weatherSearchInput");
// current  elements
const currentTempElement = document.getElementById("currentTempElement");
const currentCityElement = document.getElementById("currentCityElement");
const weatherIconElement = document.getElementById("weatherIconElement");
const currentConditionElement = document.getElementById(
  "currentConditionElement"
);
const humadityElement = document.getElementById("humadityElement");
const gustsElement = document.getElementById("gustsElement");
const currentMinElement = document.getElementById("currentMinElement");
const currentMaxElement = document.getElementById("currentMaxElement");
const currentDayElement = document.getElementById("currentDayElement");
const chanceOfRainElement = document.getElementById("ChaneOfRainElement");
const windElement = document.getElementById("windElement");
const sunriesElement = document.getElementById("sunriesElement");
const sunsetElement = document.getElementById("sunsetElement");
const pressureElement = document.getElementById("pressureElement");

const daysRow = document.getElementById("daysRow");
const hourlyContainer = document.getElementById("hourlyContainer");
// loading screen element
const loading = document.getElementById("loading");

getUserLocation();

async function getUserLocation() {
  loading.classList.remove("d-none");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    currentCityElement.innerHTML = "location not supported";
  }
  async function successCallback(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const cageApiKey = "7556e15456fe465ba654769c9fc74bb7";
    const cageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${cageApiKey}`;
    try {
      const cageFetch = await fetch(cageUrl);
      const data = await cageFetch.json();
      const components = data.results[0];
      const currentLocation = components.components.city;
      getWeather(currentLocation);
    } catch (error) {
      alert("allow location");
    }
  }
  function errorCallback(error) {
    console.log("error getting Location" + error);
  }
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

weatherSearchInput.addEventListener(
  "input",
  debounce(function () {
    const searchValue = this.value.trim();
    if (searchValue) {
      getWeather(searchValue);
    }
  }, 500)
);

async function getWeather(text) {
  const res = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${text}&days=4&aqi=no&alerts=no`
  );

  const data = await res.json();
  const {
    forecast: {
      forecastday: [{ date }],
    },
  } = data;
  loading.classList.add("d-none");
  clearContainers();
  DisplayCurrentData(data);
  displayPredictData(data);
  displayHourlyData(data);
}

function clearContainers() {
  hourlyContainer.innerHTML = null;
  daysRow.innerHTML = null;
}

function DisplayCurrentData(data) {
  const {
    current: {
      temp_c: currentTemp,
      condition: { text: weatherCondition, icon: weatherIcon },
      humidity,
      gust_kph: gusts,
      wind_kph: wind,
      pressure_mb: airPressure,
    },
    location: { name: city },
    forecast: {
      forecastday: [
        {
          date,
          day: {
            maxtemp_c: maxCurrentTemp,
            mintemp_c: minCurrentTemp,
            daily_chance_of_rain: chanceToRain,
          },
          astro: { sunrise, sunset },
        },
      ],
    },
  } = data;

  currentTempElement.innerHTML = currentTemp;
  currentCityElement.innerHTML = city;
  currentConditionElement.innerHTML = weatherCondition;
  weatherIconElement.innerHTML = `<img src="${weatherIcon}" alt="weather icon" class="w-100 d-block"/>`;
  humadityElement.innerHTML = `${humidity} &percnt;`;
  gustsElement.innerHTML = `${gusts} km/h`;
  currentMaxElement.innerHTML = maxCurrentTemp;
  currentMinElement.innerHTML = minCurrentTemp;

  chanceOfRainElement.innerHTML = `${chanceToRain} &percnt;`;
  windElement.innerHTML = `${wind} km/h`;
  sunriesElement.innerHTML = sunrise;
  sunsetElement.innerHTML = sunset;
  pressureElement.innerHTML = `${airPressure} hPa`;

  const currentDay = new Date(date);
  currentDayElement.innerHTML = getStringDay(currentDay);
}

function getStringDay(date) {
  const dayesOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayesOfWeek[date.getDay()];
}

function displayPredictData(data) {
  const daysRow = document.getElementById("daysRow");
  const {
    forecast: { forecastday },
  } = data;
  forecastday.forEach((element) => {
    const {
      date,
      day: {
        maxtemp_c: predictMaxTemp,
        mintemp_c: predictMinTemp,
        condition: { text: PredictConditionText, icon: predictConditionIcon },
      },
    } = element;
    const dateValue = new Date(date);
    const dayValue = dateValue.getDate();
    const monthValue = getStringMonth(dateValue);

    daysRow.innerHTML += `<div class="col-md-6">
                    <div class="day-card">
                      <div class="card-header d-flex align-items-center">
                        <span class="day-icon d-block">
                          <img
                            src="${predictConditionIcon}"
                            alt="weather icon"
                            class="w-100 d-block"
                          />
                        </span>
                        <div class="date">
                          <span class="day d-block">${PredictConditionText}</span>
                          <span class="day-date">${dayValue} ${monthValue}</span>
                        </div>
                      </div>
                      <div class="card-body">
                        <div class="min-day">
                          <span class="celli d-block">${predictMinTemp}</span>
                          <span class="day-min-max">min</span>
                        </div>
                        <div class="max-day">
                          <span class="celli d-block">${predictMaxTemp}</span>
                          <span class="day-min-max">max</span>
                        </div>
                      </div>
                    </div>
                  </div>`;
  });
}

const getStringMonth = (date) => date.toString().split(" ")[1];

function displayHourlyData(data) {
  const {
    forecast: {
      forecastday: [{ hour: hourTemp }],
    },
  } = data;
  hourTemp.forEach((element) => {
    const {
      temp_c: hourlyTemp,
      time,
      condition: { icon: hourlyConditionIcon },
    } = element;
    const date = new Date(time);
    const dateWithTime = getStringHour(date);
    hourlyContainer.innerHTML += `
                <div class="hourly-item text-center">
                  <span class="hourly-hour">${dateWithTime}</span>
                  <span class="hourly-img">
                    <img src="${hourlyConditionIcon}" class="w-100 d-block" alt="">
                  </span>
                  <span class="hourly-temp celli">
                    ${hourlyTemp}
                  </span>
                </div>`;
  });
}

function getStringHour(date) {
  let hours = date.getHours();

  const amPmFormat = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours} ${amPmFormat}`;
}
