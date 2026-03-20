/* nitr0s-plugin
   name: Weather Widget
   description: Live weather for any city using Open-Meteo (no API key needed)
   type: widget
*/
function run(container) {
  container.innerHTML = `
    <style>
      .w-wrap { display:flex; flex-direction:column; gap:16px; max-width:400px; }
      .w-search { display:flex; gap:8px; }
      .w-input {
        flex:1; background:#0c0c12; border:1px solid #1a1a26;
        border-radius:8px; padding:10px 14px;
        color:#ddddf0; font-family:var(--mono); font-size:13px; outline:none;
      }
      .w-input:focus { border-color:#7c3aed; }
      .w-btn {
        background:linear-gradient(135deg,#7c3aed,#9d5cff);
        border:none; border-radius:8px; padding:10px 18px;
        color:#fff; font-family:var(--mono); font-size:12px;
        cursor:pointer; letter-spacing:1px;
      }
      .w-btn:hover { box-shadow:0 0 14px rgba(124,58,237,0.4); }
      .w-card {
        background:#0c0c12; border:1px solid #1a1a26;
        border-radius:12px; padding:20px;
      }
      .w-city { font-size:22px; font-weight:600; margin-bottom:4px; }
      .w-temp { font-size:56px; font-family:'Bebas Neue',sans-serif; letter-spacing:2px;
        background:linear-gradient(135deg,#fff,#c084fc);
        -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
      .w-desc { color:#8888aa; font-size:13px; margin-bottom:16px; }
      .w-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
      .w-stat { background:#111118; border-radius:8px; padding:10px; text-align:center; }
      .w-stat-val { font-family:var(--mono); font-size:16px; color:#c084fc; }
      .w-stat-lbl { font-size:10px; color:#44445a; letter-spacing:1px; margin-top:2px; }
      .w-err { color:#f43f5e; font-family:var(--mono); font-size:12px; padding:12px; }
      .w-loading { color:#8888aa; font-family:var(--mono); font-size:12px; padding:12px; }
    </style>
    <div class="w-wrap">
      <div class="w-search">
        <input class="w-input" id="w-city-in" placeholder="Enter city name..." value="London">
        <button class="w-btn" onclick="fetchWeather()">GO</button>
      </div>
      <div id="w-result"><div class="w-loading">Enter a city and press GO.</div></div>
    </div>`;

  window.fetchWeather = async function() {
    const city = document.getElementById('w-city-in').value.trim();
    const result = document.getElementById('w-result');
    if (!city) return;
    result.innerHTML = '<div class="w-loading">Fetching...</div>';
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const gd = await geo.json();
      if (!gd.results?.length) throw new Error('City not found');
      const { latitude, longitude, name, country } = gd.results[0];

      const wx = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius`);
      const wd = await wx.json();
      const c = wd.current;
      const descs = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',51:'Light drizzle',61:'Light rain',71:'Light snow',80:'Rain showers',95:'Thunderstorm' };
      const desc = descs[c.weather_code] || 'Weather code ' + c.weather_code;
      result.innerHTML = `
        <div class="w-card">
          <div class="w-city">${name}, ${country}</div>
          <div class="w-temp">${Math.round(c.temperature_2m)}°C</div>
          <div class="w-desc">${desc}</div>
          <div class="w-grid">
            <div class="w-stat"><div class="w-stat-val">${c.relative_humidity_2m}%</div><div class="w-stat-lbl">HUMIDITY</div></div>
            <div class="w-stat"><div class="w-stat-val">${c.wind_speed_10m}</div><div class="w-stat-lbl">WIND KM/H</div></div>
            <div class="w-stat"><div class="w-stat-val">${c.weather_code}</div><div class="w-stat-lbl">WX CODE</div></div>
          </div>
        </div>`;
    } catch(e) {
      result.innerHTML = `<div class="w-err">Error: ${e.message}</div>`;
    }
  };

  document.getElementById('w-city-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') window.fetchWeather();
  });
}
