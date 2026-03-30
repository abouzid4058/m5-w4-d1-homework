// ─── Imports ────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import './App.css';

// i18n-iso-countries: converts country codes (e.g. "US") to full names
import countries from 'i18n-iso-countries';

// Bootstrap CSS for layout and form styling
import 'bootstrap/dist/css/bootstrap.min.css';

// Font Awesome React component + specific icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTemperatureLow,
  faTemperatureHigh,
  faMapMarkerAlt,
} from '@fortawesome/free-solid-svg-icons';

// ─── Register English locale for i18n-iso-countries ─────────────────────────
// Required when using the package in a browser environment.
// This tells the library to load only English, minimizing bundle size.
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

// ─── App Component ──────────────────────────────────────────────────────────
function App() {

  // ── State ────────────────────────────────────────────────────────────────

  // apiData: stores the full JSON response from OpenWeatherMap
  const [apiData, setApiData] = useState({});

  // getState: live value typed in the input field
  const [getState, setGetState] = useState('Irvine, USA');

  // state: committed search value — updated only when Search is clicked.
  // Separating these two prevents re-fetching on every keystroke.
  const [state, setState] = useState('Irvine, USA');

  // ── API Key & URL ────────────────────────────────────────────────────────

  // Read the API key from the .env file (prefix REACT_APP_ is required by CRA)
  const apiKey = process.env.REACT_APP_API_KEY;

  // Build the full request URL using the committed search state
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${state}&appid=${apiKey}`;

  // ── Side Effect: Fetch Weather Data ─────────────────────────────────────
  // useEffect runs after render. The dependency array [apiUrl] means it only
  // re-runs when apiUrl changes (i.e. when the user submits a new location).
  useEffect(() => {
    fetch(apiUrl)
      .then((res) => {
        // If the API responds with an error (e.g. 404 city not found), throw it
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => setApiData(data))   // Store the parsed JSON in state
      .catch((err) => {
        console.error('Fetch failed:', err);
        // Reset apiData so the "No data found" fallback renders
        setApiData({});
      });
  }, [apiUrl]);

  // ── Handler Functions ────────────────────────────────────────────────────

  /**
   * inputHandler — fires on every keystroke in the text field.
   * Stores the current input value in getState.
   */
  const inputHandler = (event) => {
    setGetState(event.target.value);
  };

  /**
   * submitHandler — fires when the Search button is clicked.
   * Copies getState into state, which triggers a new API fetch via useEffect.
   */
  const submitHandler = () => {
    setState(getState);
  };

  /**
   * kelvinToFahrenheit — converts Kelvin (returned by OpenWeatherMap) to °F.
   * Formula: (K − 273.15) × 1.8 + 32, rounded to 0 decimal places.
   * @param {number} k - Temperature in Kelvin
   * @returns {string} Temperature in Fahrenheit (no decimals)
   */
  const kelvinToFahrenheit = (k) => {
    return ((k - 273.15) * 1.8 + 32).toFixed(0);
  };

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="App">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="d-flex justify-content-center align-items-center">
        <h2>React Weather App</h2>
      </header>

      {/* ── Main Container ─────────────────────────────────────────────── */}
      <div className="container">

        {/* ── Search Form ──────────────────────────────────────────────── */}
        <div className="mt-3 d-flex flex-column justify-content-center align-items-center">

          {/* Label */}
          <div className="col-auto">
            <label htmlFor="location-name" className="col-form-label">
              Enter Location :
            </label>
          </div>

          {/* Text Input — controlled component bound to getState */}
          <div className="col-auto">
            <input
              type="text"
              id="location-name"
              className="form-control"
              onChange={inputHandler}
              value={getState}
            />
          </div>

          {/* Search Button — triggers submitHandler on click */}
          <button
            className="btn btn-primary mt-2"
            onClick={submitHandler}
          >
            Search
          </button>

        </div>
        {/* END Search Form */}

        {/* ── Weather Card ─────────────────────────────────────────────── */}
        <div className="card mt-3 mx-auto">

          {/*
            Ternary operator:
            - If apiData.main exists → API returned valid data → show weather
            - Otherwise             → show a fallback message
          */}
          {apiData.main ? (

            // ── Weather Data Display ──────────────────────────────────
            <div className="card-body text-center">

              {/* Weather status icon from OpenWeatherMap's icon set */}
              <img
                src={`http://openweathermap.org/img/w/${apiData.weather[0].icon}.png`}
                alt="weather status icon"
                className="weather-icon"
              />

              {/* Current temperature (converted from Kelvin to °F) */}
              <p className="h2">
                {kelvinToFahrenheit(apiData.main.temp)}&deg; F
              </p>

              {/* City name with a map marker icon */}
              <p className="h5">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="fas fa-1x mr-2 text-dark"
                />{' '}
                <strong>{apiData.name}</strong>
              </p>

              {/* ── Second Row: Low/High Temp | Status/Country ──────── */}
              <div className="row mt-4">

                {/* Left Column: Low & High temperatures */}
                <div className="col-md-6">

                  {/* Low temperature */}
                  <p>
                    <FontAwesomeIcon
                      icon={faTemperatureLow}
                      className="fas fa-1x mr-2 text-primary"
                    />{' '}
                    <strong>
                      {kelvinToFahrenheit(apiData.main.temp_min)}&deg; F
                    </strong>
                  </p>

                  {/* High temperature */}
                  <p>
                    <FontAwesomeIcon
                      icon={faTemperatureHigh}
                      className="fas fa-1x mr-2 text-danger"
                    />{' '}
                    <strong>
                      {kelvinToFahrenheit(apiData.main.temp_max)}&deg; F
                    </strong>
                  </p>

                </div>
                {/* END Left Column */}

                {/* Right Column: Weather description & Country */}
                <div className="col-md-6">

                  {/* Current weather status (e.g. "Clouds", "Rain") */}
                  <p>
                    {' '}
                    <strong>{apiData.weather[0].main}</strong>
                  </p>

                  {/* Full country name resolved from ISO 2-letter country code */}
                  <p>
                    <strong>
                      {' '}
                      {countries.getName(apiData.sys.country, 'en', {
                        select: 'official',
                      })}
                    </strong>
                  </p>

                </div>
                {/* END Right Column */}

              </div>
              {/* END Second Row */}

            </div>
            // END Weather Data Display

          ) : (

            // ── Fallback: no data yet or fetch failed ─────────────────
            <div className="card-body text-center">
              <h5 className="text-muted mt-3">
                {apiData.cod === '404'
                  ? '⚠️ City not found. Please check the location and try again.'
                  : 'Loading weather data...'}
              </h5>
            </div>

          )}

        </div>
        {/* END Weather Card */}

      </div>
      {/* END Main Container */}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="footer">
        &copy; React Weather App
      </footer>

    </div>
  );
}

export default App;
