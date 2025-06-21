"use client"

// Base de datos local usando IndexedDB
class LocalDatabase {
  private dbName = "el-insti-pos"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Crear stores (tablas)
        if (!db.objectStoreNames.contains("usuarios")) {
          const usuariosStore = db.createObjectStore("usuarios", { keyPath: "id", autoIncrement: true })
          usuariosStore.createIndex("email", "email", { unique: true })
        }

        if (!db.objectStoreNames.contains("productos")) {
          const productosStore = db.createObjectStore("productos", { keyPath: "id", autoIncrement: true })
          productosStore.createIndex("activo", "activo")
        }

        if (!db.objectStoreNames.contains("comandas")) {
          const comandasStore = db.createObjectStore("comandas", { keyPath: "id", autoIncrement: true })
          comandasStore.createIndex("estado", "estado")
          comandasStore.createIndex("fecha", "created_at")
        }

        if (!db.objectStoreNames.contains("eventos")) {
          db.createObjectStore("eventos", { keyPath: "id", autoIncrement: true })
        }

        if (!db.objectStoreNames.contains("caja")) {
          db.createObjectStore("caja", { keyPath: "id", autoIncrement: true })
        }
      }
    })
  }

  async add(storeName: string, data: any): Promise<number> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.add({ ...data, created_at: new Date().toISOString() })

      request.onsuccess = () => resolve(request.result as number)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getById(storeName: string, id: number): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async update(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put({ ...data, updated_at: new Date().toISOString() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getByIndex(storeName: string, indexName: string, value: any): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
}

export const localDB = new LocalDatabase()
