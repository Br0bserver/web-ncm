var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/profile', sessionMiddleware, function(req, res, next) {
  ncm.call('user_account', { timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get profile' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Not logged in' })
      }
      var profile = body.profile || {}
      req.session.userId = profile.userId
      req.session.userInfo = profile
      res.json({ code: 200, data: profile })
    })
    .catch(next)
})

router.get('/playlists', sessionMiddleware, function(req, res, next) {
  var uid = req.query.uid || req.session.userId
  if (!uid) {
    return res.json({ code: 400, message: 'No uid' })
  }
  ncm.call('user_playlist', { uid: uid, limit: req.query.limit || 1000, timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get playlists' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Failed' })
      }
      var list = body.playlist || []
      res.json({ code: 200, data: list })
    })
    .catch(next)
})

module.exports = router
