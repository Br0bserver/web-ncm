var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/', sessionMiddleware, function(req, res, next) {
  var params = {
    keywords: req.query.keywords || '',
    type: req.query.type || 1,
    limit: req.query.limit || 30,
    offset: req.query.offset || 0,
    timestamp: Date.now(),
  }
  ncm.call('search', params, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Search failed' })
      }
      var body = result.body
      if (body.code !== 200) {
        return res.json({ code: body.code, message: 'Search failed' })
      }
      var data = body.result || {}
      res.json({ code: 200, data: data })
    })
    .catch(next)
})

module.exports = router
