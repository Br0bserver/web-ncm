var sessionStore = require('../session-store')

function sessionMiddleware(req, res, next) {
  // 单点登录模式：不再读取和下发任何 sid Cookie 或 Header
  // 强制将所有请求绑定到全局单例 Session
  req.session = sessionStore.get()
  next()
}

module.exports = sessionMiddleware
