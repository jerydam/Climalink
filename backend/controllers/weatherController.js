const { getCurrentWeather, getWeatherForecast } = require('../services/weatherService');

exports.getCurrentWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) throw new Error('Latitude and longitude required');
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) throw new Error('Invalid coordinates');
    const weather = await getCurrentWeather(lat, lon);
    res.json(weather);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getWeatherForecast = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) throw new Error('Latitude and longitude required');
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) throw new Error('Invalid coordinates');
    const forecast = await getWeatherForecast(lat, lon);
    res.json(forecast);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

