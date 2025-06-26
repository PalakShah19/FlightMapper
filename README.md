# ✈️ FlightMapper

A web-based flight data visualization and exploration tool.  
Search flights, visualize airline routes, and view airport details dynamically on an interactive map.

## 📌 Steps to Run the Website for Testing

### 🔧 Backend Setup
- Ensure **PostgreSQL database** is running.  
- Confirm required tables (`airlines`, `airports`, `routes`, `planes`) are properly populated.  
- Navigate to your project directory and run the backend server:  
  ```bash
  node server.js

## 🌐 Frontend Setup
- Open the index.html file directly in a web browser (Google Chrome or Microsoft Edge recommended).

- Ensure the frontend can connect to the backend API server at: http://localhost:8001 or your configured IP.

## ✅ Feature Testing
- Search by Country: Enter a country name to view available airlines and airports.

- View Airline Routes: Click on any airline to see all airports/routes it serves.

- View Airport Details: Click on any airport to see:

- Basic info (name, city, country)

- Current high/low temperature (via Open-Meteo API)

- Routes originating from and arriving at the airport

- Airlines flying to/from the airport

- Compare Two Airports: Enter two airport codes to view distance and available routes.

- Route Visualization on Map: Live map with routes between selected airports using Leaflet.js.

## 📦 Environment Requirements
- Node.js v18+

- PostgreSQL Database

- Libraries/Frameworks:

- Express (Backend API)

- Leaflet.js (Frontend map)

- Axios (Weather API integration)

## 🎉 Additional Features Beyond Mandatory Requirements
- Clickable Selections: Clickable airline and airport names under search results.

- Map Route Visualization: Interactive map dynamically displays routes.

- Live Weather Information: Fetch high/low daily temperatures for airports using Open-Meteo API.

- Dynamic Airline Name Display: Shows airline names alongside their codes.

## Improved UI:

- Upgraded to Poppins font.

- Clean, card-based layouts.

- Smooth hover and click effects.

- Reduced User Inputs: Dynamic clickable selections instead of manual typing.

## 🌟 Optional Enhancements
- Automatic Map Zooming: Map auto-zooms to fit selected route paths.

- Clear Error Handling: User-friendly messages for errors like "No routes found" or "Airport not found".

- Code Optimization: Clean, modular JavaScript code for easy maintenance.

## 👩‍💻 Author
- Palak Shah
- GitHub: PalakShah19
