var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/detail', sessionMiddleware, function(req, res, next) {
  var ids = req.query.ids
  if (!ids) {
    return res.json({ code: 400, message: 'No ids' })
  }
  ncm.call('song_detail', { ids: ids, timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get song detail' })
      }
      var songs = result.body.songs || []
      res.json({ code: 200, data: songs })
    })
    .catch(next)
})

router.get('/lyric', sessionMiddleware, function(req, res, next) {
  var id = req.query.id
  if (!id) {
    return res.json({ code: 400, message: 'No id' })
  }
  ncm.call('lyric_new', { id: id, timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get lyric' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Failed' })
      }
      res.json({ code: 200, data: body })
    })
    .catch(next)
})

module.exports = router
