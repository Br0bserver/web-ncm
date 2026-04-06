<template>
  <div class="album-page">
    <div class="album-hero" v-if="album">
      <img :src="getAlbumCover()" class="album-cover" alt="">
      <div class="album-info">
        <h1 class="album-name">{{ album.name || '' }}</h1>
        <p class="album-artist" v-on:click="openArtist" v-if="album.artist">{{ album.artist.name || '' }}</p>
        <p class="album-date">{{ album.publishTime ? formatDate(album.publishTime) : '' }}</p>
      </div>
    </div>
    <div class="album-tracks">
      <div class="track-row" v-for="(song, i) in songs" :key="song.id || i" v-on:click="playSong(song, i)">
        <div class="track-num">{{ i + 1 }}</div>
        <div class="track-info">
          <div class="track-name">{{ song.name || '' }}</div>
          <div class="track-artist">{{ getArtists(song) }}</div>
        </div>
        <div class="track-duration">{{ formatDuration(song.dt || song.duration) }}</div>
      </div>
      <div class="empty" v-if="loaded && songs.length === 0">暂无歌曲</div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'AlbumPage',
  data: function() {
    return {
      album: null,
      songs: [],
      loaded: false,
    }
  },
  mounted: function() {
    this.loadAlbum()
  },
  methods: {
    loadAlbum: function() {
      var self = this
      var id = self.$route.params.id
      if (!id) return
      musicApi.getAlbumDetail(id).then(function(res) {
        self.loaded = true
        if (res.code === 200 && res.data) {
          self.album = res.data.album || res.data
          self.songs = res.data.songs || []
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
    formatDate: function(ts) {
      if (!ts) return ''
      var d = new Date(ts)
      return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
    },
    getAlbumCover: function() {
      if (!this.album) return ''
      var url = this.album.blurPicUrl || this.album.picUrl || ''
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
        player.setPlaylist(this.songs)
        player.setIndex(index)
        player.playSong(song)
      }
    },
    openArtist: function() {
      if (this.album && this.album.artist && this.album.artist.id) {
        this.$router.push('/artist/' + this.album.artist.id)
      }
    },
  },
}
</script>

<style scoped>
.album-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.album-hero {
  display: -webkit-flex;
  display: flex;
  margin-bottom: 36px;
}

.album-cover {
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

.album-info {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
}

.album-name {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.album-artist {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  margin-top: 8px;
  cursor: pointer;
}

.album-artist:hover {
  color: rgba(255,255,255,0.8);
}

.album-date {
  font-size: 13px;
  color: rgba(255,255,255,0.3);
  margin-top: 4px;
}

.album-tracks {
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
