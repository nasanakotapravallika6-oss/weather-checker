// Uses Open-Meteo (weather + air quality): free, no API key needed.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const $ = (id) => document.getElementById(id);
const sceneEl = $("scene");
const precipEl = $("precip");

/* ---------- Weather icons (inline SVG, no images needed) ---------- */
const rays = [...Array(8)]
  .map((_, i) => `<line x1="32" y1="6" x2="32" y2="14" transform="rotate(${i * 45} 32 32)"/>`)
  .join("");

const sun = `<g class="rays" stroke="#FFC93C" stroke-width="4" stroke-linecap="round">${rays}</g>
  <circle cx="32" cy="32" r="11" fill="#FFC93C"/>`;

const moon = `<defs><mask id="moonmask"><rect width="64" height="64" fill="#fff"/><circle cx="42" cy="24" r="16" fill="#000"/></mask></defs>
  <circle cx="30" cy="34" r="20" fill="#F4E9B8" mask="url(#moonmask)"/>`;

const cloud = (fill = "#fff") => `<g fill="${fill}">
  <circle cx="24" cy="38" r="9"/><circle cx="36" cy="32" r="12"/><circle cx="47" cy="39" r="8"/>
  <rect x="24" y="38" width="23" height="9" rx="4"/></g>`;

const ICONS = {
  sun,
  moon,
  partly: `<g transform="scale(.75)">${sun}</g><g transform="translate(4 8)">${cloud()}</g>`,
  partlyNight: `<g transform="scale(.8)">${moon}</g><g transform="translate(4 8)">${cloud()}</g>`,
  cloud: cloud("#f2f6fa"),
  fog: `<g transform="translate(0 -6)">${cloud("#f2f6fa")}</g>
    <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85">
    <line x1="16" y1="50" x2="48" y2="50"/><line x1="20" y1="56" x2="52" y2="56"/></g>`,
  rain: `<g transform="translate(0 -5)">${cloud("#e6edf5")}</g>
    <g stroke="#4FB3FF" stroke-width="4" stroke-linecap="round">
    <line x1="24" y1="48" x2="21" y2="57"/><line x1="34" y1="48" x2="31" y2="57"/><line x1="44" y1="48" x2="41" y2="57"/></g>`,
  snow: `<g transform="translate(0 -5)">${cloud("#e6edf5")}</g>
    <g fill="#bfe0ff" stroke="#7fb4e6" stroke-width="1">
    <circle cx="24" cy="52" r="3"/><circle cx="34" cy="57" r="3"/><circle cx="44" cy="52" r="3"/></g>`,
  storm: `<g transform="translate(0 -6)">${cloud("#8e9bb0")}</g>
    <polygon points="34,40 26,52 33,52 29,62 42,46 35,46 39,40" fill="#FFD23F"/>`,
};

function iconSVG(name) {
  return `<svg viewBox="0 0 64 64" role="img" aria-hidden="true">${ICONS[name]}</svg>`;
}

/* WMO weather codes -> label + icon + page theme */
function describe(code, isDay = 1) {
  let r;
  if (code === 0) r = { text: "Clear sky", sky: "clear", icon: isDay ? "sun" : "moon" };
  else if (code <= 2) r = { text: code === 1 ? "Mostly clear" : "Partly cloudy", sky: "cloudy", icon: isDay ? "partly" : "partlyNight" };
  else if (code === 3) r = { text: "Overcast", sky: "cloudy", icon: "cloud" };
  else if (code <= 48) r = { text: "Fog", sky: "cloudy", icon: "fog" };
  else if (code <= 57) r = { text: "Drizzle", sky: "rain", icon: "rain" };
  else if (code <= 67) r = { text: "Rain", sky: "rain", icon: "rain" };
  else if (code <= 77) r = { text: "Snow", sky: "snow", icon: "snow" };
  else if (code <= 82) r = { text: "Rain showers", sky: "rain", icon: "rain" };
  else if (code <= 86) r = { text: "Snow showers", sky: "snow", icon: "snow" };
  else r = { text: "Thunderstorm", sky: "storm", icon: "storm" };
  if (!isDay && (r.sky === "clear" || r.sky === "cloudy")) r.sky = "night";
  return r;
}

/* ---------- Animated scene (left picture) ---------- */
function makeStars(el, count) {
  el.innerHTML = Array.from({ length: count }, () => {
    const size = Math.random() * 2 + 1;
    return `<i style="left:${Math.random() * 100}%;top:${Math.random() * 75}%;width:${size}px;height:${size}px;animation-delay:${-Math.random() * 4}s"></i>`;
  }).join("");
}

function setPrecip(kind) {
  if (precipEl.dataset.kind === kind) return;
  precipEl.dataset.kind = kind;
  precipEl.style.setProperty("--h", `${sceneEl.clientHeight + 40}px`);
  const rand = (min, max) => min + Math.random() * (max - min);
  let html = "";
  if (kind === "rain" || kind === "storm") {
    const count = kind === "storm" ? 90 : 70;
    for (let i = 0; i < count; i++) {
      const dur = kind === "storm" ? rand(0.45, 0.75) : rand(0.6, 1.1);
      html += `<i style="left:${rand(0, 120)}%;animation-duration:${dur}s;animation-delay:${-rand(0, dur)}s"></i>`;
    }
  } else if (kind === "snow") {
    for (let i = 0; i < 50; i++) {
      const size = rand(4, 9);
      const dur = rand(5, 10);
      html += `<i style="left:${rand(0, 95)}%;width:${size}px;height:${size}px;animation-duration:${dur}s,${rand(2, 4)}s;animation-delay:${-rand(0, dur)}s,0s"></i>`;
    }
  }
  precipEl.innerHTML = html;
}

function applySky(sky) {
  document.body.dataset.sky = sky;
  setPrecip(sky);
}

function initScene() {
  document.getElementById("sun-wrap").innerHTML = iconSVG("sun");
  // separate mask id so it doesn't clash with the moon icon in the weather card
  document.getElementById("moon-wrap").innerHTML = iconSVG("moon").replaceAll("moonmask", "moonmask-scene");
  makeStars(document.getElementById("stars-scene"), 40);
  applySky("clear");
  window.addEventListener("resize", () =>
    precipEl.style.setProperty("--h", `${sceneEl.clientHeight + 40}px`));
}

/* ---------- Data ---------- */
const state = { city: null, w: null, air: null, day: 0, unit: localStorage.getItem("unit") === "F" ? "F" : "C" };

function setStatus(message, isError = false) {
  $("status").textContent = message;
  $("status").classList.toggle("error", isError);
}

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
}

// Accepts "Puttaparthi" or "Puttaparthi, Andhra Pradesh" and returns up to 5 matches
async function findCities(text) {
  const [name, ...rest] = text.split(",").map((s) => s.trim());
  const hint = rest.join(" ").toLowerCase();
  const data = await getJSON(`${GEO_URL}?name=${encodeURIComponent(name)}&count=10&language=en`);
  let results = data.results || [];
  if (hint) {
    const filtered = results.filter((r) =>
      `${r.admin1 || ""} ${r.admin2 || ""} ${r.country || ""}`.toLowerCase().includes(hint));
    if (filtered.length) results = filtered;
  }
  const exact = (r) => (r.name.toLowerCase() === name.toLowerCase() ? 1 : 0);
  results = [...results].sort((x, y) => exact(y) - exact(x) || (y.population || 0) - (x.population || 0));
  if (results.length === 0) {
    throw new Error(`"${name}" isn't in the search database. Try a nearby larger town (for example Puttaparthi or Anantapur).`);
  }
  return results.slice(0, 5);
}

const cityLabel = (c) => [c.name, c.admin2, c.admin1, c.country].filter(Boolean).join(", ");

async function getWeather({ latitude, longitude }) {
  const q = new URLSearchParams({
    latitude, longitude, timezone: "auto", forecast_days: 7,
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,pressure_msl,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,is_day",
    hourly: "temperature_2m,precipitation_probability,uv_index,pressure_msl",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
  });
  const air = getJSON(`${AIR_URL}?${new URLSearchParams({ latitude, longitude, current: "us_aqi" })}`).catch(() => null);
  const [w, a] = await Promise.all([getJSON(`${WEATHER_URL}?${q}`), air]);
  return { w, air: a };
}

/* ---------- Formatting ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const temp = (c) => Math.round(state.unit === "F" ? (c * 9) / 5 + 32 : c);
const hour12 = (h) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
const fmt12 = (iso) => { const [h, m] = iso.slice(11, 16).split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const toMin = (iso) => { const [h, m] = iso.slice(11, 16).split(":").map(Number); return h * 60 + m; };
const nowIndex = (w) => Math.max(0, w.hourly.time.findIndex((t) => t.slice(0, 13) === w.current.time.slice(0, 13)));
const compass = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
const BEAUFORT = ["Calm","Light air","Light breeze","Gentle breeze","Moderate breeze","Fresh breeze","Strong breeze","Near gale","Gale","Strong gale","Storm","Violent storm","Hurricane"];
const force = (kmh) => [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118].filter((t) => kmh >= t).length;

const polar = (r, a) => [40 + r * Math.cos((a * Math.PI) / 180), 40 + r * Math.sin((a * Math.PI) / 180)];
function arc(a0, a1) {
  const [x0, y0] = polar(30, a0), [x1, y1] = polar(30, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A30 30 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}
const gauge = (inner) => `<svg class="gauge" viewBox="0 0 80 80" fill="none" stroke-width="7" stroke-linecap="round" aria-hidden="true">${inner}</svg>`;

/* ---------- Main card ---------- */
function renderMain() {
  const { city, w } = state, c = w.current, d = w.daily;
  const info = describe(c.weather_code, c.is_day);
  applySky(info.sky);
  $("dash").classList.remove("idle");
  $("place").textContent = [city.name, city.admin1 || city.country].filter(Boolean).join(", ");
  const { latitude: la, longitude: lo } = city;
  $("time-line").textContent = `Local time ${fmt12(c.time)} (${Math.abs(la).toFixed(2)}°${la >= 0 ? "N" : "S"}, ${Math.abs(lo).toFixed(2)}°${lo >= 0 ? "E" : "W"})`;
  $("icon").innerHTML = iconSVG(info.icon);
  $("temp").innerHTML = `${temp(c.temperature_2m)}<small>°${state.unit}</small>`;
  $("condition").textContent = info.text;
  $("hilo").textContent = `H ${temp(d.temperature_2m_max[0])}°  L ${temp(d.temperature_2m_min[0])}°`;
  $("feels").textContent = `Feels like ${temp(c.apparent_temperature)}°`;
  document.querySelectorAll(".unit button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.unit === state.unit));
}

function renderTabs() {
  const d = state.w.daily;
  $("tabs").innerHTML = d.time.map((iso, i) => {
    const label = i === 0 ? "Today" : new Date(`${iso}T12:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    return `<button type="button" data-day="${i}" aria-pressed="${i === state.day}">${label}${iconSVG(describe(d.weather_code[i]).icon)}
      <span>${temp(d.temperature_2m_max[i])}°</span> <span class="lo">${temp(d.temperature_2m_min[i])}°</span></button>`;
  }).join("");
}

function renderChart() {
  const { w, day } = state, h = w.hourly;
  const start = day === 0 ? nowIndex(w) : day * 24;
  const idx = Array.from({ length: 22 }, (_, k) => start + k).filter((k) => k < h.time.length);
  const temps = idx.map((k) => h.temperature_2m[k]);
  const lo = Math.min(...temps), hi = Math.max(...temps);
  const X = (k) => 16 + k * (568 / (idx.length - 1));
  const Y = (t) => 62 + ((hi - t) / (hi - lo || 1)) * 55;
  const pts = temps.map((t, k) => [X(k), Y(t)]);
  let line = `M${pts[0][0]} ${pts[0][1]}`;
  for (let k = 1; k < pts.length - 1; k++) {
    line += ` Q${pts[k][0]} ${pts[k][1]} ${(pts[k][0] + pts[k + 1][0]) / 2} ${(pts[k][1] + pts[k + 1][1]) / 2}`;
  }
  line += ` L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  const area = `${line} L${pts[pts.length - 1][0]} 150 L${pts[0][0]} 150Z`;
  let ticks = "";
  idx.forEach((hi_, k) => {
    if (k % 3) return;
    const x = X(k), p = h.precipitation_probability[hi_] ?? 0, hr = Number(h.time[hi_].slice(11, 13));
    ticks += `<text x="${x}" y="${pts[k][1] - 10}" text-anchor="middle">${temp(temps[k])}°</text>
      <g transform="translate(${x} 138)"><path d="M0 -5C3 -1 4 1 4 3A4 4 0 0 1 -4 3C-4 1 -3 -1 0 -5Z" transform="translate(-13 0)" fill="#2a7bd6"/><text class="pp" x="3" text-anchor="middle">${p}%</text></g>
      <text x="${x}" y="170" text-anchor="middle">${hour12(hr)}</text>`;
  });
  const marker = day === 0 ? `<line x1="${pts[0][0]}" x2="${pts[0][0]}" y1="${pts[0][1]}" y2="150" stroke="#14283b" stroke-dasharray="3 3"/><circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="4" fill="#14283b"/>` : "";
  $("chart").innerHTML = `<svg viewBox="0 0 600 180" role="img" aria-label="Hourly temperature and chance of rain">
    <defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9d8a" stop-opacity=".55"/><stop offset="1" stop-color="#bfe3b4" stop-opacity=".15"/></linearGradient></defs>
    <path d="${area}" fill="url(#fill)"/><path d="${line}" fill="none" stroke="#f08a7a" stroke-width="2"/>
    <line x1="8" x2="592" y1="150" y2="150" stroke="#b9c6d4"/>${marker}${ticks}</svg>`;
}

/* ---------- Tiles ---------- */
function renderTiles() {
  const { w, air } = state, c = w.current, h = w.hourly, i = nowIndex(w);

  const km = (c.visibility ?? 0) / 1000;
  const active = clamp(Math.ceil(km / 2), 1, 5);
  $("t-vis").innerHTML = `<h3>Visibility</h3><div class="row"><div><p class="big">${km >= 10 ? Math.round(km) : km.toFixed(1)}<small>km</small></p>
    <p class="sub">${km >= 10 ? "Excellent" : km >= 5 ? "Good" : km >= 2 ? "Moderate" : "Poor"}</p></div>
    <div class="vbars">${[28, 46, 64, 82, 100].map((p, n) => `<span class="${n < active ? "on" : ""}" style="width:${p}%"></span>`).join("")}</div></div>`;

  const p = c.pressure_msl, later = h.pressure_msl[i + 3] ?? p, diff = later - p;
  $("t-press").innerHTML = `<h3>Pressure</h3><div class="row"><div><p class="big">${Math.round(p)}<small>hPa</small></p>
    <p class="sub">${diff < -1 ? "Falling" : diff > 1 ? "Rising" : "Steady"}</p></div>
    <div class="slider"><i style="left:${clamp(((p - 980) / 60) * 100, 4, 96)}%"></i></div></div>`;

  const aqi = air?.current?.us_aqi;
  const aqiCol = aqi <= 50 ? "#3aa655" : aqi <= 100 ? "#e8c21a" : aqi <= 150 ? "#f08a00" : aqi <= 200 ? "#d63a3a" : "#8a2c9e";
  const aqiTxt = aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 150 ? "Unhealthy for sensitive groups" : aqi <= 200 ? "Unhealthy" : "Very unhealthy";
  $("t-aqi").innerHTML = `<h3>AQI</h3><div class="row"><div><p class="big">${aqi ?? "–"}</p><p class="sub">${aqi == null ? "Unavailable" : aqiTxt}</p></div>
    ${gauge(`<path d="${arc(135, 405)}" stroke="#dbe3ec"/>${aqi == null ? "" : `<path d="${arc(135, 135 + Math.max(6, 270 * Math.min(aqi / 300, 1)))}" stroke="${aqiCol}"/>`}`)}</div>`;

  const uv = h.uv_index[i] ?? 0, uvCols = ["#3aa655", "#f5c400", "#f08a00", "#d63a3a", "#7a2c9e"];
  const [mx, my] = polar(30, 135 + 270 * clamp(uv / 11, 0, 1));
  $("t-uv").innerHTML = `<h3>UV</h3><div class="row"><div><p class="big">${Math.round(uv)}</p>
    <p class="sub">${uv < 3 ? "Low" : uv < 6 ? "Moderate" : uv < 8 ? "High" : uv < 11 ? "Very High" : "Extreme"}</p></div>
    ${gauge(uvCols.map((col, n) => `<path d="${arc(138 + n * 54, 186 + n * 54)}" stroke="${col}"/>`).join("") + `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="4" fill="#fff" stroke="#14283b" stroke-width="2"/>`)}</div>`;

  const f = force(c.wind_speed_10m);
  $("t-wind").innerHTML = `<h3>Wind</h3><div class="wind">
    <svg class="compass" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="33" fill="none" stroke="#dfe8f1" stroke-width="9"/>
      <text x="50" y="9">N</text><text x="94" y="53">E</text><text x="50" y="99">S</text><text x="6" y="53">W</text>
      <polygon points="50,22 58,54 50,48 42,54" fill="#4f9cf0" transform="rotate(${c.wind_direction_10m} 50 50)"/></svg>
    <div><p class="big">${Math.round(c.wind_speed_10m)}<small>km/h</small></p><p class="label">Wind speed</p>
    <p class="big">${Math.round(c.wind_gusts_10m)}<small>km/h</small></p><p class="label">Wind gust</p></div></div>
    <p class="foot">Force: ${f} (${BEAUFORT[f]})</p><p class="label">From ${compass[Math.round(c.wind_direction_10m / 22.5) % 16]}</p>`;

  const rh = c.relative_humidity_2m;
  $("t-hum").innerHTML = `<h3>Humidity</h3><div class="hum"><div class="hbars">${Array(8).fill(`<span><i style="height:${rh}%"></i></span>`).join("")}</div>
    <div><p class="big">${rh}<small>%</small></p><p class="label">Humidity</p><p class="big">${temp(c.dew_point_2m)}°</p><p class="label">Dew point</p></div></div>
    <p class="foot">${rh < 30 ? "Dry" : rh <= 60 ? "Normal" : rh <= 80 ? "Humid" : "Very humid"}</p>`;

  const { latitude: lat, longitude: lon } = state.city;
  const src = `https://maps.google.com/maps?q=${lat},${lon}&z=11&output=embed`;
  $("t-map").innerHTML = `<iframe title="Map of ${state.city.name}" loading="lazy" src="${src}"></iframe>
    <a class="mapbtn" href="https://www.google.com/maps/search/?api=1&amp;query=${lat},${lon}" target="_blank" rel="noopener">Larger map</a>`;

  const sr = w.daily.sunrise[0], ss = w.daily.sunset[0];
  const span = toMin(ss) - toMin(sr), t = clamp((toMin(w.current.time) - toMin(sr)) / span, 0, 1);
  const B = (a, b, c2) => (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c2;
  $("t-sun").innerHTML = `<h3>Sun hours</h3><svg class="sun-svg" viewBox="0 0 200 100" aria-hidden="true">
    <line x1="4" x2="196" y1="84" y2="84" stroke="#d5dfea" stroke-dasharray="3 3"/>
    <path d="M14 84Q100 -22 186 84" fill="none" stroke="#dbe3ec" stroke-width="7" stroke-linecap="round"/>
    <path d="M14 84Q100 -22 186 84" fill="none" stroke="#f0953a" stroke-width="7" stroke-linecap="round" pathLength="1" stroke-dasharray="${t} 1"/>
    <circle cx="${B(14, 100, 186).toFixed(1)}" cy="${B(84, -22, 84).toFixed(1)}" r="6" fill="#fff" stroke="#f0953a" stroke-width="3"/></svg>
    <p class="label" style="text-align:center">${Math.floor(span / 60)}hrs ${span % 60}mins</p>
    <div class="suntimes"><div><p><b>${fmt12(sr)}</b></p><small>Sunrise</small></div><div><p><b>${fmt12(ss)}</b></p><small>Sunset</small></div></div>`;
}

function renderAll() { renderMain(); renderTabs(); renderChart(); renderTiles(); }

/* ---------- Search ---------- */
let requestId = 0;
async function showCity(city) {
  const id = ++requestId;
  const { w, air } = await getWeather(city);
  if (id !== requestId) return false; // a newer search already replaced this one
  Object.assign(state, { city, w, air, day: 0 });
  renderAll();
  return true;
}

function renderChoices(cities, selected) {
  const el = $("choices");
  el.innerHTML = "";
  if (cities.length < 2) return;
  cities.forEach((city) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cityLabel(city);
    btn.setAttribute("aria-pressed", city === selected);
    btn.addEventListener("click", async () => {
      setStatus("Loading…");
      try { if (await showCity(city)) { setStatus(""); renderChoices(cities, city); } }
      catch (err) { setStatus(err.message, true); }
    });
    li.appendChild(btn);
    el.appendChild(li);
  });
}

async function search(name) {
  setStatus("Loading…");
  $("choices").innerHTML = "";
  try {
    const cities = await findCities(name);
    if (!(await showCity(cities[0]))) return;
    renderChoices(cities, cities[0]);
    setStatus("");
    localStorage.setItem("lastCity", name);
  } catch (err) {
    applySky("clear");
    $("dash").classList.add("idle");
    setStatus(err instanceof TypeError ? "Can't reach the weather service. Check your connection." : err.message, true);
  }
}

$("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("city").value.trim();
  if (name) search(name);
});

$("tabs").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-day]");
  if (!b) return;
  state.day = Number(b.dataset.day);
  renderTabs();
  renderChart();
});

document.querySelectorAll(".unit button").forEach((b) => b.addEventListener("click", () => {
  state.unit = b.dataset.unit;
  localStorage.setItem("unit", state.unit);
  if (state.w) { renderMain(); renderTabs(); renderChart(); renderTiles(); }
  else document.querySelectorAll(".unit button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.unit === state.unit));
}));

initScene();
document.querySelectorAll(".unit button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.unit === state.unit));

// Reload the last searched city
const saved = localStorage.getItem("lastCity");
if (saved) {
  $("city").value = saved;
  search(saved);
}