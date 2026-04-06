import axios from 'axios'

function getToken() {
  var search = window.location.search
  if (!search) return ''
  var match = search.match(new RegExp('[?&]token=([^&]*)'))
  if (match) return match[1]
  return ''
}

var currentToken = getToken()

function proxyImage(url) {
  if (!url) return ''
  var tokenParam = currentToken ? '&token=' + currentToken : ''
  return '/media/image?url=' + encodeURIComponent(url) + tokenParam
}

var http = axios.create({
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(function(config) {
  if (currentToken) {
    if (!config.params) config.params = {}
    config.params.token = currentToken
  }
  return config
})

http.interceptors.response.use(
  function(response) {
    return response.data
  },
  function(error) {
    return Promise.reject(error)
  }
)

function initSession() {
  return Promise.resolve(currentToken)
}

function getSid() {
  return currentToken
}

function setSid(newSid) {
  // Not used in single-tenant mode
}

export default {
  http: http,
  initSession: initSession,
  getSid: getSid,
  setSid: setSid,
  proxyImage: proxyImage,
  getToken: function() { return currentToken },
}
