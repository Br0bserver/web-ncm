import httpModule from './http'

var http = httpModule.http

function search(keywords, type, limit, offset) {
  var params = { keywords: keywords }
  if (type) params.type = type
  if (limit) params.limit = limit
  if (offset) params.offset = offset
  return http.get('/api/search', { params: params })
}

function getPlaylistDetail(id) {
  return http.get('/api/playlist/detail', { params: { id: id } })
}

function getSongDetail(ids) {
  return http.get('/api/song/detail', { params: { ids: ids } })
}

function getLyric(id) {
  return http.get('/api/song/lyric', { params: { id: id } })
}

function getRecommendPlaylists() {
  return http.get('/api/recommend/playlists')
}

function getAlbumDetail(id) {
  return http.get('/api/album', { params: { id: id } })
}

function getArtist(id) {
  return http.get('/api/artist', { params: { id: id } })
}

export default {
  search: search,
  getPlaylistDetail: getPlaylistDetail,
  getSongDetail: getSongDetail,
  getLyric: getLyric,
  getRecommendPlaylists: getRecommendPlaylists,
  getAlbumDetail: getAlbumDetail,
  getArtist: getArtist,
}
