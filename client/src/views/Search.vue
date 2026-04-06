<template>
  <div class="search-page">
    <div class="search-bar">
      <div class="search-input-wrap">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="search-input" type="text" v-model="keyword" v-on:keyup.enter="doSearch" placeholder="搜索歌曲、歌手、专辑..." ref="input">
        <button class="search-btn" v-on:click="doSearch">搜索</button>
      </div>
    </div>
    <div class="search-tabs" v-if="searched">
      <div class="search-tab" :class="{ active: activeTab === 'songs' }" v-on:click="switchTab('songs')">歌曲</div>
      <div class="search-tab" :class="{ active: activeTab === 'artists' }" v-on:click="switchTab('artists')">歌手</div>
      <div class="search-tab" :class="{ active: activeTab === 'albums' }" v-on:click="switchTab('albums')">专辑</div>
    </div>
    <div class="search-content">
      <div v-if="activeTab === 'songs' && songs.length" class="result-list">
        <div class="song-row" v-for="(song, i) in songs" :key="song.id" v-on:click="playSong(song)">
          <div class="song-row-index">{{ i + 1 }}</div>
          <img v-if="getCover(song)" :src="getCover(song)" class="song-row-cover" alt="">
          <div class="song-row-info">
            <div class="song-row-name">{{ song.name || '' }}</div>
            <div class="song-row-artist">{{ getArtists(song) }}</div>
          </div>
          <div class="song-row-album">{{ getAlbum(song) }}</div>
          <div class="song-row-play">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>
      <div v-if="activeTab === 'artists' && artists.length" class="artist-grid">
        <div class="artist-card" v-for="ar in artists" :key="ar.id" v-on:click="openArtist(ar)">
          <img :src="getArtistCover(ar)" class="artist-card-img" alt="">
          <div class="artist-card-name">{{ ar.name || '' }}</div>
        </div>
      </div>
      <div v-if="activeTab === 'albums' && albums.length" class="album-grid">
        <div class="album-card" v-for="al in albums" :key="al.id" v-on:click="openAlbum(al)">
          <div class="album-card-img-wrap">
            <img :src="getAlbumCover(al)" class="album-card-img" alt="">
          </div>
          <div class="album-card-name">{{ al.name || '' }}</div>
          <div class="album-card-artist">{{ getAlbumArtist(al) }}</div>
        </div>
      </div>
      <div class="empty" v-if="searched && isEmptyResult">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity:0.2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>未找到相关结果</p>
      </div>
      <div class="empty" v-if="!searched">
        <p style="color:rgba(255,255,255,0.3)">输入关键词开始搜索</p>
      </div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'

export default {
  name: 'Search',
  data: function() {
    return {
      keyword: '',
      songs: [],
      artists: [],
      albums: [],
      activeTab: 'songs',
      searched: false,
    }
  },
  computed: {
    isEmptyResult: function() {
      return this.songs.length === 0 && this.artists.length === 0 && this.albums.length === 0
    },
  },
  mounted: function() {
    var self = this
    var q = self.$route.query.q
    if (q) {
      self.keyword = q
      self.doSearch()
    }
    if (self.$refs.input) self.$refs.input.focus()
  },
  methods: {
    doSearch: function() {
      var self = this
      if (!self.keyword.trim()) return
      var kw = self.keyword.trim()
      musicApi.search(kw, 1, 50).then(function(res) {
        if (res.code === 200 && res.data) {
          self.songs = res.data.songs || []
        } else {
          self.songs = []
        }
      }).catch(function() {
        self.songs = []
      })
      musicApi.search(kw, 100, 30).then(function(res) {
        if (res.code === 200 && res.data) {
          self.artists = res.data.artists || []
        } else {
          self.artists = []
        }
      }).catch(function() {
        self.artists = []
      })
      musicApi.search(kw, 10, 30).then(function(res) {
        if (res.code === 200 && res.data) {
          self.albums = res.data.albums || []
        } else {
          self.albums = []
        }
      }).catch(function() {
        self.albums = []
      })
      self.searched = true
    },
    switchTab: function(tab) {
      this.activeTab = tab
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
    getCover: function(song) {
      if (!song) return ''
      var al = song.al || song.album
      var url = (al && al.picUrl) || ''
      return url ? this.$proxyImage(url) : ''
    },
    getAlbumArtist: function(al) {
      if (!al) return ''
      var ar = al.artist || al.artists
      if (ar) return ar.name || ''
      return ''
    },
    getArtistCover: function(ar) {
      if (!ar) return ''
      var url = ar.picUrl || ar.img1v1Url || ''
      return url ? this.$proxyImage(url) : ''
    },
    getAlbumCover: function(al) {
      if (!al) return ''
      var url = al.blurPicUrl || al.picUrl || ''
      return url ? this.$proxyImage(url) : ''
    },
    playSong: function(song) {
      var player = this.$root.$options.player
      if (player) {
        player.playSong(song)
      }
    },
    openArtist: function(ar) {
      this.$router.push('/artist/' + ar.id)
    },
    openAlbum: function(al) {
      this.$router.push('/album/' + al.id)
    },
  },
}
</script>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 24px 32px;
}

.search-bar {
  margin-bottom: 16px;
}

.search-input-wrap {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0 16px;
  -webkit-transition: all 0.2s ease;
  transition: all 0.2s ease;
}

.search-input-wrap.focused {
  border-color: rgba(252, 60, 68, 0.4);
  background: rgba(255,255,255,0.08);
}

.search-icon {
  color: rgba(255,255,255,0.3);
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.search-input {
  -webkit-flex: 1;
  flex: 1;
  padding: 14px 12px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 15px;
  outline: none;
}

.search-input::-webkit-input-placeholder {
  color: rgba(255,255,255,0.25);
}

.search-btn {
  padding: 8px 20px;
  background: #fc3c44;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  -webkit-transition: background 0.15s ease;
  transition: background 0.15s ease;
}

.search-btn:hover { background: #e8353d; }

.search-tabs {
  display: -webkit-flex;
  display: flex;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.search-tab {
  padding: 8px 16px;
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  -webkit-transition: all 0.15s ease;
  transition: all 0.15s ease;
}

.search-tab:hover {
  color: rgba(255,255,255,0.7);
}

.search-tab.active {
  color: #fff;
  border-bottom-color: #fc3c44;
}

.result-list {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
}

.song-row {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  -webkit-transition: background 0.15s ease;
  transition: background 0.15s ease;
}

.song-row + .song-row {
  margin-top: 2px;
}

.song-row:hover {
  background: rgba(255,255,255,0.04);
}

.song-row:hover .song-row-play {
  opacity: 1;
}

.song-row-index {
  width: 28px;
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.25);
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.song-row-cover {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
  margin-right: 12px;
}

.song-row-info {
  -webkit-flex: 1;
  flex: 1;
  min-width: 0;
}

.song-row-name {
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}

.song-row-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.song-row-album {
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

.song-row-play {
  opacity: 0;
  color: rgba(255,255,255,0.6);
  -webkit-transition: opacity 0.15s ease;
  transition: opacity 0.15s ease;
  -webkit-flex-shrink: 0;
  flex-shrink: 0;
}

.artist-grid {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
  margin: -10px;
}

.artist-card {
  width: 120px;
  margin: 10px;
  text-align: center;
  cursor: pointer;
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease;
}

.artist-card:hover {
  -webkit-transform: translateY(-4px);
  transform: translateY(-4px);
}

.artist-card-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  margin: 0 auto;
}

.artist-card-name {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  white-space: nowrap;
  overflow: hidden;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
}

.album-grid {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
  margin: -10px;
}

.album-card {
  width: 140px;
  margin: 10px;
  cursor: pointer;
  -webkit-transition: -webkit-transform 0.2s ease;
  transition: -webkit-transform 0.2s ease;
  transition: transform 0.2s ease;
  transition: transform 0.2s ease, -webkit-transform 0.2s ease;
}

.album-card:hover {
  -webkit-transform: translateY(-4px);
  transform: translateY(-4px);
}

.album-card-img-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  padding-top: 100%;
  background: rgba(255,255,255,0.04);
}

.album-card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
}

.album-card-name {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-card-artist {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}

.empty {
  text-align: center;
  padding: 80px 0;
  color: rgba(255,255,255,0.3);
}

.empty p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
