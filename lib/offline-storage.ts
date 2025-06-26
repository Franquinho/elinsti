"use client"

// Sistema de almacenamiento offline para el rol de Caja
// Utiliza IndexedDB para persistir datos localmente

interface OfflineComanda {
  id: string; // ID temporal generado localmente
  usuario_id: number;
  evento_id: number;
  total: number;
  nombre_cliente: string;
  productos: Array<{
    id: number;
    cantidad: number;
    precio: number;
  }>;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago?: 'efectivo' | 'transferencia' | 'invitacion';
  nota?: string;
  fecha_creacion: string;
  sincronizado: boolean;
}

interface OfflinePago {
  id: string;
  comanda_id: string;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  metodo_pago: 'efectivo' | 'transferencia' | 'invitacion';
  monto: number;
  nota?: string;
  fecha_creacion: string;
  sincronizado: boolean;
}

interface OfflineCaja {
  id: string;
  monto_inicial: number;
  monto_final?: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: 'abierta' | 'cerrada';
  sincronizado: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'INSTI_OfflineDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('🔴 Error abriendo IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('🟢 IndexedDB inicializado correctamente');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear store para comandas offline
        if (!db.objectStoreNames.contains('comandas')) {
          const comandasStore = db.createObjectStore('comandas', { keyPath: 'id' });
          comandasStore.createIndex('sincronizado', 'sincronizado', { unique: false });
          comandasStore.createIndex('fecha_creacion', 'fecha_creacion', { unique: false });
        }

        // Crear store para pagos offline
        if (!db.objectStoreNames.contains('pagos')) {
          const pagosStore = db.createObjectStore('pagos', { keyPath: 'id' });
          pagosStore.createIndex('comanda_id', 'comanda_id', { unique: false });
          pagosStore.createIndex('sincronizado', 'sincronizado', { unique: false });
        }

        // Crear store para caja offline
        if (!db.objectStoreNames.contains('caja')) {
          const cajaStore = db.createObjectStore('caja', { keyPath: 'id' });
          cajaStore.createIndex('estado', 'estado', { unique: false });
          cajaStore.createIndex('sincronizado', 'sincronizado', { unique: false });
        }

        // Crear store para configuración offline
        if (!db.objectStoreNames.contains('config')) {
          const configStore = db.createObjectStore('config', { keyPath: 'key' });
        }

        console.log('🟢 Estructura de IndexedDB creada');
      };
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) {
      await this.init();
    }
    
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Métodos para comandas offline
  async guardarComandaOffline(comanda: Omit<OfflineComanda, 'id' | 'sincronizado'>): Promise<string> {
    const store = await this.getStore('comandas', 'readwrite');
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const comandaOffline: OfflineComanda = {
      ...comanda,
      id,
      sincronizado: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(comandaOffline);
      request.onsuccess = () => {
        console.log('🟢 Comanda guardada offline:', id);
        resolve(id);
      };
      request.onerror = () => {
        console.error('🔴 Error guardando comanda offline:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerComandasOffline(): Promise<OfflineComanda[]> {
    const store = await this.getStore('comandas');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('🔴 Error obteniendo comandas offline:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerComandasNoSincronizadas(): Promise<OfflineComanda[]> {
    const store = await this.getStore('comandas');
    const index = store.index('sincronizado');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('🔴 Error obteniendo comandas no sincronizadas:', request.error);
        reject(request.error);
      };
    });
  }

  async marcarComandaSincronizada(id: string): Promise<void> {
    const store = await this.getStore('comandas', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const comanda = getRequest.result;
        if (comanda) {
          comanda.sincronizado = true;
          const updateRequest = store.put(comanda);
          updateRequest.onsuccess = () => {
            console.log('🟢 Comanda marcada como sincronizada:', id);
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('🔴 Error marcando comanda como sincronizada:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Comanda no encontrada'));
        }
      };
      getRequest.onerror = () => {
        console.error('🔴 Error obteniendo comanda para marcar como sincronizada:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  async eliminarComandaOffline(id: string): Promise<void> {
    const store = await this.getStore('comandas', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => {
        console.log('🟢 Comanda eliminada offline:', id);
        resolve();
      };
      request.onerror = () => {
        console.error('🔴 Error eliminando comanda offline:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos para pagos offline
  async guardarPagoOffline(pago: Omit<OfflinePago, 'id' | 'sincronizado'>): Promise<string> {
    const store = await this.getStore('pagos', 'readwrite');
    const id = `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pagoOffline: OfflinePago = {
      ...pago,
      id,
      sincronizado: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(pagoOffline);
      request.onsuccess = () => {
        console.log('🟢 Pago guardado offline:', id);
        resolve(id);
      };
      request.onerror = () => {
        console.error('🔴 Error guardando pago offline:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerPagosNoSincronizados(): Promise<OfflinePago[]> {
    const store = await this.getStore('pagos');
    const index = store.index('sincronizado');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        console.error('🔴 Error obteniendo pagos no sincronizados:', request.error);
        reject(request.error);
      };
    });
  }

  async marcarPagoSincronizado(id: string): Promise<void> {
    const store = await this.getStore('pagos', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const pago = getRequest.result;
        if (pago) {
          pago.sincronizado = true;
          const updateRequest = store.put(pago);
          updateRequest.onsuccess = () => {
            console.log('🟢 Pago marcado como sincronizado:', id);
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('🔴 Error marcando pago como sincronizado:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Pago no encontrado'));
        }
      };
      getRequest.onerror = () => {
        console.error('🔴 Error obteniendo pago para marcar como sincronizado:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Métodos para caja offline
  async guardarCajaOffline(caja: Omit<OfflineCaja, 'id' | 'sincronizado'>): Promise<string> {
    const store = await this.getStore('caja', 'readwrite');
    const id = `caja_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const cajaOffline: OfflineCaja = {
      ...caja,
      id,
      sincronizado: false
    };

    return new Promise((resolve, reject) => {
      const request = store.add(cajaOffline);
      request.onsuccess = () => {
        console.log('🟢 Caja guardada offline:', id);
        resolve(id);
      };
      request.onerror = () => {
        console.error('🔴 Error guardando caja offline:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerCajaAbierta(): Promise<OfflineCaja | null> {
    const store = await this.getStore('caja');
    const index = store.index('estado');
    
    return new Promise((resolve, reject) => {
      const request = index.get('abierta');
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => {
        console.error('🔴 Error obteniendo caja abierta:', request.error);
        reject(request.error);
      };
    });
  }

  async cerrarCajaOffline(id: string, montoFinal: number): Promise<void> {
    const store = await this.getStore('caja', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const caja = getRequest.result;
        if (caja) {
          caja.monto_final = montoFinal;
          caja.fecha_cierre = new Date().toISOString();
          caja.estado = 'cerrada';
          caja.sincronizado = false;
          
          const updateRequest = store.put(caja);
          updateRequest.onsuccess = () => {
            console.log('🟢 Caja cerrada offline:', id);
            resolve();
          };
          updateRequest.onerror = () => {
            console.error('🔴 Error cerrando caja offline:', updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          reject(new Error('Caja no encontrada'));
        }
      };
      getRequest.onerror = () => {
        console.error('🔴 Error obteniendo caja para cerrar:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // Métodos para configuración offline
  async guardarConfigOffline(key: string, value: any): Promise<void> {
    const store = await this.getStore('config', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => {
        console.log('🟢 Configuración guardada offline:', key);
        resolve();
      };
      request.onerror = () => {
        console.error('🔴 Error guardando configuración offline:', request.error);
        reject(request.error);
      };
    });
  }

  async obtenerConfigOffline(key: string): Promise<any> {
    const store = await this.getStore('config');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      request.onerror = () => {
        console.error('🔴 Error obteniendo configuración offline:', request.error);
        reject(request.error);
      };
    });
  }

  // Métodos de utilidad
  async limpiarDatosSincronizados(): Promise<void> {
    const comandas = await this.obtenerComandasOffline();
    const pagos = await this.obtenerPagosNoSincronizados();
    
    // Eliminar comandas sincronizadas
    for (const comanda of comandas) {
      if (comanda.sincronizado) {
        await this.eliminarComandaOffline(comanda.id);
      }
    }

    // Eliminar pagos sincronizados
    for (const pago of pagos) {
      if (pago.sincronizado) {
        const store = await this.getStore('pagos', 'readwrite');
        store.delete(pago.id);
      }
    }

    console.log('🟢 Datos sincronizados limpiados');
  }

  async obtenerEstadisticasOffline(): Promise<{
    comandasPendientes: number;
    pagosPendientes: number;
    cajaAbierta: boolean;
    totalOffline: number;
  }> {
    const comandas = await this.obtenerComandasOffline();
    const pagos = await this.obtenerPagosNoSincronizados();
    const caja = await this.obtenerCajaAbierta();

    const comandasPendientes = comandas.filter(c => !c.sincronizado).length;
    const pagosPendientes = pagos.filter(p => !p.sincronizado).length;
    const totalOffline = comandas
      .filter(c => !c.sincronizado)
      .reduce((sum, c) => sum + c.total, 0);

    return {
      comandasPendientes,
      pagosPendientes,
      cajaAbierta: !!caja,
      totalOffline
    };
  }
}

// Instancia singleton
export const offlineStorage = new OfflineStorage();

// Tipos exportados
export type { OfflineComanda, OfflinePago, OfflineCaja };
