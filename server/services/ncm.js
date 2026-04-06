var path = require('path')
var apiBase = path.join(__dirname, '..', '..', 'vendor', 'api-enhanced')

// Load api-enhanced request utility once
var request = require(path.join(apiBase, 'util', 'request.js'))

function call(moduleName, params, cookie) {
  var modPath = path.join(apiBase, 'module', moduleName + '.js')
  var mod = require(modPath)
  var query = params || {}
  if (cookie) {
    query.cookie = cookie
  }
  return mod(query, request)
}

function extractCookie(result) {
  if (!result || !result.cookie) return ''
  if (Array.isArray(result.cookie)) {
    return result.cookie.join('; ')
  }
  if (typeof result.cookie === 'string') {
    return result.cookie
  }
  return ''
}

module.exports = {
  call: call,
  extractCookie: extractCookie,
}
