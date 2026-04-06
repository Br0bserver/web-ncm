<template>
  <div class="player-full-page">
    <div class="player-full-inner">
      <div class="pf-left">
        <div class="pf-cover-wrap">
          <img :src="coverUrl" class="pf-cover" alt="">
        </div>
        <div class="pf-meta">
          <h2 class="pf-name">{{ currentSong ? currentSong.name : '未播放' }}</h2>
          <p class="pf-artist">{{ currentSong ? getArtists(currentSong) : '' }}</p>
          <p class="pf-album" v-if="currentSong && getAlbum(currentSong)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            {{ getAlbum(currentSong) }}
          </p>
        </div>
        <div class="pf-controls">
          <button class="pf-btn" v-on:click="cycleMode" :title="modeLabel">
            <svg v-if="playerMode === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <svg v-else-if="playerMode === 'single'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="9.5" y="15.5" font-size="9" fill="currentColor" stroke="none" font-weight="bold">1</text></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
          </button>
          <button class="pf-btn" v-on:click="playerPrev">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>
          <button class="pf-btn pf-btn-play" v-on:click="playerToggle">
            <svg v-if="playerPlaying" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="pf-btn" v-on:click="playerNext">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
          <div class="pf-vol">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <input type="range" class="pf-vol-slider" min="0" max="100" :value="playerVolume" v-on:input="setPlayerVolume">
          </div>
        </div>
        <div class="pf-progress">
          <div class="pf-bar" v-on:click="seekTo">
            <div class="pf-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="pf-time">
            <span>{{ currentTimeStr }}</span>
            <span>{{ durationStr }}</span>
          </div>
        </div>
      </div>
      <div class="pf-right">
        <div class="pf-lyric-title">歌词</div>
        <div class="pf-lyric-wrap" ref="lyricWrap">
          <div class="pf-lyric" v-if="lyricLines.length > 0">
            <div class="pf-lyric-line" v-for="(line, i) in lyricLines" :key="i" :class="{ active: i === activeLyricIndex }">
              {{ line.text }}
            </div>
          </div>
          <div class="pf-lyric-empty" v-else>暂无歌词</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'PlayerFull',
  data: function() {
    return {
      currentSong: null,
      playing: false,
      currentTime: 0,
      duration: 0,
      progressPercent: 0,
      lyricLines: [],
      activeLyricIndex: -1,
      playerVolume: 80,
      playerMode: 'list',
    }
  },
  computed: {
    coverUrl: function() {
      if (!this.currentSong) return ''
      var al = this.currentSong.al || this.currentSong.album
      return (al && al.picUrl) || ''
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
  },
  mounted: function() {
    var self = this
    var player = self.$root.$options.player
    if (player && player.onChange) {
      player.onChange(function() {
        var state = player.getState()
        self.currentSong = state.currentSong
        self.playing = state.playing
        self.playerVolume = state.volume
        self.playerMode = state.mode
        if (state.currentSong && state.currentSong.id) {
          self.loadLyric()
        }
      })
    }
    if (player && player.getState) {
      var initState = player.getState()
      self.currentSong = initState.currentSong
      self.playing = initState.playing
      self.playerVolume = initState.volume
      self.playerMode = initState.mode
      self.bindAudio(initState.audio)
    }
  },
  methods: {
    getArtists: function(song) {
      if (!song) return ''
      var arr = song.ar || song.artists || []
      var names = []
      for (var i = 0; i < arr.length; i++) names.push(arr[i].name)
      return names.join(' / ')
    },
    getAlbum: function(song) {
      if (!song) return ''
      var al = song.al || song.album
      return (al && al.name) || ''
    },
    bindAudio: function(audio) {
      var self = this
      if (!audio) return
      audio.ontimeupdate = function() {
        self.currentTime = audio.currentTime
        self.duration = audio.duration || 0
        if (self.duration > 0) {
          self.progressPercent = (self.currentTime / self.duration) * 100
        }
        self.updateLyric()
      }
      audio.onplay = function() { self.playing = true }
      audio.onpause = function() { self.playing = false }
      audio.onended = function() {
        var player = self.$root.$options.player
        if (player) player.next()
      }
      this.loadLyric()
    },
    playerToggle: function() {
      var player = this.$root.$options.player
      if (!player) return
      this.playing ? player.pause() : player.resume()
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
    setPlayerVolume: function(e) {
      var vol = parseInt(e.target.value, 10)
      var player = this.$root.$options.player
      if (player) player.setVolume(vol)
    },
    seekTo: function(e) {
      var player = this.$root.$options.player
      if (!player || !player.getState) return
      var audio = player.getState().audio
      if (!audio || !this.duration) return
      var rect = e.currentTarget.getBoundingClientRect()
      var ratio = (e.clientX - rect.left) / rect.width
      audio.currentTime = ratio * this.duration
    },
    loadLyric: function() {
      var self = this
      if (!this.currentSong || !this.currentSong.id) return
      musicApi.getLyric(this.currentSong.id).then(function(res) {
        if (res.code === 200 && res.data) {
          var lrc = res.data.lyric || ''
          if (typeof lrc === 'string') {
            self.lyricLines = self.parseLyric(lrc)
          }
        }
      }).catch(function() {})
    },
    parseLyric: function(text) {
      var lines = text.split('\n')
      var result = []
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i]
        var match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
        if (match) {
          var min = parseInt(match[1], 10)
          var sec = parseInt(match[2], 10)
          var ms = parseInt(match[3], 10)
          if (match[3].length === 2) ms = ms * 10
          var time = min * 60 + sec + ms / 1000
          var txt = match[4].replace(/^\s+|\s+$/g, '')
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
      var activeEl = wrap.querySelector('.pf-lyric-line.active')
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
.player-full-page {
  min-height: calc(100vh - 52px);
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  padding: 40px 24px;
}

.player-full-inner {
  display: -webkit-flex;
  display: flex;
  max-width: 1000px;
  width: 100%;
}

.pf-left {
  -webkit-flex: 1;
  flex: 1;
  max-width: 420px;
  margin-right: 48px;
}

.pf-cover-wrap {
  width: 100%;
  padding-top: 100%;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.5);
  background: rgba(255,255,255,0.04);
}

.pf-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
}

.pf-meta {
  margin-bottom: 24px;
}

.pf-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

.pf-artist {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
}

.pf-album {
  font-size: 12px;
  color: rgba(255,255,255,0.25);
  margin-top: 6px;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.pf-album svg {
  margin-right: 4px;
}

.pf-controls {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  margin-bottom: 20px;
}

.pf-btn + .pf-btn {
  margin-left: 16px;
}

.pf-btn {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  border-radius: 50%;
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

.pf-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

.pf-btn-play {
  width: 52px;
  height: 52px;
  color: #fff;
  background: #fc3c44;
}

.pf-btn-play:hover { background: #e8353d; }

.pf-vol {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  margin-left: 16px;
  color: rgba(255,255,255,0.4);
}

.pf-vol svg {
  margin-right: 6px;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.pf-vol-slider {
  width: 70px;
  height: 3px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.pf-vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.pf-progress {
  margin-bottom: 8px;
}

.pf-bar {
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 8px;
}

.pf-bar-fill {
  height: 100%;
  background: #fc3c44;
  border-radius: 2px;
  -webkit-transition: width 0.3s linear;
  transition: width 0.3s linear;
}

.pf-time {
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.3);
}

.pf-right {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
}

.pf-lyric-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.6);
  margin-bottom: 16px;
}

.pf-lyric-wrap {
  height: 400px;
  overflow-y: auto;
  padding-top: 160px;
  padding-bottom: 160px;
}

.pf-lyric-line {
  padding: 8px 0;
  font-size: 15px;
  color: rgba(255,255,255,0.3);
  line-height: 1.6;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.pf-lyric-line.active {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.pf-lyric-empty {
  padding: 40px 0;
  text-align: center;
  color: rgba(255,255,255,0.2);
  font-size: 14px;
}

@media (max-width: 768px) {
  .player-full-inner {
    -webkit-flex-direction: column;
    flex-direction: column;
  }
  .pf-left {
    max-width: 100%;
    margin-right: 0;
    margin-bottom: 32px;
  }
  .pf-lyric-wrap {
    height: 200px;
  }
}
</style>
