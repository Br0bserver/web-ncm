var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/detail', sessionMiddleware, function(req, res, next) {
  var id = req.query.id
  if (!id) {
    return res.json({ code: 400, message: 'No id' })
  }
  ncm.call('playlist_detail', { id: id, timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get playlist' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Failed' })
      }
      var playlist = body.playlist || {}
      res.json({ code: 200, data: playlist })
    })
    .catch(next)
})

module.exports = router
