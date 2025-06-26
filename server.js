"use strict";

const { Client } = require('pg');
const express = require('express');
const app = express();
const axios = require('axios');
app.use(express.json());
const PORT = 8001;
app.listen(PORT);

const clientConfig = {
  user: 'postgres', 
password: 'mypacepostgresql', 
host: 'my-pace-postgresql.cnka62k42bab.us-east-2.rds.amazonaws.com', 
port: 5432, 
ssl: { 
rejectUnauthorized: false, 
} 
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
app.use(express.static("public"));
app.get('/country', async function (req, res) {
const code = req.query['code']; 
const client = new Client(clientConfig); 
  await client.connect(); 
  const result = await client.query("SELECT NAME FROM country WHERE CODE=$1::text", [code]); 
  if (result.rowCount < 1) { 
  res.status(500).send("Internal Error - No Country Found"); 
  } else { 
  res.set("Content-Type", "application/json"); 
  res.send(result.rows[0]); 
 }  
 await client.end(); 
});

app.get('/states', async function (req, res) {
  const country = req.query['country'];
  const client = new Client(clientConfig); 
  await client.connect(); 
  const result1 = await client.query("SELECT state_name, state_code FROM states_by_country WHERE country_code = $1::text", [country]);
  if (result1.rowCount < 1) { 
  res.status(500).send("Internal Error - No Country Found"); 
  } else { 
  res.set("Content-Type", "application/json"); 
  res.send(result1.rows); 
  } 
  await client.end(); 
});

app.post("/login",async (req,res) => {
	
	const{email, password} = req.body;
	const client = new Client(clientConfig);
	await client.connect();
	
	const result = await client.query(
	
	"select * from admins where email = $1 and password = $2",[email,password]
	
	);
	if (result.rows.length > 0) {
		res.status(200).json({ message: "Login successful!" });
	} else {
		res.status(401).json({ error: "Invalid email or password." });
	}
	
	
});

app.get('/airlines', async function (req, res) {
  const country = req.query['country'];
  const client = new Client(clientConfig);
  await client.connect();
  const result1 = await client.query("SELECT name, iata, icao FROM airlines WHERE country = $1::text", [country]);
  if (result1.rowCount < 1) {
  res.status(500).send("Internal Error - No Country Found");
  } else {
  res.set("Content-Type", "application/json");
  res.send(result1.rows);
  }
  await client.end();
});

app.get('/airlines/search', async function (req, res) {
  const iata = req.query['iata'];
  const icao = req.query['icao'];
  const client = new Client(clientConfig);
  await client.connect();
  if (!icao && !iata) {
    return res.status(400).send("ICAO or IATA code is required");
  }
  const result1 = await client.query("SELECT name, iata, icao FROM airlines WHERE (iata = $1 OR $1 IS NULL) AND (icao = $2 OR $2 IS NULL)", [iata, icao]);
  if (result1.rowCount < 1) {
  res.status(500).send("Internal Error - No airlines Found");
  } else {
  res.set("Content-Type", "application/json");
  res.send(result1.rows);
  }
  await client.end();
});

app.post('/airlines', async function (req, res) {
    const { name, icao, iata, country } = req.body;

    if (!name || !country) {
        return res.status(400).send("Bad Request - 'name' and 'country' are required.");
    }

    const client = new Client(clientConfig);
    await client.connect();
    
    const result1 = await client.query("INSERT INTO airlines (name, icao, iata, country) VALUES ($1, $2, $3, $4) RETURNING *; " , [name, icao || null, iata || null, country] );

    res.status(201).json({
        message: "Airline added successfully"
    });

    await client.end();
});

app.delete('/airlines', async function (req, res) {
  const icao = req.query['icao'];
  const iata = req.query['iata'];
  const client = new Client(clientConfig);
  await client.connect();
  if (!icao && !iata) {
    return res.status(400).send("ICAO or IATA code is required");
  }
  const result1 = await client.query("DELETE FROM airlines WHERE iata = $1::text OR icao = $2::text", [iata, icao]);
  if (result1.rowCount > 0) {
          res.status(200).send("Airline deleted successfully.");
    } else {
        res.status(404).send("Airline not found.");
    }
  await client.end();
});

app.get('/airports', async function (req, res) {
  const country = req.query['country'];
  const client = new Client(clientConfig);
  await client.connect();
  const result1 = await client.query("SELECT name, iata, icao FROM airports WHERE country = $1::text", [country]);
  if (result1.rowCount < 1) {
  res.status(500).send("Internal Error - No Country Found");
  } else {
  res.set("Content-Type", "application/json");
  res.send(result1.rows);
  }
  await client.end();
});

app.get('/airports/search', async function (req, res) {
  const iata = req.query['iata'];
  const icao = req.query['icao'];
  const client = new Client(clientConfig);
  await client.connect();
  if (!icao && !iata) {
    return res.status(400).send("ICAO or IATA code is required");
  }
  const result1 = await client.query("SELECT name FROM airports WHERE iata = $1::text OR icao = $2::text", [iata, icao]);
  if (result1.rowCount < 1) {
  res.status(500).send("Internal Error - No airports Found");
  } else {
  res.set("Content-Type", "application/json");
  res.send(result1.rows);
  }
  await client.end();
});

app.post('/airports', async function (req, res) {
    const { name, icao, iata, country } = req.body;

    if (!name || !country) {
        return res.status(400).send("Bad Request - 'name' and 'country' are required.");
    }

    const client = new Client(clientConfig);
    await client.connect();

    const result1 = await client.query("INSERT INTO airports (name, icao, iata, country) VALUES ($1, $2, $3, $4) RETURNING *; " , [name, icao || null, iata || null, country] );


    res.status(201).json({
        message: "Airline added successfully"
    });

    await client.end();
});

app.delete('/airports', async function (req, res) {
  const icao = req.query['icao'];
  const iata = req.query['iata'];
  const client = new Client(clientConfig);
  await client.connect();
  if (!icao && !iata) {
    return res.status(400).send("ICAO or IATA code is required");
  }
  const result1 = await client.query("DELETE FROM airports WHERE iata = $1::text OR icao = $2::text", [iata, icao]);
  if (result1.rowCount > 0) {
          res.status(200).send("Airline deleted successfully.");
      } else {
          res.status(404).send("Airline not found.");
      }
  await client.end();
});
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6378;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
app.get('/routes', async (req, res) => {
  console.log('execution 1st');
  const dep = req.query['dep']; 
  const arr = req.query['arr'];  

  if (!dep || !arr) {
    return res.status(400).send("Departure and arrival IATA codes are required");
  }

  const client = new Client(clientConfig);
  await client.connect();
  console.log('3rd');

  const result1 = await client.query(
    `SELECT a1.iata AS dep_iata, a1.latitude AS dep_lat, a1.longitude AS dep_lon, a2.iata AS arr_iata, a2.latitude AS arr_lat, a2.longitude AS arr_lon, r.airline, r.planes FROM airports a1 JOIN airports a2 ON a1.iata = $1 OR a2.iata = $2 LEFT JOIN routes r ON r.depature = a1.iata AND r.arrival = a2.iata WHERE (a1.iata = $1 OR a2.iata = $2) AND r.airline IS NOT NULL AND r.planes IS NOT NULL`, [dep, arr]);

  if (result1.rows.length < 1) {
    await client.end();
    return res.status(404).send("No valid routes found for the provided airports.");
  }

  const depData = result1.rows.find(row => row.dep_iata === dep);
  const arrData = result1.rows.find(row => row.arr_iata === arr);

  if (!depData || !arrData) {
    await client.end();
    return res.status(404).send("Departure or Arrival airport data is missing.");
  }

  const distance = haversine(depData.dep_lat, depData.dep_lon, arrData.arr_lat, arrData.arr_lon);

  res.json({
    distanceInKm: distance,
    routes: result1.rows.map(row => ({
      airline: row.airline,
      planes: row.planes,
    dep_iata: row.dep_iata,
    dep_lat: row.dep_lat,
    dep_lon: row.dep_lon,
    arr_iata: row.arr_iata,
    arr_lat: row.arr_lat,
    arr_lon: row.arr_lon
    }))
  });

  await client.end();
});

app.get('/routes/arrival-airport', async (req, res) => {
  const dep = req.query['dep'];

  if (!dep) {
    return res.status(400).send("Departure airport IATA code is required");
  }

  const client = new Client(clientConfig);
  await client.connect();

  const result = await client.query(
    `SELECT a2.iata AS arrival_iata, a2.name AS arrival_name, a2.city AS arrival_city, a2.country AS arrival_country FROM routes r JOIN airports a1 ON r.depature = a1.iata JOIN airports a2 ON r.arrival = a2.iata WHERE a1.iata = $1;`, [dep]);

  if (result.rows.length === 0) {
    await client.end();
    return res.status(404).send("No arrival airports found for the given departure airport");
  }

  res.json(result.rows);
  await client.end();
});

app.get('/routes/airline-planes', async (req, res) => {
  const airline = req.query['airline'];
  const plane = req.query['plane'];

  if (!airline || !plane) {
    return res.status(400).send('Airline code and aircraft type are required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  const result = await client.query(
    "SELECT r.depature AS departure, r.arrival AS arrival, a1.name AS departure_name, a2.name AS arrival_name FROM routes r JOIN airports a1 ON r.depature = a1.iata JOIN airports a2 ON r.arrival = a2.iata WHERE r.airline = $1 AND r.planes = $2",
    [airline, plane]
  );

  if (result.rows.length === 0) {
    return res.status(404).send('No routes found for the given airline and aircraft type');
  }

  res.json(result.rows);
  await client.end();
});

app.post('/routes', async (req, res) => {
  const { airline, departure, arrival, planes } = req.body;

  if (!airline || !departure || !arrival || !planes) {
    return res.status(400).send('All fields (airline, departure, arrival, and planes) are required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  const airlineResult = await client.query("SELECT * FROM airlines WHERE iata = $1", [airline]);
  if (airlineResult.rows.length === 0) {
    await client.end();
    return res.status(400).send('Invalid airline code.');
  }

  const depResult = await client.query("SELECT * FROM airports WHERE iata = $1", [departure]);
  if (depResult.rows.length === 0) {
    await client.end();
    return res.status(400).send('Invalid departure airport code.');
  }

  const arrResult = await client.query("SELECT * FROM airports WHERE iata = $1", [arrival]);
  if (arrResult.rows.length === 0) {
    await client.end();
    return res.status(400).send('Invalid arrival airport code.');
  }

  const planesResult = await client.query("SELECT * FROM planes WHERE code = $1", [planes]);
  if (planesResult.rows.length === 0) {
    await client.end();
    return res.status(400).send('Invalid aircraft type code.');
  }

  const result = await client.query(
    "INSERT INTO routes (airline, depature, arrival, planes) VALUES ($1, $2, $3, $4) RETURNING *",
    [airline, departure, arrival, planes]
  );

  await client.end();

  res.status(201).send('Added successfully').json(result.rows[0]);
});

app.get('/routes/airline-routes', async (req, res) => {
  const airline = req.query['airline'];

  if (!airline) {
    return res.status(400).send('Airline code is required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  const result = await client.query(
    "SELECT r.depature AS departure, r.arrival AS arrival, a1.name AS departure_name, a2.name AS arrival_name FROM routes r JOIN airports a1 ON r.depature = a1.iata JOIN airports a2 ON r.arrival = a2.iata WHERE r.airline = $1",
    [airline]
  );

  if (result.rows.length === 0) {
    return res.status(404).send('No routes found for the given airline.');
  }

  res.json(result.rows);
  await client.end();
});


app.get('/routes/arriving-at-airport', async (req, res) => {
  const arr = req.query['arr'];

  if (!arr) {
    return res.status(400).send("Arrival airport IATA code is required");
  }

  const client = new Client(clientConfig);
  await client.connect();

  const result = await client.query(
    `SELECT r.depature AS departure, r.arrival AS arrival, a1.name AS departure_name, a2.name AS arrival_name, r.airline
     FROM routes r
     JOIN airports a1 ON r.depature = a1.iata
     JOIN airports a2 ON r.arrival = a2.iata
     WHERE r.arrival = $1`,
    [arr]
  );

  if (result.rows.length === 0) {
    await client.end();
    return res.status(404).send("No arriving routes found for this airport");
  }

  res.json(result.rows);
  await client.end();
});


app.delete('/routes', async (req, res) => {
  const { airline, departure, arrival } = req.body;

  if (!airline || !departure || !arrival) {
    return res.status(400).send('Airline, departure, and arrival codes are required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  const result = await client.query(
    `DELETE FROM routes
     WHERE airline = $1 AND depature = $2 AND arrival = $3
     RETURNING *`,
    [airline, departure, arrival]
  );

  if (result.rowCount === 0) {
    await client.end();
    return res.status(404).send('Route not found.');
  }

  await client.end();
  res.status(200).send('Route deleted successfully.');
});

app.put('/routes/update', async (req, res) => {
  const { airline, departure, arrival, planes } = req.body;

  if (!airline || !departure || !arrival || !planes || planes.length === 0) {
    return res.status(400).send('Airline, departure, arrival, and planes are required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  const routeResult = await client.query(
    'SELECT * FROM routes WHERE airline = $1 AND depature = $2 AND arrival = $3',
    [airline, departure, arrival]
  );

  if (routeResult.rows.length === 0) {
    return res.status(404).send('Route does not exist.');
  }

  let existingPlanes = [];
  if (routeResult.rows[0].planes) {
    existingPlanes = routeResult.rows[0].planes.split(' ');
  }

  const newAircraftTypesToAdd = planes.filter(
    (type) => !existingPlanes.includes(type)
  );

  if (newAircraftTypesToAdd.length > 0) {
    existingPlanes = existingPlanes.concat(newAircraftTypesToAdd);
    const updatedPlanes = existingPlanes.join(' ');

    await client.query(
      'UPDATE routes SET planes = $1 WHERE airline = $2 AND depature = $3 AND arrival = $4',
      [updatedPlanes, airline, departure, arrival]
    );

    res.status(200).send('Route updated successfully.');
  } else {
    res.status(400).send('No new aircraft types to add.');
  }

  await client.end();
});

app.get('/airports/temp', async (req, res) => {
  const { icao, iata } = req.query;

  if (!icao && !iata) {
    return res.status(400).send('ICAO or IATA code is required.');
  }

  const client = new Client(clientConfig);
  await client.connect();

  let airportQuery = 'SELECT * FROM airports WHERE ';
  const queryParams = [];
  let paramIndex = 1;

  if (icao) {
    airportQuery += `icao = $${paramIndex}::text`;
    queryParams.push(icao);
    paramIndex++;
  }

  if (iata) {
    if (icao) airportQuery += ' OR ';
    airportQuery += `iata = $${paramIndex}::text`;
    queryParams.push(iata);
  }

  const result = await client.query(airportQuery, queryParams);

  if (result.rows.length === 0) {
    return res.status(404).send('Airport not found.');
  }

  const airport = result.rows[0];
  const latitude = airport.latitude;
  const longitude = airport.longitude;

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const weatherResponse = await axios.get(weatherUrl);
  const dailyWeather = weatherResponse.data.daily;

  const temperature_max = dailyWeather.temperature_2m_max[0];
  const temperature_min = dailyWeather.temperature_2m_min[0];

  res.json({
    name: airport.name,
    city: airport.city,
    country: airport.country,
    iata: airport.iata,
    icao: airport.icao,
    latitude: airport.latitude,
    longitude: airport.longitude,
    high: temperature_max,
    low: temperature_min,
  });

  await client.end();
});


