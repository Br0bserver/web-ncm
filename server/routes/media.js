var express = require('express')
var router = express.Router()
var axios = require('axios')
var http = require('http')
var https = require('https')
var url = require('url')
var ncm = require('../services/ncm')
var sessionMiddleware = require('../middleware/session')

router.get('/image', function(req, res) {
  var imgUrl = req.query.url
  if (!imgUrl) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }
  axios.get(imgUrl, {
    responseType: 'arraybuffer',
    timeout: 15000,
  }).then(function(response) {
    var contentType = response.headers['content-type'] || 'image/jpeg'
    res.set('Content-Type', contentType)
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(response.data)
  }).catch(function() {
    res.status(404).json({ error: 'Image not found' })
  })
})

router.get('/audio', sessionMiddleware, function(req, res) {
  var songId = req.query.id
  if (!songId) {
    return res.status(400).json({ error: 'Missing id parameter' })
  }
  ncm.call('song_url_v1', { id: songId, level: 'standard', timestamp: Date.now() }, req.session.ncmCookie)
    .then(function(result) {
      if (!result || !result.body || !result.body.data || !result.body.data.length) {
        return res.status(404).json({ error: 'Audio not found' })
      }
      var audioUrl = result.body.data[0].url
      if (!audioUrl) {
        return res.status(404).json({ error: 'No audio URL' })
      }
      var parsedUrl = url.parse(audioUrl)
      var client = parsedUrl.protocol === 'https:' ? https : http
      var options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.path,
        method: 'GET',
        headers: {},
      }
      if (req.headers.range) {
        options.headers.Range = req.headers.range
      }
      client.request(options, function(audioRes) {
        res.status(audioRes.statusCode)
        if (audioRes.headers['content-type']) {
          res.set('Content-Type', audioRes.headers['content-type'])
        }
        if (audioRes.headers['content-length']) {
          res.set('Content-Length', audioRes.headers['content-length'])
        }
        if (audioRes.headers['accept-ranges']) {
          res.set('Accept-Ranges', audioRes.headers['accept-ranges'])
        }
        if (audioRes.headers['content-range']) {
          res.set('Content-Range', audioRes.headers['content-range'])
        }
        res.set('Cache-Control', 'public, max-age=3600')
        audioRes.pipe(res)
      }).on('error', function() {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Audio proxy failed' })
        }
      }).end()
    })
    .catch(function() {
      res.status(500).json({ error: 'Failed to get audio URL' })
    })
})

router.get('/video', function(req, res) {
  var fs = require('fs')
  var path = require('path')
  var videoDir = path.join(__dirname, '..', 'video')
  if (!fs.existsSync(videoDir)) {
    return res.status(404).send('Video directory not found')
  }
  var files = fs.readdirSync(videoDir)
  var mp4File = null
  for (var i = 0; i < files.length; i++) {
    if (files[i].endsWith('.mp4')) {
      mp4File = files[i]
      break
    }
  }
  if (!mp4File) {
    return res.status(404).send('No mp4 video found')
  }
  res.sendFile(path.join(videoDir, mp4File))
})

module.exports = router
