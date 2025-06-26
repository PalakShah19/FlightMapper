"use strict";
(function () {
  let map;
  let markers = [];
  let polylines = [];
  let lastFetchedRoute = null;

  window.addEventListener("load", init);

  function init() {
    document.getElementById("search-country").addEventListener("click", fetchCountryData);
    document.getElementById("search-pair").addEventListener("click", fetchAirportPairData);
    document.getElementById("show-map-route").addEventListener("click", drawRouteOnMap);

    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }

  async function fetchCountryData() {
    const country = document.getElementById("country-input").value.trim();
    const queryParams = new URLSearchParams({ country });

    const airlineRes = await fetch(`/airlines?${queryParams}`);
    const airportRes = await fetch(`/airports?${queryParams}`);

    if (airlineRes.ok && airportRes.ok) {
      const airlines = await airlineRes.json();
      const airports = await airportRes.json();

      document.getElementById("airlines-results").innerHTML = `
        <ul>${airlines.map(a => `<li>${a.name} (${a.iata || a.icao})</li>`).join('')}</ul>
      `;

      document.getElementById("airports-results").innerHTML = `
        <ul>${airports.map(a => 
          `<li onclick="fetchAirportData('${a.iata || a.icao}')">${a.name} (${a.iata || a.icao})</li>`).join('')}</ul>
      `;
    } else {
      document.getElementById("airlines-results").innerHTML = "Error fetching airlines.";
      document.getElementById("airports-results").innerHTML = "Error fetching airports.";
    }
  }

  window.fetchAirportData = async function (code) {
    const queryParams = new URLSearchParams({ iata: code, icao: code });

    const airportInfoPromise = fetch(`/airports/temp?${queryParams}`);
    const departureRoutesPromise = fetch(`/routes/arrival-airport?dep=${code}`);
    const arrivalRoutesPromise = fetch(`/routes/arriving-at-airport?arr=${code}`);

    const [airportInfo, departureRoutes, arrivalRoutes] = await Promise.all([
      airportInfoPromise,
      departureRoutesPromise,
      arrivalRoutesPromise
    ]);

    if (airportInfo.ok && departureRoutes.ok && arrivalRoutes.ok) {
      const info = await airportInfo.json();
      const departures = await departureRoutes.json();
      const arrivals = await arrivalRoutes.json();

      document.getElementById("airport-results").innerHTML = `
        <h3>Info</h3>
        <p>Name: ${info.name}</p>
        <p>City: ${info.city}</p>
        <p>Country: ${info.country}</p>
        <p>Temp: High ${info.high}°C / Low ${info.low}°C</p>

        <details>
          <summary>Routes Originating from this Airport</summary>
          <ul>${departures.map(r => `<li>${info.name} ➔ ${r.arrival_name} (${r.arrival_iata})</li>`).join('')}</ul>
        </details>

        <details>
          <summary>Routes Arriving at this Airport</summary>
          <ul>${arrivals.map(r => `<li>${r.departure_name} (${r.departure}) ➔ ${info.name}</li>`).join('')}</ul>
        </details>
      `;
    } else {
      document.getElementById("airport-results").innerHTML = "Error fetching airport data.";
    }
  };

  async function fetchAirportPairData() {
    const dep = document.getElementById("departure-airport").value.trim();
    const arr = document.getElementById("arrival-airport").value.trim();
    const queryParams = new URLSearchParams({ dep, arr });

    const routeRes = await fetch(`/routes?${queryParams}`);

    if (!routeRes.ok) {
      document.getElementById("pair-results").innerHTML = "Error fetching airport pair data.";
      lastFetchedRoute = null;
      return;
    }

    const data = await routeRes.json();

    if (!data.routes || data.routes.length === 0) {
      document.getElementById("pair-results").innerHTML = "No routes found between selected airports.";
      lastFetchedRoute = null;
      return;
    }

    const depData = data.routes.find(r => r.dep_iata === dep);
    const arrData = data.routes.find(r => r.arr_iata === arr);

    if (!depData || !arrData) {
      document.getElementById("pair-results").innerHTML = "Could not find both departure and arrival airports.";
      lastFetchedRoute = null;
      return;
    }

    lastFetchedRoute = {
      dep_iata: depData.dep_iata,
      dep_lat: depData.dep_lat,
      dep_lon: depData.dep_lon,
      arr_iata: arrData.arr_iata,
      arr_lat: arrData.arr_lat,
      arr_lon: arrData.arr_lon,
      airline: depData.airline || arrData.airline || 'Unknown',
      planes: depData.planes || arrData.planes || 'Unknown'
    };

    document.getElementById("pair-results").innerHTML = `
      <h3>Distance: ${data.distanceInKm.toFixed(2)} km</h3>
      <details open>
        <summary>Available Routes</summary>
        <ul>${data.routes.map(r => `<li>Airline: ${r.airline} | Planes: ${r.planes}</li>`).join('')}</ul>
      </details>
    `;
  }

  function drawRouteOnMap() {
    if (!lastFetchedRoute) {
      alert("Please first click 'Find Routes & Distance'.");
      return;
    }

    if (
      !lastFetchedRoute.dep_lat || !lastFetchedRoute.dep_lon ||
      !lastFetchedRoute.arr_lat || !lastFetchedRoute.arr_lon
    ) {
      alert("Missing coordinates to draw route.");
      return;
    }

    markers.forEach(marker => map.removeLayer(marker));
    polylines.forEach(line => map.removeLayer(line));
    markers = [];
    polylines = [];

    const depMarker = L.marker([lastFetchedRoute.dep_lat, lastFetchedRoute.dep_lon])
      .addTo(map)
      .bindPopup(`<b>Departure: ${lastFetchedRoute.dep_iata}</b>`);
    const arrMarker = L.marker([lastFetchedRoute.arr_lat, lastFetchedRoute.arr_lon])
      .addTo(map)
      .bindPopup(`<b>Arrival: ${lastFetchedRoute.arr_iata}</b>`);
    markers.push(depMarker);
    markers.push(arrMarker);

    const routeLine = L.polyline([
      [lastFetchedRoute.dep_lat, lastFetchedRoute.dep_lon],
      [lastFetchedRoute.arr_lat, lastFetchedRoute.arr_lon]
    ], { color: 'blue' }).addTo(map);
    polylines.push(routeLine);

    map.fitBounds(routeLine.getBounds());
  }
})();

