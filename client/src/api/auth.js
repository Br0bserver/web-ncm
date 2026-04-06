import httpModule from './http'

var http = httpModule.http

function createQr() {
  return http.post('/api/auth/qr/create')
}

function checkQr() {
  return http.get('/api/auth/qr/check')
}

function getAuthStatus() {
  return http.get('/api/auth/status')
}

function logout() {
  return http.post('/api/auth/logout')
}

function setBgMode(mode) {
  return http.post('/api/auth/bg-mode', { mode: mode })
}

export default {
  createQr: createQr,
  checkQr: checkQr,
  getAuthStatus: getAuthStatus,
  logout: logout,
  setBgMode: setBgMode,
}
