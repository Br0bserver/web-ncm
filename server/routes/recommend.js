var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/', sessionMiddleware, function(req, res, next) {
  ncm.call('top_playlist', { limit: 30, cat: '全部', timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get playlists' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Failed' })
      }
      var playlists = body.playlists || []
      res.json({ code: 200, data: playlists })
    })
    .catch(next)
})

module.exports = router
