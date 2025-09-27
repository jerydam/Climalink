// lib/validation/weather-validation.ts

// Constants for validation
export const WEATHER_CONSTANTS = {
  TEMP_MIN: -50, // Minimum temperature in Celsius
  TEMP_MAX: 60,  // Maximum temperature in Celsius
  TEMP_OFFSET: 273.15, // Kelvin-like offset to avoid negative numbers (0°C = 273.15)
  TEMP_PRECISION: 100, // Multiply by 100 for contract storage
  HUMIDITY_MIN: 0,
  HUMIDITY_MAX: 100,
  COORDINATE_PRECISION: 1000000, // Multiply by 1M for contract storage
  MAX_NOTES_LENGTH: 500,
  MAX_PHOTO_SIZE: 5 * 1024 * 1024, // 5MB
} as const

// Safe integer limits for int128
export const INT128_LIMITS = {
  MAX: BigInt(2) ** BigInt(127) - BigInt(1),
  MIN: -(BigInt(2) ** BigInt(127))
} as const

// Weather condition options
export const WEATHER_CONDITIONS = [
  { value: "sunny", label: "Sunny", icon: "☀️" },
  { value: "cloudy", label: "Cloudy", icon: "☁️" },
  { value: "partly-cloudy", label: "Partly Cloudy", icon: "⛅" },
  { value: "overcast", label: "Overcast", icon: "🌫️" },
  { value: "light-rain", label: "Light Rain", icon: "🌦️" },
  { value: "rain", label: "Rain", icon: "🌧️" },
  { value: "heavy-rain", label: "Heavy Rain", icon: "⛈️" },
  { value: "drizzle", label: "Drizzle", icon: "🌦️" },
  { value: "snow", label: "Snow", icon: "❄️" },
  { value: "sleet", label: "Sleet", icon: "🌨️" },
  { value: "hail", label: "Hail", icon: "🧊" },
  { value: "fog", label: "Fog", icon: "🌫️" },
  { value: "mist", label: "Mist", icon: "🌫️" },
  { value: "windy", label: "Windy", icon: "💨" },
  { value: "thunderstorm", label: "Thunderstorm", icon: "⛈️" },
] as const

// Validation error types
export interface ValidationError {
  field: string
  message: string
  code: string
}

// Validation result type
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validates temperature value
 */
export function validateTemperature(
  temp: number, 
  min: number = WEATHER_CONSTANTS.TEMP_MIN, 
  max: number = WEATHER_CONSTANTS.TEMP_MAX
): ValidationResult {
  const errors: ValidationError[] = []

  if (isNaN(temp)) {
    errors.push({
      field: 'temperature',
      message: 'Temperature must be a valid number',
      code: 'INVALID_NUMBER'
    })
  } else if (temp < min || temp > max) {
    errors.push({
      field: 'temperature',
      message: `Temperature must be between ${min}°C and ${max}°C`,
      code: 'OUT_OF_RANGE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates humidity value
 */
export function validateHumidity(humidity: number): ValidationResult {
  const errors: ValidationError[] = []

  if (isNaN(humidity)) {
    errors.push({
      field: 'humidity',
      message: 'Humidity must be a valid number',
      code: 'INVALID_NUMBER'
    })
  } else if (humidity < WEATHER_CONSTANTS.HUMIDITY_MIN || humidity > WEATHER_CONSTANTS.HUMIDITY_MAX) {
    errors.push({
      field: 'humidity',
      message: `Humidity must be between ${WEATHER_CONSTANTS.HUMIDITY_MIN}% and ${WEATHER_CONSTANTS.HUMIDITY_MAX}%`,
      code: 'OUT_OF_RANGE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates coordinates (latitude and longitude)
 */
export function validateCoordinates(lat: number, lng: number): ValidationResult {
  const errors: ValidationError[] = []

  if (isNaN(lat) || isNaN(lng)) {
    errors.push({
      field: 'coordinates',
      message: 'Coordinates must be valid numbers',
      code: 'INVALID_NUMBER'
    })
  } else {
    if (lat < -90 || lat > 90) {
      errors.push({
        field: 'latitude',
        message: 'Latitude must be between -90 and 90',
        code: 'OUT_OF_RANGE'
      })
    }
    if (lng < -180 || lng > 180) {
      errors.push({
        field: 'longitude',
        message: 'Longitude must be between -180 and 180',
        code: 'OUT_OF_RANGE'
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates weather condition
 */
export function validateWeatherCondition(weather: string): ValidationResult {
  const errors: ValidationError[] = []
  const validConditions = WEATHER_CONDITIONS.map(c => c.value)

  if (!weather || weather.trim().length === 0) {
    errors.push({
      field: 'weather',
      message: 'Weather condition is required',
      code: 'REQUIRED'
    })
  } else if (!validConditions.includes(weather)) {
    errors.push({
      field: 'weather',
      message: `Weather condition must be one of: ${validConditions.join(', ')}`,
      code: 'INVALID_VALUE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates location string
 */
export function validateLocation(location: string): ValidationResult {
  const errors: ValidationError[] = []

  if (!location || location.trim().length === 0) {
    errors.push({
      field: 'location',
      message: 'Location is required',
      code: 'REQUIRED'
    })
  } else if (location.trim().length < 3) {
    errors.push({
      field: 'location',
      message: 'Location must be at least 3 characters long',
      code: 'TOO_SHORT'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates notes field
 */
export function validateNotes(notes: string): ValidationResult {
  const errors: ValidationError[] = []

  if (notes && notes.length > WEATHER_CONSTANTS.MAX_NOTES_LENGTH) {
    errors.push({
      field: 'notes',
      message: `Notes must not exceed ${WEATHER_CONSTANTS.MAX_NOTES_LENGTH} characters`,
      code: 'TOO_LONG'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates photo file
 */
export function validatePhoto(file: File): ValidationResult {
  const errors: ValidationError[] = []

  if (!file.type.startsWith('image/')) {
    errors.push({
      field: 'photo',
      message: 'File must be an image',
      code: 'INVALID_TYPE'
    })
  }

  if (file.size > WEATHER_CONSTANTS.MAX_PHOTO_SIZE) {
    errors.push({
      field: 'photo',
      message: `Photo must be smaller than ${WEATHER_CONSTANTS.MAX_PHOTO_SIZE / 1024 / 1024}MB`,
      code: 'TOO_LARGE'
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Safe conversion functions for blockchain storage
 */
export class WeatherDataConverter {
  /**
   * Safely converts temperature to uint format for smart contract
   * Uses Kelvin-like offset (adds 273.15) to ensure always positive uint
   */
  static convertTemperature(tempCelsius: number): number {
    const validation = validateTemperature(tempCelsius)
    if (!validation.isValid) {
      throw new Error(`Temperature validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Add offset to make temperature always positive (like Kelvin)
    // 0°C becomes 273.15, -50°C becomes 223.15, +60°C becomes 333.15
    const offsetTemp = tempCelsius + WEATHER_CONSTANTS.TEMP_OFFSET
    
    // Multiply by precision factor and round to integer
    const converted = Math.round(offsetTemp * WEATHER_CONSTANTS.TEMP_PRECISION)

    // Ensure result is positive (should always be with our offset)
    if (converted < 0) {
      throw new Error(`Temperature conversion resulted in negative value: ${converted}`)
    }

    // Check for reasonable upper bound (should be around 33315 for 60°C)
    const maxExpected = (WEATHER_CONSTANTS.TEMP_MAX + WEATHER_CONSTANTS.TEMP_OFFSET) * WEATHER_CONSTANTS.TEMP_PRECISION
    if (converted > maxExpected + 1000) { // Add small buffer for rounding
      throw new Error(`Temperature conversion ${converted} exceeds expected maximum ${maxExpected}`)
    }

    return converted
  }

  /**
   * Safely converts coordinates to int128 format for smart contract
   */
  static convertCoordinate(coord: number): number {
    const converted = Math.round(coord * WEATHER_CONSTANTS.COORDINATE_PRECISION)

    // Check int128 range
    if (BigInt(converted) > INT128_LIMITS.MAX || BigInt(converted) < INT128_LIMITS.MIN) {
      throw new Error(`Coordinate conversion ${converted} is out of int128 range`)
    }

    return converted
  }

  /**
   * Converts temperature back from uint format to Celsius
   */
  static parseTemperature(contractTemp: number): number {
    // Reverse the conversion: divide by precision, then subtract offset
    const offsetTemp = contractTemp / WEATHER_CONSTANTS.TEMP_PRECISION
    return offsetTemp - WEATHER_CONSTANTS.TEMP_OFFSET
  }

  /**
   * Converts coordinate back from int128 format
   */
  static parseCoordinate(contractCoord: number): number {
    return contractCoord / WEATHER_CONSTANTS.COORDINATE_PRECISION
  }

  /**
   * Get the contract-ready temperature value with debugging info
   */
  static convertTemperatureWithDebug(tempCelsius: number): { converted: number, debug: any } {
    const offsetTemp = tempCelsius + WEATHER_CONSTANTS.TEMP_OFFSET
    const converted = Math.round(offsetTemp * WEATHER_CONSTANTS.TEMP_PRECISION)
    
    return {
      converted,
      debug: {
        originalCelsius: tempCelsius,
        afterOffset: offsetTemp,
        afterPrecision: converted,
        expectedRange: {
          min: (WEATHER_CONSTANTS.TEMP_MIN + WEATHER_CONSTANTS.TEMP_OFFSET) * WEATHER_CONSTANTS.TEMP_PRECISION,
          max: (WEATHER_CONSTANTS.TEMP_MAX + WEATHER_CONSTANTS.TEMP_OFFSET) * WEATHER_CONSTANTS.TEMP_PRECISION
        }
      }
    }
  }
}

/**
 * Weather data interface
 */
export interface WeatherData {
  temperature: number
  humidity: number
  weather: string
  notes: string
  photo?: File
}

/**
 * Location data interface
 */
export interface LocationData {
  location: string
  coordinates: {
    lat: number
    lng: number
  }
}

/**
 * Complete weather report interface
 */
export interface WeatherReport {
  weather: WeatherData
  location: LocationData
}

/**
 * Blockchain-ready report data interface
 */
export interface ContractReportData {
  weather: string
  temperature: number
  humidity: number
  location: string
  longitude: number
  latitude: number
}

/**
 * Validates complete weather report
 */
export function validateWeatherReport(report: WeatherReport): ValidationResult {
  const allErrors: ValidationError[] = []

  // Validate weather data
  const tempValidation = validateTemperature(report.weather.temperature)
  const humidityValidation = validateHumidity(report.weather.humidity)
  const weatherValidation = validateWeatherCondition(report.weather.weather)
  const notesValidation = validateNotes(report.weather.notes)

  // Validate location data
  const locationValidation = validateLocation(report.location.location)
  const coordValidation = validateCoordinates(
    report.location.coordinates.lat,
    report.location.coordinates.lng
  )

  // Validate photo if provided
  let photoValidation: ValidationResult = { isValid: true, errors: [] }
  if (report.weather.photo) {
    photoValidation = validatePhoto(report.weather.photo)
  }

  // Collect all errors
  allErrors.push(
    ...tempValidation.errors,
    ...humidityValidation.errors,
    ...weatherValidation.errors,
    ...notesValidation.errors,
    ...locationValidation.errors,
    ...coordValidation.errors,
    ...photoValidation.errors
  )

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  }
}

/**
 * Converts weather report to blockchain-ready format
 */
export function convertToContractData(report: WeatherReport): ContractReportData {
  // Validate first
  const validation = validateWeatherReport(report)
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
  }

  try {
    return {
      weather: report.weather.weather.trim(),
      temperature: WeatherDataConverter.convertTemperature(report.weather.temperature),
      humidity: Math.round(report.weather.humidity),
      location: report.location.location.trim(),
      longitude: WeatherDataConverter.convertCoordinate(report.location.coordinates.lng),
      latitude: WeatherDataConverter.convertCoordinate(report.location.coordinates.lat),
    }
  } catch (error) {
    throw new Error(`Data conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Helper function to get user-friendly error messages
 */
export function getErrorSummary(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  if (errors.length === 1) return errors[0].message
  return `Multiple issues found: ${errors.map(e => e.message).join('; ')}`
}

/**
 * Helper function to check if temperature is in a reasonable range for Earth
 */
export function isReasonableEarthTemperature(temp: number): boolean {
  // Extreme recorded temperatures on Earth: -89.2°C to 56.7°C
  // We use a slightly wider range for validation
  return temp >= -95 && temp <= 65
}

/**
 * Helper function to get temperature color coding
 */
export function getTemperatureColor(temp: number): string {
  if (temp <= 0) return "text-blue-600"
  if (temp <= 10) return "text-blue-500"
  if (temp <= 20) return "text-green-600"
  if (temp <= 30) return "text-yellow-600"
  if (temp <= 40) return "text-orange-600"
  return "text-red-600"
}

/**
 * Helper function to get humidity color coding
 */
export function getHumidityColor(humidity: number): string {
  if (humidity <= 30) return "text-orange-600" // Dry
  if (humidity <= 70) return "text-green-600"  // Comfortable
  return "text-blue-600" // Humid
}