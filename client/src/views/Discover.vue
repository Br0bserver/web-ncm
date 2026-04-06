<template>
  <div class="discover-page">
    <div class="page-header">
      <h1 class="page-title">发现</h1>
    </div>
    <div class="page-content">
      <div class="section">
        <h2 class="section-title">推荐歌单</h2>
        <div class="grid" v-if="recPlaylists.length">
          <div class="card" v-for="pl in recPlaylists" :key="pl.id" v-on:click="openPlaylist(pl)">
            <div class="card-img-wrap">
              <img :src="getCover(pl)" class="card-img" alt="">
              <div class="card-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div class="card-title">{{ pl.name || '' }}</div>
          </div>
        </div>
        <div class="empty" v-else-if="loaded">暂无推荐</div>
        <div class="loading" v-else>
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import musicApi from '../api/music'
import httpModule from '../api/http'

export default {
  name: 'Discover',
  data: function() {
    return {
      recPlaylists: [],
      loaded: false,
    }
  },
  mounted: function() {
    this.loadRecommend()
  },
  methods: {
    loadRecommend: function() {
      var self = this
      musicApi.getRecommendPlaylists().then(function(res) {
        self.loaded = true
        if (res.code === 200 && res.data) {
          self.recPlaylists = res.data
        }
      }).catch(function() {
        self.loaded = true
      })
    },
    getCover: function(pl) {
      var url = ''
      if (pl.coverImgUrl) url = pl.coverImgUrl
      else if (pl.picUrl) url = pl.picUrl
      return url ? this.$proxyImage(url) : ''
    },
    openPlaylist: function(pl) {
      this.$router.push('/playlist/' + pl.id)
    },
  },
}
</script>

<style scoped>
.discover-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 28px;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
  letter-spacing: -0.3px;
}

.grid {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
  margin: -10px;
}

.card {
  width: 160px;
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

.card:hover .card-overlay {
  opacity: 1;
}

.card-img-wrap {
  position: relative;
  border-radius: 12px;
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
  -webkit-transition: -webkit-transform 0.3s ease;
  transition: -webkit-transform 0.3s ease;
  transition: transform 0.3s ease;
  transition: transform 0.3s ease, -webkit-transform 0.3s ease;
}

.card:hover .card-img {
  -webkit-transform: scale(1.05);
  transform: scale(1.05);
}

.card-overlay {
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
  background: rgba(0,0,0,0.35);
  opacity: 0;
  -webkit-transition: opacity 0.2s ease;
  transition: opacity 0.2s ease;
}

.card-title {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty, .loading {
  text-align: center;
  padding: 60px 0;
  color: rgba(255,255,255,0.3);
  font-size: 14px;
}

.spinner {
  width: 28px;
  height: 28px;
  margin: 0 auto;
  border: 2px solid rgba(255,255,255,0.1);
  border-top-color: #fc3c44;
  border-radius: 50%;
  -webkit-animation: spin 0.8s linear infinite;
  animation: spin 0.8s linear infinite;
}

@-webkit-keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
