var path = require('path')
var fs = require('fs')
var dataFile = path.join(__dirname, 'sessions.json')
var ncm = require('./services/ncm')
var config = require('./config')

var globalSession = {
  id: 'global-session',
  createdAt: Date.now(),
  lastAccess: Date.now(),
  ncmCookie: null,
  ncmCookies: {},
  userId: null,
  userInfo: null,
  qrKey: null,
  loggedIn: false,
  cookieRefreshed: false,
  lastCookieRefresh: 0,
  bgMode: 'dark',
}

var REFRESH_INTERVAL = 43200000

function loadPersisted() {
  try {
    if (fs.existsSync(dataFile)) {
      var raw = fs.readFileSync(dataFile, 'utf8')
      var data = JSON.parse(raw)
      if (data && data.id === 'global-session') {
        globalSession = data
        if (!globalSession.bgMode) globalSession.bgMode = 'dark'
      } else {
        var keys = Object.keys(data)
        for (var i = 0; i < keys.length; i++) {
          if (data[keys[i]].loggedIn) {
            globalSession = Object.assign({}, globalSession, data[keys[i]], { id: 'global-session' })
            break
          }
        }
      }
    }
  } catch (e) {}
}

function savePersisted() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(globalSession), 'utf8')
  } catch (e) {}
}

loadPersisted()

function create() {
  return globalSession
}

function get(id) {
  globalSession.lastAccess = Date.now()
  return globalSession
}

function destroy(id) {
  globalSession.ncmCookie = null
  globalSession.ncmCookies = {}
  globalSession.userId = null
  globalSession.userInfo = null
  globalSession.qrKey = null
  globalSession.loggedIn = false
  savePersisted()
}

function cleanup() {
  var now = Date.now()
  if (globalSession.loggedIn && globalSession.ncmCookie && (now - globalSession.lastCookieRefresh > REFRESH_INTERVAL)) {
    refreshCookie(globalSession)
  }
}

function refreshCookie(session) {
  if (!session.ncmCookie) return
  console.log('[Session] Auto-refreshing global cookie for user:', session.userId)
  ncm.call('login_refresh', { timestamp: Date.now() }, session.ncmCookie)
    .then(function(result) {
      if (result && result.cookie) {
        var newCookie = ''
        if (Array.isArray(result.cookie)) {
          newCookie = result.cookie.join('; ')
        } else if (typeof result.cookie === 'string') {
          newCookie = result.cookie
        }
        if (newCookie && newCookie.indexOf('MUSIC_U') !== -1) {
          session.ncmCookie = newCookie
          session.lastCookieRefresh = Date.now()
          session.cookieRefreshed = true
          console.log('[Session] Global cookie refreshed successfully for:', session.userId)
          savePersisted()
        } else {
          console.warn('[Session] Global cookie refresh returned invalid cookie for:', session.userId)
        }
      }
    })
    .catch(function(err) {
      console.error('[Session] Failed to refresh global cookie for:', session.userId, err)
    })
}

function save() {
  savePersisted()
}

function setBgMode(mode) {
  globalSession.bgMode = mode
  savePersisted()
}

setInterval(cleanup, 600000)

module.exports = {
  create: create,
  get: get,
  destroy: destroy,
  cleanup: cleanup,
  refreshCookie: refreshCookie,
  save: save,
  setBgMode: setBgMode,
}
