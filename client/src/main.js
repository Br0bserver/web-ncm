import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import playerModule from './store/player'
import authApi from './api/auth'
import httpApi from './api/http'

Vue.prototype.$proxyImage = httpApi.proxyImage

Vue.use(VueRouter)

var Discover = function() { return import('./views/Discover.vue') }
var Search = function() { return import('./views/Search.vue') }
var Mine = function() { return import('./views/Mine.vue') }
var Login = function() { return import('./views/Login.vue') }
var NowPlaying = function() { return import('./views/NowPlaying.vue') }
var PlaylistDetail = function() { return import('./views/PlaylistDetail.vue') }
var AlbumPage = function() { return import('./views/AlbumPage.vue') }
var ArtistPage = function() { return import('./views/ArtistPage.vue') }

var routes = [
  { path: '/', redirect: '/discover' },
  { path: '/login', component: Login },
  { path: '/discover', component: Discover },
  { path: '/search', component: Search },
  { path: '/mine', component: Mine },
  { path: '/now-playing', component: NowPlaying },
  { path: '/playlist/:id', component: PlaylistDetail },
  { path: '/album/:id', component: AlbumPage },
  { path: '/artist/:id', component: ArtistPage },
]

var router = new VueRouter({
  mode: 'hash',
  routes: routes,
  scrollBehavior: function() {
    return { x: 0, y: 0 }
  },
})

function checkLoginAndRedirect(to, next) {
  authApi.getAuthStatus().then(function(res) {
    if (res.code === 200 && res.data && res.data.loggedIn) {
      if (to.path === '/login') {
        next('/discover')
      } else {
        next()
      }
    } else {
      if (to.path === '/login') {
        next()
      } else {
        next('/login')
      }
    }
  }).catch(function() {
    if (to.path !== '/login') {
      next('/login')
    } else {
      next()
    }
  })
}

router.beforeEach(function(to, from, next) {
  checkLoginAndRedirect(to, next)
})

var player = playerModule.createPlayer()

var app = new Vue({
  router: router,
  player: player,
  render: function(h) { return h(App) },
}).$mount('#app')
