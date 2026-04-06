import httpApi from '../api/http'

function createPlayer() {
  var audio = new Audio()
  audio.volume = 0.8

  var state = {
    audio: audio,
    playlist: [],
    index: -1,
    currentSong: null,
    playing: false,
    volume: 80,
    mode: 'list',
  }

  var changeListeners = []

  function notifyChange() {
    for (var i = 0; i < changeListeners.length; i++) {
      changeListeners[i]()
    }
  }

  function onChange(fn) {
    changeListeners.push(fn)
  }

  function playSong(song) {
    if (!song) return
    state.currentSong = song
    notifyChange()
    
    var t = httpApi.getToken()
    var tokenParam = t ? '&token=' + t : ''
    audio.src = '/media/audio?id=' + song.id + tokenParam
    
    audio.play().catch(function() {})
    state.playing = true
    notifyChange()
  }

  function pause() {
    audio.pause()
    state.playing = false
    notifyChange()
  }

  function resume() {
    if (audio.src) {
      audio.play().catch(function() {})
      state.playing = true
      notifyChange()
    }
  }

  function setPlaylist(list) {
    state.playlist = list || []
    notifyChange()
  }

  function setIndex(idx) {
    state.index = idx
    notifyChange()
  }

  function next() {
    if (state.playlist.length === 0) return
    if (state.mode === 'single') {
      audio.currentTime = 0
      audio.play().catch(function() {})
      return
    }
    if (state.mode === 'shuffle') {
      var randIdx
      if (state.playlist.length > 1) {
        do {
          randIdx = Math.floor(Math.random() * state.playlist.length)
        } while (randIdx === state.index)
      } else {
        randIdx = 0
      }
      state.index = randIdx
      notifyChange()
      playSong(state.playlist[randIdx])
      return
    }
    var nextIdx = state.index + 1
    if (nextIdx >= state.playlist.length) {
      nextIdx = 0
    }
    state.index = nextIdx
    notifyChange()
    playSong(state.playlist[nextIdx])
  }

  function prev() {
    if (state.playlist.length === 0) return
    var prevIdx = state.index - 1
    if (prevIdx < 0) {
      prevIdx = state.playlist.length - 1
    }
    state.index = prevIdx
    notifyChange()
    playSong(state.playlist[prevIdx])
  }

  function setVolume(vol) {
    state.volume = vol
    audio.volume = vol / 100
    notifyChange()
  }

  function cycleMode() {
    var modes = ['list', 'single', 'shuffle']
    var idx = modes.indexOf(state.mode)
    idx = (idx + 1) % modes.length
    state.mode = modes[idx]
    notifyChange()
  }

  function setMode(mode) {
    state.mode = mode
    notifyChange()
  }

  function getState() {
    return {
      audio: audio,
      currentSong: state.currentSong,
      playing: state.playing,
      volume: state.volume,
      playlist: state.playlist,
      index: state.index,
      mode: state.mode,
    }
  }

  return {
    onChange: onChange,
    getState: getState,
    playSong: playSong,
    pause: pause,
    resume: resume,
    next: next,
    prev: prev,
    setPlaylist: setPlaylist,
    setIndex: setIndex,
    setVolume: setVolume,
    cycleMode: cycleMode,
    setMode: setMode,
  }
}

export default {
  createPlayer: createPlayer,
}
