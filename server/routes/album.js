var express = require('express')
var router = express.Router()
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/', sessionMiddleware, function(req, res, next) {
  var id = req.query.id
  if (!id) {
    return res.json({ code: 400, message: 'No id' })
  }
  ncm.call('album', { id: id, timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body) {
        return res.json({ code: 500, message: 'Failed to get album' })
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
