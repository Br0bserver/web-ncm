<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <h1 class="login-title">WebNCM</h1>
      <p class="login-subtitle">扫码登录网易云音乐</p>
      <div class="qr-wrapper">
        <div class="qr-container">
          <img v-if="qrimg" :src="qrimg" alt="QR" class="qr-img">
          <div v-else class="skeleton-qr"></div>
        </div>
        <div class="qr-status" :class="statusClass">
          <span v-if="loading">正在生成二维码...</span>
          <span v-else-if="statusText">{{ statusText }}</span>
          <span v-else>打开网易云音乐 App 扫码登录</span>
        </div>
      </div>
      <button class="btn-refresh" v-on:click="refreshQr" :disabled="loading">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        刷新二维码
      </button>
    </div>
  </div>
</template>

<script>
import authApi from '../api/auth'
import userApi from '../api/user'

export default {
  name: 'Login',
  data: function() {
    return {
      qrimg: '',
      statusText: '',
      loading: false,
      expired: false,
      polling: null,
    }
  },
  computed: {
    statusClass: function() {
      if (this.expired) return 'expired'
      if (this.statusText) return 'active'
      return ''
    },
  },
  mounted: function() {
    this.loadQr()
  },
  beforeDestroy: function() {
    this.stopPolling()
  },
  methods: {
    loadQr: function() {
      var self = this
      self.loading = true
      self.expired = false
      self.statusText = ''
      self.stopPolling()
      authApi.createQr().then(function(res) {
        self.loading = false
        if (res.code === 200 && res.data && res.data.qrimg) {
          self.qrimg = res.data.qrimg
          self.startPolling()
        } else {
          self.statusText = res.message || '二维码加载失败'
        }
      }).catch(function() {
        self.loading = false
        self.statusText = '网络错误'
      })
    },
    startPolling: function() {
      var self = this
      self.polling = setInterval(function() {
        authApi.checkQr().then(function(res) {
          if (res.code === 200 && res.data) {
            var code = res.data.code
            if (code === 800) {
              self.expired = true
              self.statusText = '二维码已过期'
              self.stopPolling()
            } else if (code === 801) {
              self.statusText = ''
            } else if (code === 802) {
              self.statusText = '请在手机上确认登录'
            } else if (code === 803) {
              self.statusText = '登录成功'
              self.stopPolling()
              self.fetchProfile()
            }
          }
        }).catch(function() {})
      }, 2000)
    },
    stopPolling: function() {
      if (this.polling) {
        clearInterval(this.polling)
        this.polling = null
      }
    },
    fetchProfile: function() {
      var self = this
      userApi.getProfile().then(function() {
        self.$router.replace('/discover')
      }).catch(function() {
        self.$router.replace('/discover')
      })
    },
    refreshQr: function() {
      this.loadQr()
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  background: #0a0a0a;
}

.login-card {
  text-align: center;
  padding: 48px 40px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 20px;
  width: 340px;
}

.login-icon {
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: center;
  justify-content: center;
  margin-bottom: 20px;
  color: rgba(255,255,255,0.3);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}

.login-subtitle {
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 32px;
}

.qr-wrapper {
  margin-bottom: 24px;
}

.qr-container {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255,255,255,0.04);
}

.qr-img {
  width: 100%;
  height: 100%;
  -o-object-fit: contain;
  object-fit: contain;
}

.skeleton-qr {
  width: 100%;
  height: 100%;
  background: -webkit-linear-gradient(left, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  -webkit-animation: shimmer 1.5s infinite;
  animation: shimmer 1.5s infinite;
}

@-webkit-keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.qr-status {
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  min-height: 20px;
}

.qr-status.active { color: rgba(255,255,255,0.7); }
.qr-status.expired { color: #fc3c44; }

.btn-refresh {
  display: -webkit-inline-flex;
  display: inline-flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 10px 24px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.6);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.btn-refresh svg {
  margin-right: 6px;
}

.btn-refresh:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.85);
}

.btn-refresh:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
