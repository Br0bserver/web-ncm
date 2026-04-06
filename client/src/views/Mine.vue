<template>
  <div class="mine-page">
    <div class="page-header">
      <div class="user-card" v-if="userInfo">
        <img :src="userAvatar" class="user-avatar" alt="">
        <div class="user-info">
          <h1 class="user-name">{{ userInfo.nickname || '' }}</h1>
          <p class="user-desc" v-if="userInfo.signature">{{ userInfo.signature }}</p>
        </div>
      </div>
    </div>
    <div class="page-content">
      <div class="section">
        <h2 class="section-title">我的歌单</h2>
        <div class="grid" v-if="playlists.length">
          <div class="card" v-for="pl in playlists" :key="pl.id" v-on:click="openPlaylist(pl)">
            <div class="card-img-wrap">
              <img :src="getCover(pl)" class="card-img" alt="">
              <div class="card-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div class="card-title">{{ pl.name || '' }}</div>
            <div class="card-count">{{ pl.trackCount || 0 }} 首</div>
          </div>
        </div>
        <div class="empty" v-else-if="loaded">暂无歌单</div>
        <div class="loading" v-else>
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userApi from '../api/user'

export default {
  name: 'Mine',
  data: function() {
    return {
      userInfo: null,
      playlists: [],
      loaded: false,
    }
  },
  computed: {
    userAvatar: function() {
      var url = ''
      if (this.userInfo && this.userInfo.avatarUrl) url = this.userInfo.avatarUrl
      if (this.userInfo && this.userInfo.profile && this.userInfo.profile.avatarUrl) url = this.userInfo.profile.avatarUrl
      return url ? this.$proxyImage(url) : ''
    },
  },
  mounted: function() {
    this.loadData()
  },
  methods: {
    loadData: function() {
      var self = this
      userApi.getProfile().then(function(res) {
        if (res.code === 200 && res.data) {
          self.userInfo = res.data
          var uid = res.data.userId || (res.data.profile && res.data.profile.userId)
          if (!uid) return
          return userApi.getPlaylists(uid)
        }
      }).then(function(res) {
        if (res && res.code === 200 && Array.isArray(res.data)) {
          self.playlists = res.data
        }
        self.loaded = true
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
.mine-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.user-card {
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  -o-object-fit: cover;
  object-fit: cover;
  margin-right: 16px;
}

.user-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}

.user-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
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
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-count {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  margin-top: 4px;
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
