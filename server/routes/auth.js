var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')
var sessionStore = require('../session-store')

router.post('/qr/create', sessionMiddleware, function(req, res, next) {
  var cookie = req.session.ncmCookie || ''
  ncm.call('login_qr_key', { timestamp: Date.now() }, cookie)
    .then(function(keyResult) {
      if (!keyResult || !keyResult.body || !keyResult.body.data || !keyResult.body.data.unikey) {
        return res.json({ code: 500, message: 'Failed to create QR key' })
      }
      var key = keyResult.body.data.unikey
      var keyCookie = ncm.extractCookie(keyResult)
      if (keyCookie) {
        req.session.ncmCookie = keyCookie
      }
      req.session.qrKey = key
      return ncm.call('login_qr_create', { key: key, qrimg: true, timestamp: Date.now() }, req.session.ncmCookie)
    })
    .then(function(qrResult) {
      if (!qrResult || !qrResult.body || !qrResult.body.data) {
        return res.json({ code: 500, message: 'Failed to create QR' })
      }
      var data = qrResult.body.data
      res.json({
        code: 200,
        data: {
          qrimg: data.qrimg || '',
          qrurl: data.qrurl || '',
        },
      })
    })
    .catch(next)
})

router.get('/qr/check', sessionMiddleware, function(req, res, next) {
  if (!req.session.qrKey) {
    return res.json({ code: 400, message: 'No QR key' })
  }
  var cookie = req.session.ncmCookie || ''
  ncm.call('login_qr_check', { key: req.session.qrKey, timestamp: Date.now() }, cookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'No response' })
      }
      var body = result.body
      var code = body.code
      var cookieStr = ncm.extractCookie(result)

      if (code === 803 && cookieStr) {
        req.session.ncmCookie = cookieStr
        req.session.loggedIn = true
        req.session.lastCookieRefresh = Date.now()
        req.session.cookieRefreshed = false
        sessionStore.save()
      }

      res.json({
        code: 200,
        data: {
          code: code,
          message: body.message || body.msg || '',
          cookie: code === 803 ? cookieStr : '',
        },
      })
    })
    .catch(next)
})

router.get('/status', sessionMiddleware, function(req, res) {
  res.json({
    code: 200,
    data: {
      loggedIn: req.session.loggedIn,
      userInfo: req.session.userInfo,
      bgMode: req.session.bgMode || 'dark',
    },
  })
})

router.post('/logout', sessionMiddleware, function(req, res, next) {
  if (req.session.ncmCookie) {
    ncm.call('logout', { timestamp: Date.now() }, req.session.ncmCookie)
      .catch(function() {})
  }
  sessionStore.destroy(req.session.id)
  res.json({ code: 200, message: 'Logged out' })
})

router.post('/refresh', sessionMiddleware, function(req, res) {
  if (!req.session.loggedIn || !req.session.ncmCookie) {
    return res.json({ code: 400, message: 'Not logged in' })
  }
  sessionStore.refreshCookie(req.session)
  res.json({ code: 200, message: 'Cookie refresh initiated' })
})

router.post('/bg-mode', sessionMiddleware, function(req, res) {
  var mode = req.body.mode
  if (mode === 'dark' || mode === 'flow') {
    sessionStore.setBgMode(mode)
    res.json({ code: 200, data: mode })
  } else {
    res.json({ code: 400, message: 'Invalid mode' })
  }
})

module.exports = router
