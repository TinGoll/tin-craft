import Store from 'electron-store'

const store = new Store({
  defaults: {
    minMemory: '2G',
    maxMemory: '6G',
    javaPath: null
  }
})

export default store
