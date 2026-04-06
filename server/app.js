var express = require('express')
var path = require('path')
var config = require('./config')
var cookieParser = require('cookie-parser')

var app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(function(req, res, next) {
  var token = req.query.token || req.headers['x-access-token']
  // 放行 Webpack 静态资源目录，因为 HTML 里的 script/link 标签无法自动带上 token
  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/fonts/') || req.path.startsWith('/img/')) {
    return next()
  }
  if (token !== config.ACCESS_TOKEN) {
    return res.status(401).send('Unauthorized. Please provide valid token.')
  }
  next()
})

var sessionRouter = require('./routes/session')
var authRouter = require('./routes/auth')
var userRouter = require('./routes/user')
var searchRouter = require('./routes/search')
var playlistRouter = require('./routes/playlist')
var musicRouter = require('./routes/music')
var recommendRouter = require('./routes/recommend')
var albumRouter = require('./routes/album')
var artistRouter = require('./routes/artist')
var mediaRouter = require('./routes/media')

app.use('/api/session', sessionRouter)
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/search', searchRouter)
app.use('/api/playlist', playlistRouter)
app.use('/api/song', musicRouter)
app.use('/api/recommend/playlists', recommendRouter)
app.use('/api/album', albumRouter)
app.use('/api/artist', artistRouter)
app.use('/media', mediaRouter)

var distPath = path.join(__dirname, '..', 'client', 'dist')
try {
  var fs = require('fs')
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))
    app.get('*', function(req, res) {
      res.sendFile(path.join(distPath, 'index.html'))
    })
  }
} catch (e) {}

app.use(function(err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({ code: 500, message: 'Internal server error' })
})

app.listen(config.PORT, function() {
  console.log('web-ncm server running on port ' + config.PORT)
})

module.exports = app
