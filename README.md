# weather-checker
“Weather dashboard in vanilla JS with animated sky, 7-day forecast and hourly chart”
# 🌤️ Pravallika's Weather Checker

A responsive weather dashboard built with **pure HTML, CSS and JavaScript**. Search any city in the world and get live weather, a 7-day forecast, an hourly temperature chart, air quality, and more. The sky animates to match the real weather.
---

## ✨ Features

- 🔍 **City search** for any city worldwide, with support for hints like `Puttaparthi, Andhra Pradesh` and clickable chips for other matching places
- 🌡️ **Current conditions** showing temperature, condition, high/low and "feels like"
- 🔄 **°C / °F toggle**, remembered between visits
- 🎨 **Animated sky scene** that changes with the weather:
  - Clear (rotating sun), cloudy (drifting clouds), rain, snow, thunderstorm (lightning flash), and night (moon and twinkling stars)
- 📅 **7-day forecast tabs** with icons and high/low temperatures
- 📈 **Hourly chart**, hand-drawn in SVG, with temperature curve, chance of rain and hour labels
- 🧩 **8 detail tiles:**
  - Visibility
  - Pressure (rising / falling / steady)
  - Air Quality Index (AQI)
  - UV index
  - Wind (speed, gusts, direction compass, Beaufort force)
  - Humidity and dew point
  - Embedded map
  - Sun hours (sunrise and sunset arc)
- 💾 **Remembers your last searched city**
- 📱 **Fully responsive** on desktop, tablet and mobile
- ♿ **Accessible** with ARIA live regions, keyboard focus styles and reduced-motion support

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Structure | HTML5 (semantic markup, ARIA) |
| Styling | CSS3 (Grid, Flexbox, custom properties, keyframe animations, media queries) |
| Logic | Vanilla JavaScript (ES6+, async/await, `fetch`, `Promise.all`) |
| Graphics | Inline SVG (icons, charts, gauges, compass) |
| Data | [Open-Meteo](https://open-meteo.com/) Forecast, Geocoding and Air Quality APIs |
| Map | Google Maps embed |
| Storage | Browser `localStorage` |

> No frameworks, no libraries, and **no API key required**.

---

## ⚙️ How It Works

1. The user enters a city name.
2. The **Geocoding API** converts it to latitude and longitude. Results are ranked by exact name match and population.
3. The **Forecast API** and **Air Quality API** are called in parallel with `Promise.all`.
4. The data is stored in a central `state` object.
5. The UI (main card, tabs, chart and tiles) is rendered from that state.
6. WMO weather codes decide the icon, label and sky theme.

---

## 🧠 What I Learned

- Working with REST APIs and asynchronous JavaScript
- Handling race conditions (ignoring outdated responses when searching quickly)
- Building a CSS Grid dashboard with theme switching through CSS variables
- Drawing charts and gauges with raw SVG and basic geometry, without chart libraries
- Managing application state without a framework
- Graceful error handling (network failures, unknown cities, failed air-quality requests)
- Accessibility and responsive design

---

## 🔮 Future Improvements

- Use the browser's geolocation for "my location"
- Save multiple favourite cities
- Dark mode toggle
- Cache API responses
- Rebuild in React as a framework comparison

---
## website lool like this
<img width="1186" height="628" alt="Screenshot 2026-10-18 191606" src="https://github.com/user-attachments/assets/48a419ec-f9d8-4094-a427-c863f0ae5782" />
<img width="1215" height="611" alt="Screenshot 2026-10-18 191617" src="https://github.com/user-attachments/assets/367c9cc6-6b85-4f2c-89cd-58c1f2fc2d9c" />

