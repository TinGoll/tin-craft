import Store from 'electron-store'

const store = new Store({
  defaults: {
    minMemory: '2G',
    maxMemory: '6G',
    javaPath: null,
    accessToken: null,
    user: null
  }
})

export default store
