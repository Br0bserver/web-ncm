<template>
  <div id="app" :class="'theme-' + bgMode">
    <!-- 动态流光背景层 -->
    <div class="bg-flow-wrap" v-if="bgMode === 'flow'">
      <div class="bg-ball ball-1"></div>
      <div class="bg-ball ball-2"></div>
      <div class="bg-ball ball-3"></div>
      <div class="bg-ball ball-4"></div>
    </div>
    <div class="app-shell">
      <nav class="top-nav" v-if="showNav">
        <div class="nav-inner">
          <div class="nav-left">
            <button class="nav-icon-btn" v-on:click="doRefresh" title="刷新">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
            <button class="nav-icon-btn" v-on:click="doToggleFullscreen" title="全屏">
              <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 14 10 14 10 20"/>
                <polyline points="20 10 14 10 14 4"/>
                <line x1="14" y1="10" x2="21" y2="3"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>
          <div class="nav-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>WebNCM</span>
          </div>
          <div class="nav-tabs">
            <router-link to="/discover" class="nav-tab" active-class="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>发现</span>
            </router-link>
            <router-link to="/mine" class="nav-tab" active-class="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>我的</span>
            </router-link>
            <router-link to="/now-playing" class="nav-tab" active-class="active">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              <span>播放</span>
            </router-link>
          </div>
          <div class="nav-right">
            <button class="nav-icon-btn" v-on:click="toggleBgMode" style="margin-right: 12px" :title="bgMode === 'dark' ? '切换流光背景' : '切换纯黑背景'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </button>
            <div class="nav-search" :class="{ focused: searchFocused }">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input class="nav-search-input" type="text" v-model="searchKeyword" v-on:keyup.enter="doSearch" v-on:focus="searchFocused = true" v-on:blur="searchFocused = false" placeholder="搜索...">
            </div>
            <img v-if="userAvatar" :src="userAvatar" class="nav-avatar" alt="">
            <button class="nav-logout" v-on:click="doLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <main class="main-content" :class="{ 'has-player': hasPlayer && !isPlayerPage, 'with-flow': bgMode === 'flow' }">
        <router-view></router-view>
      </main>
      <div class="player-bar" v-if="hasPlayer && !isPlayerPage">
        <div class="player-inner">
          <div class="player-song" v-on:click="openPlayer">
            <img v-if="playerCover" :src="playerCover" class="player-cover-sm" alt="">
            <div class="player-meta">
              <div class="player-name">{{ playerName || '未播放' }}</div>
              <div class="player-artist">{{ playerArtist }}</div>
            </div>
          </div>
          <div class="player-bar-center">
            <span class="player-bar-time-l">{{ currentTimeStr }}</span>
            <div class="player-bar-progress" v-on:click.stop="seekTo" v-on:mousedown="startDrag" v-on:touchstart="startDragTouch">
              <div class="player-bar-progress-track">
                <div class="player-bar-progress-fill" :style="{ width: barProgress + '%' }">
                  <div class="player-bar-progress-thumb"></div>
                </div>
              </div>
            </div>
            <span class="player-bar-time-r">{{ durationStr }}</span>
          </div>
          <div class="player-controls">
            <button class="p-btn" v-on:click="playerPrev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="p-btn p-play" v-on:click="playerToggle">
              <svg v-if="playerPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3" height="14"/><rect x="14" y="5" width="3" height="14"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>
            </button>
            <button class="p-btn" v-on:click="playerNext">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button class="p-btn" v-on:click="cycleMode" :title="modeLabel">
              <svg v-if="playerMode === 'list'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              <svg v-else-if="playerMode === 'single'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="10" y="15" font-size="8" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
            </button>
          </div>
          <div class="player-extra">
            <div class="vol-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <div class="vol-track">
                <div class="vol-fill" :style="{ width: playerVolume + '%' }"></div>
                <input type="range" class="vol-slider" min="0" max="100" :value="playerVolume" v-on:input="setPlayerVolume">
              </div>
            </div>
            <button class="p-btn-sm" v-on:click="toggleQueue">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <transition name="slide-up">
          <div class="player-queue" v-if="showQueue">
            <div class="queue-header">
              <span>播放队列 ({{ queue.length }})</span>
              <button class="p-btn-sm" v-on:click="showQueue = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="queue-list">
              <div class="queue-item" v-for="(s, i) in queue" :key="s.id || i" :class="{ active: i === queueIndex }" v-on:click="playFromQueue(i)">
                <span class="qi-num">{{ i + 1 }}</span>
                <span class="qi-name">{{ s.name || '' }}</span>
                <span class="qi-artist">{{ getArtists(s) }}</span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import authApi from './api/auth'
import httpApi from './api/http'

export default {
  name: 'App',
  data: function() {
    return {
      isLoggedIn: false,
      userInfo: null,
      bgMode: 'dark',
      showQueue: false,
      isFullscreen: false,
      playerSong: null,
      playerPlaying: false,
      playerPlaylist: [],
      playerIndex: -1,
      playerVolume: 80,
      playerMode: 'list',
      searchKeyword: '',
      barProgress: 0,
      barCurrentTime: 0,
      barDuration: 0,
      searchFocused: false,
      isDragging: false,
    }
  },
  computed: {
    showNav: function() {
      return this.isLoggedIn && this.$route.path !== '/login'
    },
    isPlayerPage: function() {
      return this.$route.path === '/now-playing'
    },
    hasPlayer: function() {
      return this.playerSong !== null
    },
    playerCover: function() {
      if (!this.playerSong) return ''
      var al = this.playerSong.al || this.playerSong.album
      var url = (al && al.picUrl) || ''
      return url ? httpApi.proxyImage(url) : ''
    },
    playerName: function() {
      return this.playerSong ? this.playerSong.name : ''
    },
    playerArtist: function() {
      if (!this.playerSong) return ''
      var arr = this.playerSong.ar || this.playerSong.artists || []
      var names = []
      for (var i = 0; i < arr.length; i++) names.push(arr[i].name)
      return names.join(' / ')
    },
    progressPercent: function() {
      return this.barProgress
    },
    currentTimeStr: function() {
      return this.formatTime(this.barCurrentTime)
    },
    durationStr: function() {
      return this.formatTime(this.barDuration)
    },
    queue: function() {
      return this.playerPlaylist
    },
    queueIndex: function() {
      return this.playerIndex
    },
    modeLabel: function() {
      if (this.playerMode === 'single') return '单曲循环'
      if (this.playerMode === 'shuffle') return '随机播放'
      return '列表循环'
    },
    userAvatar: function() {
      var url = ''
      if (this.userInfo && this.userInfo.avatarUrl) url = this.userInfo.avatarUrl
      if (this.userInfo && this.userInfo.profile && this.userInfo.profile.avatarUrl) url = this.userInfo.profile.avatarUrl
      return url ? httpApi.proxyImage(url) : ''
    },
  },
  mounted: function() {
    var self = this
    var p = self.$root.$options.player
    if (p && p.onChange) {
      p.onChange(function() {
        var state = p.getState()
        self.playerSong = state.currentSong
        self.playerPlaying = state.playing
        self.playerPlaylist = state.playlist
        self.playerIndex = state.index
        self.playerVolume = state.volume
        self.playerMode = state.mode
        self.barProgress = 0
        self.barCurrentTime = 0
        self.barDuration = 0
        if (state.audio) {
          self.bindBarAudio(state.audio)
        }
      })
    }
    if (p && p.getState) {
      var initState = p.getState()
      self.playerSong = initState.currentSong
      self.playerPlaying = initState.playing
      self.playerPlaylist = initState.playlist
      self.playerIndex = initState.index
      self.playerVolume = initState.volume
      self.playerMode = initState.mode
      if (initState.audio) {
        self.bindBarAudio(initState.audio)
      }
    }
    this.$root.app = this
    this.$root.$on('toggle-queue', this.toggleQueue)
    this.checkAuth()
    this.initFullscreenListener()
    document.addEventListener('mousemove', this.onDrag)
    document.addEventListener('mouseup', this.stopDrag)
    document.addEventListener('touchmove', this.onDragTouch, { passive: false })
    document.addEventListener('touchend', this.stopDragTouch)
  },
  beforeDestroy: function() {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.stopDrag)
    document.removeEventListener('touchmove', this.onDragTouch)
    document.removeEventListener('touchend', this.stopDragTouch)
  },
  watch: {
    '$route': function() {
      this.checkAuth()
    }
  },
  methods: {
    checkAuth: function() {
      var self = this
      authApi.getAuthStatus().then(function(res) {
        if (res.code === 200 && res.data && res.data.loggedIn) {
          self.isLoggedIn = true
          self.userInfo = res.data.userInfo
          if (res.data.bgMode) self.bgMode = res.data.bgMode
        } else {
          self.isLoggedIn = false
        }
      }).catch(function() {
        self.isLoggedIn = false
      })
    },
    toggleBgMode: function() {
      var next = this.bgMode === 'dark' ? 'flow' : 'dark'
      this.bgMode = next
      authApi.setBgMode(next).catch(function() {})
    },
    doLogout: function() {
      var self = this
      authApi.logout().then(function() {
        self.isLoggedIn = false
        self.userInfo = null
        self.$router.replace('/login')
      }).catch(function() {
        self.isLoggedIn = false
        self.$router.replace('/login')
      })
    },
    doRefresh: function() {
      window.location.reload()
    },
    doToggleFullscreen: function() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
        var el = document.documentElement
        if (el.requestFullscreen) {
          el.requestFullscreen()
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen()
        } else if (el.mozRequestFullScreen) {
          el.mozRequestFullScreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        }
      }
    },
    initFullscreenListener: function() {
      var self = this
      function update() {
        self.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement)
      }
      document.addEventListener('fullscreenchange', update)
      document.addEventListener('webkitfullscreenchange', update)
      document.addEventListener('mozfullscreenchange', update)
    },
    doSearch: function() {
      if (this.searchKeyword.trim()) {
        this.$router.push('/search?q=' + encodeURIComponent(this.searchKeyword.trim()))
      }
    },
    openPlayer: function() {
      this.$router.push('/now-playing')
    },
    playerToggle: function() {
      var p = this.$root.$options.player
      if (!p) return
      this.playerPlaying ? p.pause() : p.resume()
    },
    playerPrev: function() {
      var p = this.$root.$options.player
      if (p) p.prev()
    },
    playerNext: function() {
      var p = this.$root.$options.player
      if (p) p.next()
    },
    cycleMode: function() {
      var p = this.$root.$options.player
      if (p) p.cycleMode()
    },
    setPlayerVolume: function(e) {
      var vol = parseInt(e.target.value, 10)
      var p = this.$root.$options.player
      if (p) p.setVolume(vol)
    },
    toggleQueue: function() {
      this.showQueue = !this.showQueue
    },
    playFromQueue: function(i) {
      var p = this.$root.$options.player
      if (p && p.getState().playlist[i]) {
        p.setIndex(i)
        p.playSong(p.getState().playlist[i])
      }
    },
    getArtists: function(song) {
      if (!song) return ''
      var arr = song.ar || song.artists || []
      var names = []
      for (var i = 0; i < arr.length; i++) names.push(arr[i].name)
      return names.join(' / ')
    },
    seekTo: function(e) {
      var p = this.$root.$options.player
      if (!p || !p.getState) return
      var audio = p.getState().audio
      if (!audio || !audio.duration) return
      var rect = e.currentTarget.getBoundingClientRect()
      var ratio = (e.clientX - rect.left) / rect.width
      if (ratio < 0) ratio = 0
      if (ratio > 1) ratio = 1
      audio.currentTime = ratio * audio.duration
    },
    startDrag: function(e) {
      this.isDragging = true
      this.doSeek(e.clientX)
    },
    startDragTouch: function(e) {
      this.isDragging = true
      if (e.touches && e.touches[0]) {
        this.doSeek(e.touches[0].clientX)
      }
    },
    onDrag: function(e) {
      if (!this.isDragging) return
      this.doSeek(e.clientX)
    },
    onDragTouch: function(e) {
      if (!this.isDragging) return
      e.preventDefault()
      if (e.touches && e.touches[0]) {
        this.doSeek(e.touches[0].clientX)
      }
    },
    doSeek: function(clientX) {
      var p = this.$root.$options.player
      if (!p || !p.getState) return
      var audio = p.getState().audio
      if (!audio || !audio.duration) return
      var bar = document.querySelector('.player-bar-progress-track')
      if (!bar) return
      var rect = bar.getBoundingClientRect()
      var ratio = (clientX - rect.left) / rect.width
      if (ratio < 0) ratio = 0
      if (ratio > 1) ratio = 1
      audio.currentTime = ratio * audio.duration
      this.barProgress = ratio * 100
      this.barCurrentTime = ratio * audio.duration
    },
    stopDrag: function() {
      this.isDragging = false
    },
    stopDragTouch: function() {
      this.isDragging = false
    },
    bindBarAudio: function(audio) {
      var self = this
      if (!audio) return
      this._barTimeUpdate = function() {
        if (self.isDragging) return
        var ct = audio.currentTime
        var dur = audio.duration
        if (!dur || isNaN(dur) || isNaN(ct)) return
        self.barCurrentTime = ct
        self.barDuration = dur
        self.barProgress = (ct / dur) * 100
      }
      this._barMetaLoaded = function() {
        var dur = audio.duration || 0
        self.barDuration = dur
        self.barCurrentTime = 0
        self.barProgress = 0
      }
      this._barEnded = function() {
        self.barProgress = 0
        self.barCurrentTime = 0
      }
      audio.addEventListener('timeupdate', this._barTimeUpdate)
      audio.addEventListener('loadedmetadata', this._barMetaLoaded)
      audio.addEventListener('ended', this._barEnded)
    },
    formatTime: function(sec) {
      if (!sec || isNaN(sec)) return '0:00'
      var m = Math.floor(sec / 60)
      var s = Math.floor(sec % 60)
      return m + ':' + (s < 10 ? '0' : '') + s
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  color: #f5f5f7;
  background: #0a0a0a;
  -webkit-font-smoothing: antialiased;
}

#app { height: 100%; position: relative; overflow: hidden; }

/* 动态流光背景 */
.bg-flow-wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  background: #050505;
  overflow: hidden;
  pointer-events: none;
}

.bg-ball {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  -webkit-filter: blur(80px);
  opacity: 0.45;
}

.ball-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(100, 40, 255, 0.8) 0%, rgba(100, 40, 255, 0) 70%);
  top: -10%;
  left: -10%;
  -webkit-animation: flow-move-1 25s infinite alternate ease-in-out;
  animation: flow-move-1 25s infinite alternate ease-in-out;
}

.ball-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 40, 100, 0.7) 0%, rgba(255, 40, 100, 0) 70%);
  bottom: -5%;
  right: -5%;
  -webkit-animation: flow-move-2 30s infinite alternate ease-in-out;
  animation: flow-move-2 30s infinite alternate ease-in-out;
}

.ball-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(40, 180, 255, 0.6) 0%, rgba(40, 180, 255, 0) 70%);
  top: 40%;
  right: 15%;
  -webkit-animation: flow-move-3 20s infinite alternate ease-in-out;
  animation: flow-move-3 20s infinite alternate ease-in-out;
}

.ball-4 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 180, 40, 0.5) 0%, rgba(255, 180, 40, 0) 70%);
  bottom: 20%;
  left: 10%;
  -webkit-animation: flow-move-4 35s infinite alternate ease-in-out;
  animation: flow-move-4 35s infinite alternate ease-in-out;
}

@-webkit-keyframes flow-move-1 {
  0% { -webkit-transform: translate(0, 0) scale(1); }
  100% { -webkit-transform: translate(150px, 100px) scale(1.2); }
}
@keyframes flow-move-1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(150px, 100px) scale(1.2); }
}

@-webkit-keyframes flow-move-2 {
  0% { -webkit-transform: translate(0, 0) scale(1.1); }
  100% { -webkit-transform: translate(-120px, -150px) scale(0.9); }
}
@keyframes flow-move-2 {
  0% { transform: translate(0, 0) scale(1.1); }
  100% { transform: translate(-120px, -150px) scale(0.9); }
}

@-webkit-keyframes flow-move-3 {
  0% { -webkit-transform: translate(0, 0); }
  100% { -webkit-transform: translate(-200px, 50px); }
}
@keyframes flow-move-3 {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-200px, 50px); }
}

@-webkit-keyframes flow-move-4 {
  0% { -webkit-transform: translate(0, 0) scale(0.8); }
  100% { -webkit-transform: translate(100px, -100px) scale(1.3); }
}
@keyframes flow-move-4 {
  0% { transform: translate(0, 0) scale(0.8); }
  100% { transform: translate(100px, -100px) scale(1.3); }
}

.app-shell {
  height: 100%;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.main-content.with-flow {
  background: rgba(0, 0, 0, 0.2);
}

/* Top Nav */
.top-nav {
  background: rgba(18, 18, 18, 0.92);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: relative;
  z-index: 100;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  height: 52px;
  padding: 0 24px;
}

.nav-left {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  margin-right: 16px;
}

.nav-icon-btn {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  border-radius: 6px;
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

.nav-icon-btn:hover {
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.85);
}

.nav-icon-btn + .nav-icon-btn {
  margin-left: 4px;
}

.nav-logo {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.nav-logo svg {
  margin-right: 8px;
}

.nav-tabs {
  display: -webkit-flex;
  display: flex;
  margin-left: 40px;
}

.nav-tab {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 8px 14px;
  border-radius: 8px;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.nav-tab + .nav-tab {
  margin-left: 4px;
}

.nav-tab svg {
  margin-right: 6px;
}

.nav-tab:hover { color: rgba(255,255,255,0.85); }

.nav-tab.active {
  color: #fff;
  background: rgba(255,255,255,0.08);
}

.nav-right {
  margin-left: auto;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.nav-search {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 0 10px;
  margin-right: 12px;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.nav-search.focused {
  border-color: rgba(252, 60, 68, 0.4);
  background: rgba(255,255,255,0.08);
}

.nav-search svg {
  color: rgba(255,255,255,0.35);
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.nav-search-input {
  width: 140px;
  padding: 6px 8px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.nav-search-input::-webkit-input-placeholder {
  color: rgba(255,255,255,0.25);
}

.nav-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  margin-right: 12px;
}

.nav-logout {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.nav-logout:hover {
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
}

/* Main Content */
.main-content {
  -webkit-flex: 1;
  flex: 1;
  overflow-y: auto;
  -webkit-transition: padding-bottom 0.3s ease;
  transition: padding-bottom 0.3s ease;
}

.main-content.has-player {
  padding-bottom: 64px;
}

/* Player Bar */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: rgba(18, 18, 18, 0.95);
  border-top: 1px solid rgba(255,255,255,0.06);
}

.player-inner {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.player-song {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-flex: 0 0 auto;
  flex: 0 0 auto;
  min-width: 0;
  cursor: pointer;
  max-width: 220px;
}

.player-cover-sm {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 10px;
}

.player-meta {
  min-width: 0;
}

.player-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}

.player-artist {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.player-bar-center {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
  margin: 0 20px;
}

.player-bar-progress {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  margin: 0 8px;
}

.player-bar-progress-track {
  height: 3px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  position: relative;
  -webkit-transition: height 0.15s ease;
  transition: height 0.15s ease;
}

.player-bar-progress:hover .player-bar-progress-track {
  height: 5px;
}

.player-bar-progress-fill {
  height: 100%;
  background: #fff;
  -webkit-transition: width 0.1s linear;
  transition: width 0.1s linear;
  position: relative;
  min-width: 10px;
  border-radius: 2px;
}

.player-bar-progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.player-bar-time-l {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  white-space: nowrap;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.player-bar-time-r {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  white-space: nowrap;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.player-bar-progress {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
  max-width: 400px;
  cursor: pointer;
  margin: 0 8px;
}

.player-bar-progress {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  margin: 0 8px;
}

.player-bar-progress-track {
  height: 3px;
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
  position: relative;
  -webkit-transition: height 0.15s ease;
  transition: height 0.15s ease;
}

.player-bar-progress:hover .player-bar-progress-track {
  height: 5px;
}

.player-bar-progress-fill {
  height: 100%;
  background: #fff;
  -webkit-transition: width 0.1s linear;
  transition: width 0.1s linear;
  position: relative;
  min-width: 10px;
  border-radius: 2px;
}

.player-bar-progress-thumb {
  position: absolute;
  right: -5px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.player-bar-time-l {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  white-space: nowrap;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.player-bar-time-r {
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  white-space: nowrap;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.player-inner {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.player-song {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-flex: 0 0 auto;
  flex: 1;
  min-width: 0;
  max-width: 220px;
  cursor: pointer;
}

.player-cover-sm {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 10px;
}

.player-meta {
  min-width: 0;
}

.player-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}

.player-artist {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  margin-top: 1px;
}

.player-controls {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.p-btn + .p-btn {
  margin-left: 6px;
}

.p-btn {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  border-radius: 50%;
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

.p-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

.p-play {
  width: 40px;
  height: 40px;
  color: #000;
  background: #fff;
}

.p-play:hover { 
  background: #e5e5e5; 
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}

.player-extra {
  margin-left: 12px;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.vol-wrap {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  margin-right: 8px;
  color: rgba(255,255,255,0.45);
}

.vol-wrap svg {
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 6px;
}

.vol-track {
  position: relative;
  width: 80px;
  height: 3px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}

.vol-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #fff;
  border-radius: 2px;
  pointer-events: none;
}

.vol-slider {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 11px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  opacity: 0;
  -webkit-transition: opacity 0.15s ease;
  transition: opacity 0.15s ease;
}

.vol-track:hover .vol-slider::-webkit-slider-thumb {
  opacity: 1;
}

.p-btn-sm {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  border-radius: 6px;
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

.p-btn-sm:hover { color: #fff; background: rgba(255,255,255,0.08); }

/* Queue Panel */
.player-queue {
  position: absolute;
  bottom: 56px;
  right: 16px;
  width: 320px;
  max-height: 360px;
  background: rgba(24, 24, 24, 0.98);
  border-radius: 12px 12px 0 0;
  border: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
}

.queue-header {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.queue-list {
  max-height: 300px;
  overflow-y: auto;
}

.queue-item {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 9px 14px;
  cursor: pointer;
  -webkit-transition: background 0.15s ease;
  transition: background 0.15s ease;
}

.queue-item:hover { background: rgba(255,255,255,0.04); }

.queue-item.active { background: rgba(252, 60, 68, 0.1); }

.queue-item.active .qi-name { color: #fc3c44; }

.qi-num {
  width: 22px;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  text-align: center;
}

.qi-name {
  -webkit-flex: 1;
  flex: 1;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  margin: 0 8px;
}

.qi-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

.slide-up-enter, .slide-up-leave-to {
  -webkit-transform: translateY(10px);
  transform: translateY(10px);
  opacity: 0;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

::selection { background: rgba(252, 60, 68, 0.3); }
</style>
tyle>
