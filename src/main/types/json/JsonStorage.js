import storage from 'electron-json-storage'

import JsonWithKeyPaths from './JsonWithKeyPaths'

class JsonStorage {
  constructor(directory, name, obj) {
    this.obj = new JsonWithKeyPaths(obj)
    this.name = name
    this.directory = directory
  }

  getFromStorage() {
    return new Promise((resolve, reject) => {
      storage.get(this.name, {dataPath: this.directory}, (err, data) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        else {
          this.obj.setAll(data)
          resolve(data)
        }
      })
    })
  }

  // if defaultValue is set, and neither the cache nor storage has the key
  //   the cache and storage will be set to the defaultValue
  get(key, defaultValue = null) {
    return new Promise(async (resolve, reject) => {
      if (this.obj.has(key)) {
        resolve(this.obj.get(key))
      }
      else {
        // check storage
        await this.getFromStorage()
        // we use this.obj again because getFromStorage refreshes the cache
        if (this.obj.has(key)) {
          resolve(this.obj.get(key))
        }
        else if (defaultValue !== null) {
          await this.set(key, defaultValue)
          resolve(defaultValue)
        }
        else {
          resolve(undefined)
        }
      }
    })
  }

  async getAll() {
    return await this.getFromStorage()
  }

  setToStorage() {
    return new Promise((resolve, reject) => {
      storage.set(this.name, this.obj.obj, {dataPath: this.directory}, (error) => {
        if (error) {
          reject(error)
        }
        else {
          resolve()
        }
      })
    })
  }

  async set(key, value) {
    this.obj.set(key, value)
    await this.setToStorage()
  }

  async setAll(value) {
    this.obj.setAll(value)
    await this.setToStorage()
  }
}

export default JsonStorage