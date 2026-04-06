var express = require('express')
var router = express.Router()
var sessionStore = require('../session-store')

router.post('/init', function(req, res) {
  if (req.session) {
    res.json({
      code: 200,
      data: { sid: req.session.id },
    })
    return
  }
  var session = sessionStore.create()
  res.cookie('sid', session.id, {
    httpOnly: false,
    sameSite: 'strict',
    maxAge: 2592000000,
    path: '/',
  })
  res.json({
    code: 200,
    data: { sid: session.id },
  })
})

module.exports = router
