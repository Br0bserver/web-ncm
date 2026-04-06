<template>
  <div class="playlist-detail-page">
    <div class="playlist-hero" v-if="playlist">
      <img :src="getPlaylistCover()" class="hero-cover" alt="">
      <div class="hero-info">
        <h1 class="hero-title">{{ playlist.name || '' }}</h1>
        <p class="hero-creator">{{ playlist.creator ? playlist.creator.nickname : '' }}</p>
        <p class="hero-count" v-if="playlist.tracks">{{ playlist.tracks.length }} 首歌曲</p>
        <button class="hero-play-all" v-on:click="playAll">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          播放全部
        </button>
      </div>
    </div>
    <div class="playlist-tracks">
      <div class="track-row" v-for="(song, i) in tracks" :key="song.id || i" v-on:click="playSong(song, i)">
        <div class="track-num">{{ i + 1 }}</div>
        <div class="track-info">
          <div class="track-name">{{ song.name || '' }}</div>
          <div class="track-artist">{{ getArtists(song) }}</div>
        </div>
        <div class="track-album">{{ getAlbum(song) }}</div>
        <div class="track-duration">{{ formatDuration(song.dt || song.duration) }}</div>
      </div>
      <div class="empty" v-if="loaded && tracks.length === 0">暂无歌曲</div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'PlaylistDetail',
  data: function() {
    return {
      playlist: null,
      tracks: [],
      loaded: false,
    }
  },
  mounted: function() {
    this.loadPlaylist()
  },
  methods: {
    loadPlaylist: function() {
      var self = this
      var id = self.$route.params.id
      if (!id) return
      musicApi.getPlaylistDetail(id).then(function(res) {
        self.loaded = true
        if (res.code === 200 && res.data) {
          self.playlist = res.data
          self.tracks = res.data.tracks || []
        }
      }).catch(function() {
        self.loaded = true
      })
    },
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
    getPlaylistCover: function() {
      if (!this.playlist) return ''
      var url = this.playlist.coverImgUrl || ''
      return url ? this.$proxyImage(url) : ''
    },
    formatDuration: function(ms) {
      if (!ms) return '--:--'
      var sec = Math.floor(ms / 1000)
      var m = Math.floor(sec / 60)
      var s = sec % 60
      return m + ':' + (s < 10 ? '0' : '') + s
    },
    playSong: function(song, index) {
      var player = this.$root.$options.player
      if (player) {
        player.setPlaylist(this.tracks)
        player.setIndex(index)
        player.playSong(song)
      }
    },
    playAll: function() {
      var player = this.$root.$options.player
      if (player && this.tracks.length > 0) {
        player.setPlaylist(this.tracks)
        player.setIndex(0)
        player.playSong(this.tracks[0])
      }
    },
  },
}
</script>

<style scoped>
.playlist-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.playlist-hero {
  display: -webkit-flex;
  display: flex;
  margin-bottom: 36px;
}

.hero-cover {
  width: 200px;
  height: 200px;
  border-radius: 14px;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  margin-right: 28px;
}

.hero-info {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
}

.hero-title {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.hero-creator {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin-top: 8px;
}

.hero-count {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  margin-top: 4px;
}

.hero-play-all {
  display: -webkit-inline-flex;
  display: inline-flex;
  -webkit-align-items: center;
  align-items: center;
  margin-top: 16px;
  padding: 10px 24px;
  background: #fc3c44;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  -webkit-transition: background 0.15s ease;
  transition: background 0.15s ease;
  -webkit-align-self: flex-start;
  align-self: flex-start;
}

.hero-play-all:hover { background: #e8353d; }

.playlist-tracks {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.track-row {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  -webkit-transition: background 0.15s ease;
  transition: background 0.15s ease;
}

.track-row + .track-row {
  margin-top: 2px;
}

.track-row:hover {
  background: rgba(255,255,255,0.04);
}

.track-num {
  width: 28px;
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.25);
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 12px;
}

.track-info {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
}

.track-name {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.track-album {
  font-size: 12px;
  color: rgba(255,255,255,0.25);
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-left: 12px;
  margin-right: 12px;
}

.track-duration {
  font-size: 12px;
  color: rgba(255,255,255,0.25);
  width: 48px;
  text-align: right;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: rgba(255,255,255,0.3);
}
</style>
