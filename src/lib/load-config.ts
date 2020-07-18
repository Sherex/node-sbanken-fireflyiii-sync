import dotenv from 'dotenv'
dotenv.config()

/**
 * @namespace
 * @prop {string} baseUrlApi         - The base url for API requests. Defaults to "https://api.sbanken.no"
 * @prop {string} baseUrlAuth         - The base url for auth requests. Defaults to "https://auth.sbanken.no"
 * @prop {string} applicationId       - Application ID received from https://sbanken.no/bruke/utviklerportalen/
 * @prop {string} applicationSecret   - Application secret received from https://sbanken.no/bruke/utviklerportalen/
 * @prop {string} customerId          - Your norwegian "personnummer" (11 digits) https://en.wikipedia.org/wiki/National_identification_number#Norway
 */
const sbanken = {
  baseUrlApi: env('SB_BASE_URL_API', 'https://api.sbanken.no'),
  baseUrlAuth: env('SB_BASE_URL_AUTH', 'https://auth.sbanken.no'),
  applicationId: env('SB_APPLICATION_ID'),
  applicationSecret: env('SB_APPLICATION_SECRET'),
  customerId: env('SB_CUSTOMER_ID')
}

const firefly = {
  clientId: env('FF_CLIENT_ID'),
  clientSecret: env('FF_CLIENT_SECRET'),
  clientCallback: env('FF_CLIENT_CALLBACK', 'http://localhost:8123'),
  baseUrl: env('FF_BASE_URL')
}

export {
  sbanken,
  firefly
}

function env (env: string, defaultValue?: string): string {
  const value = process.env[env]
  if (typeof value === 'string') return value
  if (typeof defaultValue === 'string') return defaultValue
  throw Error(`Missing required environment variable "${env}"!`)
}
