const axios = require('axios');

exports.getCurrentWeather = async (latitude, longitude) => {
  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Invalid coordinates');
  }

  // Fetch from OpenWeatherMap API
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OpenWeatherMap API key not configured');

  const apiResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric', // Celsius
    },
  });

  const apiData = apiResponse.data;
  if (apiData.cod !== 200) throw new Error(`API Error: ${apiData.message}`);

  // Extract data
  return {
    latitude,
    longitude,
    temperature: apiData.main.temp,
    humidity: apiData.main.humidity,
    weatherCondition: apiData.weather[0].main || apiData.weather[0].description || 'Unknown',
    timestamp: apiData.dt * 1000, // Convert UNIX timestamp to Date
    confidence: 0.95,
  };
};

exports.getWeatherForecast = async (latitude, longitude) => {
  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error('Invalid coordinates');
  }

  // Fetch from OpenWeatherMap API
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) throw new Error('OpenWeatherMap API key not configured');

  const apiResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
    params: {
      lat: latitude,
      lon: longitude,
      appid: apiKey,
      units: 'metric', // Celsius
    },
  });

  const apiData = apiResponse.data;
  if (apiData.cod !== '200') throw new Error(`API Error: ${apiData.message}`);

  // Process forecast (5 days, 3-hour intervals)
  const forecastList = apiData.list.map(item => ({
    timestamp: new Date(item.dt * 1000), // Convert UNIX timestamp
    temperature: item.main.temp,
    humidity: item.main.humidity,
    weatherCondition: item.weather[0].main || item.weather[0].description || 'Unknown',
    confidence: 0.90, // Slightly lower for forecasts
  }));

  return {
    latitude,
    longitude,
    forecast: forecastList,
  };
};

