<template>
  <div class="now-playing-page" v-if="currentSong">
    <div class="boss-key-overlay" v-if="showBossKey" v-on:click="showBossKey = false">
      <video :src="bossVideoUrl" autoplay loop muted class="boss-key-video"></video>
    </div>
    <div class="np-inner">
      <div class="np-left">
        <div class="np-cover-wrap">
          <div class="np-cover-spinner" v-if="coverLoading">
            <div class="spinner"></div>
          </div>
          <img :src="coverUrl" class="np-cover" alt="" v-on:load="coverLoaded" v-on:error="coverError" v-bind:class="{ loaded: !coverLoading }">
        </div>
        <div class="np-meta">
          <h2 class="np-name">{{ currentSong.name }}</h2>
          <p class="np-album" v-if="getAlbum(currentSong)" v-on:click="openAlbum(currentSong)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            {{ getAlbum(currentSong) }}
          </p>
          <p class="np-artist-link" v-if="hasArtists(currentSong)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span v-for="(ar, i) in getArtistList(currentSong)" :key="ar.id" class="np-artist-tag" v-on:click="openArtist(ar.id)">{{ ar.name }}<template v-if="i < getArtistList(currentSong).length - 1"> / </template></span>
          </p>
        </div>
        
        <!-- 极致对称控制行 -->
        <div class="np-controls">
          <button class="np-btn side-btn" v-on:click="cycleMode" :title="modeLabel">
            <svg v-if="playerMode === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <svg v-else-if="playerMode === 'single'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="9.5" y="15.5" font-size="9" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          </button>
          
          <div class="np-controls-center">
            <button class="np-btn" v-on:click="playerPrev">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="np-btn np-btn-play" v-on:click="playerToggle">
              <svg v-if="isPlaying" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3" height="14"/><rect x="14" y="5" width="3" height="14"/></svg>
              <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>
            </button>
            <button class="np-btn" v-on:click="playerNext">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>

          <button class="np-btn side-btn" v-on:click="toggleQueue" title="播放队列">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="np-progress">
          <div class="np-bar" v-on:click="seekTo" v-on:mousedown="startDrag" v-on:touchstart="startDragTouch">
            <div class="np-bar-fill" :style="{ width: barProgress + '%' }">
              <div class="np-bar-thumb"></div>
            </div>
          </div>
          <div class="np-time">
            <span>{{ currentTimeStr }}</span>
            <span>{{ durationStr }}</span>
          </div>
        </div>
      </div>
      <div class="np-right">
        <div class="np-lyric-header">
          <span class="np-lyric-title">歌词</span>
          <div class="np-lyric-modes">
            <button class="np-lyric-mode-btn boss-btn-inline" v-on:click="showBossKey = true" title="沉浸模式">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c3.85 0 7.112 2.359 8.542 5.612"/><path d="M21.542 12C20.268 16.057 16.477 19 12 19c-3.85 0-7.112-2.359-8.542-5.612"/></svg>
            </button>
            <template v-if="hasTranslation || hasRomalrc">
              <button class="np-lyric-mode-btn" v-on:click="cycleLyricMode">{{ lyricModeLabel }}</button>
            </template>
          </div>
        </div>
        <div class="np-lyric-wrap" ref="lyricWrap">
          <div class="np-lyric" v-if="displayLines.length > 0">
            <div class="np-lyric-line" v-for="(line, i) in displayLines" :key="i" :class="{ active: i === activeLyricIndex }">
              <div class="np-lyric-main">{{ line.main }}</div>
              <div class="np-lyric-sub" v-if="line.sub">{{ line.sub }}</div>
            </div>
          </div>
          <div class="np-lyric-loading" v-else-if="lyricLoading">
            <div class="spinner"></div>
          </div>
          <div class="np-lyric-empty" v-else>暂无歌词</div>
        </div>
      </div>
    </div>
  </div>
  <div class="np-empty" v-else>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
    <p>还没有播放歌曲</p>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'NowPlaying',
  data: function() {
    return {
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      progressPercent: 0,
      barProgress: 0,
      lyricLines: [],
      activeLyricIndex: -1,
      playerVolume: 80,
      playerMode: 'list',
      hasTranslation: false,
      hasRomalrc: false,
      translationLines: [],
      romalrcLines: [],
      lyricMode: 0,
      coverLoading: true,
      isDragging: false,
      lyricLoading: false,
    }
  },
  computed: {
    bossVideoUrl: function() {
      var t = require('../api/http').default.getToken()
      return '/media/video' + (t ? '?token=' + t : '')
    },
    coverUrl: function() {
      if (!this.currentSong) return ''
      var al = this.currentSong.al || this.currentSong.album
      var url = (al && al.picUrl) || ''
      return url ? this.$proxyImage(url) : ''
    },
    currentTimeStr: function() {
      return this.formatTime(this.currentTime)
    },
    durationStr: function() {
      return this.formatTime(this.duration)
    },
    modeLabel: function() {
      if (this.playerMode === 'single') return '单曲循环'
      if (this.playerMode === 'shuffle') return '随机播放'
      return '列表循环'
    },
    lyricModeLabel: function() {
      if (this.hasTranslation && this.hasRomalrc) {
        var labels = ['译', '音', '原']
        return labels[this.lyricMode] || '译'
      }
      if (this.hasTranslation) {
        return this.lyricMode === 0 ? '译' : '原'
      }
      if (this.hasRomalrc) {
        return this.lyricMode === 0 ? '音' : '原'
      }
      return ''
    },
    displayLines: function() {
      var self = this
      var mainLines = self.lyricLines
      var subLines = []
      if (self.hasTranslation && self.hasRomalrc) {
        if (self.lyricMode === 0) {
          subLines = self.translationLines
        } else if (self.lyricMode === 1) {
          subLines = self.romalrcLines
        }
      } else if (self.hasTranslation) {
        if (self.lyricMode === 0) {
          mainLines = self.translationLines
          subLines = []
        }
      } else if (self.hasRomalrc) {
        if (self.lyricMode === 0) {
          mainLines = self.romalrcLines
          subLines = []
        }
      }
      return mainLines.map(function(line, i) {
        var sub = ''
        if (subLines.length > 0 && subLines[i]) {
          sub = subLines[i].text
        }
        return { main: line.text, sub: sub }
      })
    },
  },
  mounted: function() {
    var self = this
    var player = self.$root.$options.player
    if (player && player.onChange) {
      player.onChange(function() {
        var state = player.getState()
        self.currentSong = state.currentSong
        self.isPlaying = state.playing
        self.playerVolume = state.volume
        self.playerMode = state.mode
        self.barProgress = 0
        self.currentTime = 0
        self.duration = 0
        self.lyricLines = []
        self.activeLyricIndex = -1
        self.lyricLoading = true
        self.hasTranslation = false
        self.hasRomalrc = false
        self.translationLines = []
        self.romalrcLines = []
        self.lyricMode = 0
        if (state.audio) {
          self.bindAudio(state.audio)
        }
        if (state.currentSong && state.currentSong.id) {
          self.loadLyric()
        } else {
          self.lyricLoading = false
        }
      })
    }
    if (player && player.getState) {
      var initState = player.getState()
      self.currentSong = initState.currentSong
      self.isPlaying = initState.playing
      self.playerVolume = initState.volume
      self.playerMode = initState.mode
      self.bindAudio(initState.audio)
    }
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
  methods: {
    getArtists: function(song) {
      if (!song) return ''
      var arr = song.ar || song.artists || []
      var names = []
      for (var i = 0; i < arr.length; i++) names.push(arr[i].name)
      return names.join(' / ')
    },
    getArtistList: function(song) {
      if (!song) return []
      return song.ar || song.artists || []
    },
    hasArtists: function(song) {
      var arr = this.getArtistList(song)
      return arr.length > 0 && arr[0].id
    },
    getAlbum: function(song) {
      if (!song) return ''
      var al = song.al || song.album
      return (al && al.name) || ''
    },
    openAlbum: function(song) {
      var al = song.al || song.album
      if (al && al.id) {
        this.$router.push('/album/' + al.id)
      }
    },
    openArtist: function(id) {
      this.$router.push('/artist/' + id)
    },
    coverLoaded: function() {
      this.coverLoading = false
    },
    coverError: function() {
      this.coverLoading = false
    },
    bindAudio: function(audio) {
      var self = this
      if (!audio) return
      this._npTimeUpdate = function() {
        if (self.isDragging) return
        var ct = audio.currentTime
        var dur = audio.duration
        if (!dur || isNaN(dur) || isNaN(ct)) return
        self.currentTime = ct
        self.duration = dur
        self.barProgress = (ct / dur) * 100
        self.updateLyric()
      }
      this._npMetaLoaded = function() {
        var dur = audio.duration || 0
        self.duration = dur
        self.currentTime = 0
        self.barProgress = 0
      }
      this._npEnded = function() {
        self.barProgress = 0
        self.currentTime = 0
        self.duration = 0
        var player = self.$root.$options.player
        if (player) player.next()
      }
      audio.addEventListener('timeupdate', this._npTimeUpdate)
      audio.addEventListener('loadedmetadata', this._npMetaLoaded)
      audio.addEventListener('ended', this._npEnded)
      audio.onplay = function() { self.isPlaying = true }
      audio.onpause = function() { self.isPlaying = false }
      this.loadLyric()
    },
    playerToggle: function() {
      var player = this.$root.$options.player
      if (!player) return
      this.isPlaying ? player.pause() : player.resume()
    },
    playerPrev: function() {
      var player = this.$root.$options.player
      if (player) player.prev()
    },
    playerNext: function() {
      var player = this.$root.$options.player
      if (player) player.next()
    },
    cycleMode: function() {
      var player = this.$root.$options.player
      if (player) player.cycleMode()
    },
    cycleLyricMode: function() {
      if (this.hasTranslation && this.hasRomalrc) {
        this.lyricMode = (this.lyricMode + 1) % 3
      } else if (this.hasTranslation || this.hasRomalrc) {
        this.lyricMode = this.lyricMode === 0 ? 1 : 0
      }
    },
    toggleQueue: function() {
      this.$root.$emit('toggle-queue')
    },
    seekTo: function(e) {
      var player = this.$root.$options.player
      if (!player || !player.getState) return
      var audio = player.getState().audio
      if (!audio || !this.duration) return
      var rect = e.currentTarget.getBoundingClientRect()
      var ratio = (e.clientX - rect.left) / rect.width
      if (ratio < 0) ratio = 0
      if (ratio > 1) ratio = 1
      audio.currentTime = ratio * this.duration
      this.barProgress = ratio * 100
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
      var player = this.$root.$options.player
      if (!player || !player.getState) return
      var audio = player.getState().audio
      if (!audio || !this.duration) return
      var bar = document.querySelector('.np-bar')
      if (!bar) return
      var rect = bar.getBoundingClientRect()
      var ratio = (clientX - rect.left) / rect.width
      if (ratio < 0) ratio = 0
      if (ratio > 1) ratio = 1
      audio.currentTime = ratio * this.duration
      this.barProgress = ratio * 100
      this.currentTime = ratio * this.duration
    },
    stopDrag: function() {
      this.isDragging = false
    },
    stopDragTouch: function() {
      this.isDragging = false
    },
    loadLyric: function() {
      var self = this
      if (!this.currentSong || !this.currentSong.id) return
      musicApi.getLyric(this.currentSong.id).then(function(res) {
        if (res.code === 200 && res.data) {
          var d = res.data
          var lrcStr = ''
          var tlyricStr = ''
          var romalrcStr = ''
          if (typeof d.lyric === 'string') lrcStr = d.lyric
          else if (d.lrc && typeof d.lrc.lyric === 'string') lrcStr = d.lrc.lyric
          if (typeof d.tlyric === 'string') tlyricStr = d.tlyric
          else if (d.tlyric && typeof d.tlyric.lyric === 'string') tlyricStr = d.tlyric.lyric
          if (typeof d.romalrc === 'string') romalrcStr = d.romalrc
          else if (d.romalrc && typeof d.romalrc.lyric === 'string') romalrcStr = d.romalrc.lyric
          self.lyricLines = self.parseLyric(lrcStr)
          self.translationLines = self.parseLyric(tlyricStr)
          self.romalrcLines = self.parseLyric(romalrcStr)
          self.hasTranslation = self.translationLines.length > 0
          self.hasRomalrc = self.romalrcLines.length > 0
          self.lyricMode = 0
          self.lyricLoading = false
          if (self.hasTranslation || self.hasRomalrc) {
            self.alignLyrics()
          }
        }
      }).catch(function() {})
    },
    alignLyrics: function() {
      if (this.hasTranslation) {
        this.translationLines = this.alignToMain(this.lyricLines, this.translationLines)
      }
      if (this.hasRomalrc) {
        this.romalrcLines = this.alignToMain(this.lyricLines, this.romalrcLines)
      }
    },
    alignToMain: function(mainLines, subLines) {
      if (!mainLines.length || !subLines.length) return subLines
      var aligned = []
      var subIdx = 0
      for (var i = 0; i < mainLines.length; i++) {
        var mainTime = mainLines[i].time
        var bestIdx = -1
        var bestDiff = Infinity
        while (subIdx < subLines.length) {
          var diff = Math.abs(subLines[subIdx].time - mainTime)
          if (diff < bestDiff) {
            bestDiff = diff
            bestIdx = subIdx
          }
          if (subLines[subIdx].time > mainTime + 2) break
          subIdx++
        }
        if (bestIdx >= 0 && bestDiff < 3) {
          aligned.push(subLines[bestIdx])
          subIdx = bestIdx + 1
        } else {
          aligned.push({ time: mainTime, text: '' })
        }
      }
      return aligned
    },
    parseLyric: function(text) {
      if (!text) return []
      var lines = text.split('\n')
      var result = []
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].replace(/^\s+|\s+$/g, '')
        if (!line) continue
        var newMatch = line.match(/^\{"t":(\d+),"c":\[(.*)\]\}$/)
        if (newMatch) {
          var timeMs = parseInt(newMatch[1], 10)
          var content = newMatch[2]
          var txMatch = content.match(/"tx":"((?:[^"\\]|\\.)*)"/g)
          if (txMatch) {
            var txt = ''
            for (var j = 0; j < txMatch.length; j++) {
              var inner = txMatch[j].replace(/^"tx":"/, '').replace(/"$/, '')
              txt += inner.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\r/g, '')
            }
            txt = txt.replace(/^\s+|\s+$/g, '')
            if (txt) {
              result.push({ time: timeMs / 1000, text: txt })
            }
          }
          continue
        }
        var oldMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
        if (oldMatch) {
          var min = parseInt(oldMatch[1], 10)
          var sec = parseInt(oldMatch[2], 10)
          var ms = parseInt(oldMatch[3], 10)
          if (oldMatch[3].length === 2) ms = ms * 10
          var time = min * 60 + sec + ms / 1000
          var txt = oldMatch[4].replace(/^\s+|\s+$/g, '')
          if (txt) {
            result.push({ time: time, text: txt })
          }
        }
      }
      return result
    },
    updateLyric: function() {
      var idx = -1
      for (var i = 0; i < this.lyricLines.length; i++) {
        if (this.lyricLines[i].time <= this.currentTime) {
          idx = i
        } else {
          break
        }
      }
      if (idx !== this.activeLyricIndex) {
        this.activeLyricIndex = idx
        this.scrollLyric()
      }
    },
    scrollLyric: function() {
      var wrap = this.$refs.lyricWrap
      if (!wrap) return
      var activeEl = wrap.querySelector('.np-lyric-line.active')
      if (activeEl) {
        var wrapH = wrap.clientHeight
        var elH = activeEl.offsetHeight
        var elTop = activeEl.offsetTop
        wrap.scrollTop = elTop - wrapH / 2 + elH / 2
      }
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

<style scoped>
.np-lyric-modes {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row !important;
  flex-direction: row !important;
  -webkit-align-items: center;
  align-items: center;
}

.np-lyric-mode-btn {
  padding: 4px 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  cursor: pointer;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  line-height: 1;
  height: 26px;
  min-width: 32px;
}

.boss-btn-inline {
  margin-right: 8px;
}

.boss-key-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  z-index: 9999;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.boss-key-video {
  max-width: 100vw;
  max-height: 100vh;
  -o-object-fit: contain;
  object-fit: contain;
}

.now-playing-page {
  height: 100%;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  padding: 20px 24px;
  overflow: hidden;
}

.np-inner {
  display: -webkit-flex;
  display: flex;
  max-width: 1000px;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.np-left {
  -webkit-flex: 1;
  flex: 1;
  max-width: 300px;
  margin-right: 80px;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: center;
  justify-content: center;
}

.np-cover-wrap {
  width: 100%;
  padding-top: 100%;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.04);
}

.np-cover-spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  z-index: 2;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #fff;
  border-radius: 50%;
  -webkit-animation: spin 0.8s linear infinite;
  animation: spin 0.8s linear infinite;
}

@-webkit-keyframes spin { to { -webkit-transform: rotate(360deg); } }
@keyframes spin { to { transform: rotate(360deg); } }

.np-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
  opacity: 0;
  -webkit-transition: opacity 0.3s ease;
  transition: opacity 0.3s ease;
}

.np-cover.loaded { opacity: 1; }

.np-meta { margin-bottom: 24px; }

.np-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

.np-album, .np-artist-link {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin-top: 6px;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  cursor: pointer;
}

.np-album svg, .np-artist-link svg {
  margin-right: 6px;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.np-album:hover, .np-artist-link:hover { color: rgba(255,255,255,0.7); }

/* 对称布局：Loop | Prev Play Next | Queue */
.np-controls {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  margin-bottom: 12px;
  width: 100%;
}

.np-controls-center {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: row;
  flex-direction: row;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.np-btn {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  border-radius: 50%;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
  padding: 0;
  margin: 0;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
}

.side-btn { width: 32px; height: 32px; opacity: 0.6; }
.side-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }

.np-controls-center .np-btn + .np-btn { margin-left: 16px; }

.np-btn:hover { color: #fff; }

.np-btn-play {
  width: 52px !important;
  height: 52px !important;
  background: #fff !important;
  color: #000 !important;
  opacity: 1 !important;
}

.np-btn-play:hover {
  background: #e5e5e5 !important;
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}

.np-progress { margin-bottom: 4px; }

.np-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 8px;
  position: relative;
}

.np-bar:hover { height: 6px; }

.np-bar-fill {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  position: relative;
  min-width: 12px;
}

.np-bar-thumb {
  position: absolute;
  right: -6px;
  top: 50%;
  -webkit-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
}

.np-time {
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255,255,255,0.3);
}

.np-right {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  overflow: hidden;
}

.np-lyric-header {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  margin-bottom: 16px;
}

.np-lyric-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
}

.np-lyric-wrap {
  -webkit-flex: 1;
  flex: 1;
  overflow-y: auto;
  padding-top: 40px;
  padding-bottom: 40px;
}

.np-lyric-line {
  padding: 12px 0;
  -webkit-transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  opacity: 0.35;
  -webkit-transform-origin: left center;
  transform-origin: left center;
  -webkit-transform: scale(0.95);
  transform: scale(0.95);
}

.np-lyric-line.active {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
  padding: 20px 0;
}

.np-lyric-line.active .np-lyric-main { font-size: 24px; font-weight: 700; color: #fff; }
.np-lyric-line.active .np-lyric-sub { font-size: 16px; color: rgba(255,255,255,0.85); }

@media (max-width: 768px) {
  .np-inner { -webkit-flex-direction: column; flex-direction: column; }
  .np-left { max-width: 100%; margin-right: 0; margin-bottom: 20px; }
  .np-lyric-wrap { height: 160px; -webkit-flex: none; flex: none; }
}
</style>
