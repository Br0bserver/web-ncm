import httpModule from './http'

var http = httpModule.http

function getProfile() {
  return http.get('/api/user/profile')
}

function getPlaylists(uid) {
  var params = {}
  if (uid) params.uid = uid
  return http.get('/api/user/playlists', { params: params })
}

export default {
  getProfile: getProfile,
  getPlaylists: getPlaylists,
}
