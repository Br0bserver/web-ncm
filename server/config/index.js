module.exports = {
  PORT: process.env.PORT || 3000,
  NCM_API_BASE: process.env.NCM_API_BASE || 'http://localhost:4000',
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || 'secret',
  SESSION_TTL: parseInt(process.env.SESSION_TTL, 10) || 2592000000,
  CLEANUP_INTERVAL: parseInt(process.env.CLEANUP_INTERVAL, 10) || 600000,
}
