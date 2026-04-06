<template>
  <div class="artist-page">
    <div class="artist-hero" v-if="artist">
      <img :src="getArtistCover()" class="artist-cover" alt="">
      <div class="artist-info">
        <h1 class="artist-name">{{ artist.name || '' }}</h1>
        <p class="artist-desc" v-if="artist.briefDesc">{{ artist.briefDesc }}</p>
      </div>
    </div>
    <div class="artist-sections">
      <div class="section" v-if="hotSongs.length">
        <h2 class="section-title">热门歌曲</h2>
        <div class="track-row" v-for="(song, i) in hotSongs" :key="song.id" v-on:click="playSong(song, i)">
          <div class="track-num">{{ i + 1 }}</div>
          <div class="track-info">
            <div class="track-name">{{ song.name || '' }}</div>
            <div class="track-artist">{{ getArtists(song) }}</div>
          </div>
          <div class="track-album">{{ getAlbum(song) }}</div>
          <div class="track-duration">{{ formatDuration(song.dt || song.duration) }}</div>
        </div>
      </div>
      <div class="section" v-if="albums.length">
        <h2 class="section-title">专辑</h2>
        <div class="grid">
          <div class="card" v-for="al in albums" :key="al.id" v-on:click="openAlbum(al)">
            <div class="card-img-wrap">
              <img :src="getAlbumCover(al)" class="card-img" alt="">
            </div>
            <div class="card-title">{{ al.name || '' }}</div>
            <div class="card-count">{{ al.size || 0 }} 首</div>
          </div>
        </div>
      </div>
      <div class="empty" v-if="loaded && hotSongs.length === 0 && albums.length === 0">暂无内容</div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'ArtistPage',
  data: function() {
    return {
      artist: null,
      hotSongs: [],
      albums: [],
      loaded: false,
    }
  },
  mounted: function() {
    this.loadArtist()
  },
  methods: {
    loadArtist: function() {
      var self = this
      var id = self.$route.params.id
      if (!id) return
      musicApi.getArtist(id).then(function(res) {
        self.loaded = true
        if (res.code === 200 && res.data) {
          self.artist = res.data.artist || {}
          self.hotSongs = res.data.hotSongs || []
          self.albums = res.data.albums || []
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
        player.setPlaylist(this.hotSongs)
        player.setIndex(index)
        player.playSong(song)
      }
    },
    openAlbum: function(al) {
      this.$router.push('/album/' + al.id)
    },
    getArtistCover: function() {
      if (!this.artist) return ''
      var url = this.artist.cover || this.artist.picUrl || this.artist.img1v1Url || ''
      return url ? this.$proxyImage(url) : ''
    },
    getAlbumCover: function(al) {
      if (!al) return ''
      var url = al.blurPicUrl || al.picUrl || ''
      return url ? this.$proxyImage(url) : ''
    },
  },
}
</script>

<style scoped>
.artist-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.artist-hero {
  display: -webkit-flex;
  display: flex;
  margin-bottom: 36px;
}

.artist-cover {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  margin-right: 28px;
}

.artist-info {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
}

.artist-name {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.artist-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.artist-sections {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
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
  max-width: 140px;
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

.grid {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
  margin: -10px;
}

.card {
  width: 140px;
  margin: 10px;
  cursor: pointer;
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease;
}

.card:hover {
  -webkit-transform: translateY(-4px);
  transform: translateY(-4px);
}

.card-img-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  padding-top: 100%;
  background: rgba(255,255,255,0.04);
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
}

.card-title {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-count {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  margin-top: 2px;
}

.empty {
  text-align: center;
  padding: 60px 0;
  color: rgba(255,255,255,0.3);
}
</style>
