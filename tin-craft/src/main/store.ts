import Store from 'electron-store'

const store = new Store({
  defaults: {
    minMemory: '2G',
    maxMemory: '4G',
    javaPath: null,
    accessToken: null,
    user: null,
    auth_accessToken: null,
    appliedForceUpdates: {}
  }
})

export default store
