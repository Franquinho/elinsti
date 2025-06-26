import { offlineStorage, type OfflineComanda, type OfflinePago, type OfflineCaja } from '../../lib/offline-storage';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

const mockIDBObjectStore = {
  add: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  index: jest.fn(),
  createIndex: jest.fn()
};

const mockIDBIndex = {
  getAll: jest.fn(),
  get: jest.fn()
};

const mockIDBTransaction = {
  objectStore: jest.fn()
};

const mockIDBDatabase = {
  transaction: jest.fn(),
  objectStoreNames: {
    contains: jest.fn()
  },
  createObjectStore: jest.fn()
};

describe('OfflineStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock global indexedDB
    global.indexedDB = mockIndexedDB as any;
    
    // Reset singleton instance
    (offlineStorage as any).db = null;
  });

  describe('init', () => {
    it('should initialize IndexedDB successfully', async () => {
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      
      // Simulate successful initialization
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      await initPromise;

      expect(mockIndexedDB.open).toHaveBeenCalledWith('INSTI_OfflineDB', 1);
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('comandas', { keyPath: 'id' });
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('pagos', { keyPath: 'id' });
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('caja', { keyPath: 'id' });
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('config', { keyPath: 'key' });
    });

    it('should handle IndexedDB initialization error', async () => {
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        error: new Error('IndexedDB error')
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);

      const initPromise = offlineStorage.init();
      
      // Simulate error
      setTimeout(() => {
        mockRequest.onerror?.();
      }, 0);

      await expect(initPromise).rejects.toThrow('IndexedDB error');
    });
  });

  describe('comandas offline', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      setTimeout(() => mockRequest.onsuccess?.(), 0);
      await initPromise;
    });

    it('should save comanda offline', async () => {
      const comandaData = {
        usuario_id: 1,
        evento_id: 1,
        total: 25.50,
        nombre_cliente: 'Juan Pérez',
        productos: [{ id: 1, cantidad: 2, precio: 12.75 }],
        estado: 'pendiente' as const,
        fecha_creacion: '2024-01-01T10:00:00Z'
      };

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: 'offline_123'
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.add.mockReturnValue(mockRequest);

      const savePromise = offlineStorage.guardarComandaOffline(comandaData);
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await savePromise;
      expect(result).toMatch(/^offline_\d+_[a-z0-9]+$/);
      expect(mockIDBObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...comandaData,
          id: expect.any(String),
          sincronizado: false
        })
      );
    });

    it('should get offline comandas', async () => {
      const mockComandas = [
        { id: '1', nombre_cliente: 'Juan', sincronizado: false },
        { id: '2', nombre_cliente: 'María', sincronizado: true }
      ];

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: mockComandas
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.getAll.mockReturnValue(mockRequest);

      const getPromise = offlineStorage.obtenerComandasOffline();
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await getPromise;
      expect(result).toEqual(mockComandas);
    });

    it('should get unsynchronized comandas', async () => {
      const mockComandas = [
        { id: '1', nombre_cliente: 'Juan', sincronizado: false },
        { id: '2', nombre_cliente: 'María', sincronizado: false }
      ];

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: mockComandas
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);
      mockIDBIndex.getAll.mockReturnValue(mockRequest);

      const getPromise = offlineStorage.obtenerComandasNoSincronizadas();
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await getPromise;
      expect(result).toEqual(mockComandas);
      expect(mockIDBIndex.getAll).toHaveBeenCalledWith(false);
    });

    it('should mark comanda as synchronized', async () => {
      const comandaId = 'test-id';
      const mockComanda = { id: comandaId, sincronizado: false };

      const mockGetRequest = {
        onsuccess: null,
        onerror: null,
        result: mockComanda
      };

      const mockPutRequest = {
        onsuccess: null,
        onerror: null
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.get.mockReturnValue(mockGetRequest);
      mockIDBObjectStore.put.mockReturnValue(mockPutRequest);

      const markPromise = offlineStorage.marcarComandaSincronizada(comandaId);
      
      setTimeout(() => {
        mockGetRequest.onsuccess?.();
        setTimeout(() => {
          mockPutRequest.onsuccess?.();
        }, 0);
      }, 0);

      await markPromise;
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: comandaId,
          sincronizado: true
        })
      );
    });
  });

  describe('pagos offline', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      setTimeout(() => mockRequest.onsuccess?.(), 0);
      await initPromise;
    });

    it('should save payment offline', async () => {
      const pagoData = {
        comanda_id: 'comanda-123',
        estado: 'pagado' as const,
        metodo_pago: 'efectivo' as const,
        monto: 25.50,
        fecha_creacion: '2024-01-01T10:00:00Z'
      };

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: 'pago_123'
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.add.mockReturnValue(mockRequest);

      const savePromise = offlineStorage.guardarPagoOffline(pagoData);
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await savePromise;
      expect(result).toMatch(/^pago_\d+_[a-z0-9]+$/);
      expect(mockIDBObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...pagoData,
          id: expect.any(String),
          sincronizado: false
        })
      );
    });
  });

  describe('caja offline', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      setTimeout(() => mockRequest.onsuccess?.(), 0);
      await initPromise;
    });

    it('should save caja offline', async () => {
      const cajaData = {
        monto_inicial: 100,
        fecha_apertura: '2024-01-01T10:00:00Z',
        estado: 'abierta' as const
      };

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: 'caja_123'
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.add.mockReturnValue(mockRequest);

      const savePromise = offlineStorage.guardarCajaOffline(cajaData);
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await savePromise;
      expect(result).toMatch(/^caja_\d+_[a-z0-9]+$/);
      expect(mockIDBObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...cajaData,
          id: expect.any(String),
          sincronizado: false
        })
      );
    });

    it('should get open caja', async () => {
      const mockCaja = { id: 'caja-123', estado: 'abierta' };

      const mockRequest = {
        onsuccess: null,
        onerror: null,
        result: mockCaja
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);
      mockIDBIndex.get.mockReturnValue(mockRequest);

      const getPromise = offlineStorage.obtenerCajaAbierta();
      
      setTimeout(() => {
        mockRequest.onsuccess?.();
      }, 0);

      const result = await getPromise;
      expect(result).toEqual(mockCaja);
      expect(mockIDBIndex.get).toHaveBeenCalledWith('abierta');
    });
  });

  describe('configuración offline', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      setTimeout(() => mockRequest.onsuccess?.(), 0);
      await initPromise;
    });

    it('should save and get config', async () => {
      const configKey = 'test-key';
      const configValue = { test: 'value' };

      const mockPutRequest = {
        onsuccess: null,
        onerror: null
      };

      const mockGetRequest = {
        onsuccess: null,
        onerror: null,
        result: { key: configKey, value: configValue }
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.put.mockReturnValue(mockPutRequest);
      mockIDBObjectStore.get.mockReturnValue(mockGetRequest);

      // Save config
      const savePromise = offlineStorage.guardarConfigOffline(configKey, configValue);
      setTimeout(() => mockPutRequest.onsuccess?.(), 0);
      await savePromise;

      // Get config
      const getPromise = offlineStorage.obtenerConfigOffline(configKey);
      setTimeout(() => mockGetRequest.onsuccess?.(), 0);
      const result = await getPromise;

      expect(result).toEqual(configValue);
      expect(mockIDBObjectStore.put).toHaveBeenCalledWith({ key: configKey, value: configValue });
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith(configKey);
    });
  });

  describe('utilidades', () => {
    beforeEach(async () => {
      // Mock successful initialization
      const mockRequest = {
        onerror: null,
        onsuccess: null,
        onupgradeneeded: null,
        result: mockIDBDatabase
      };

      mockIndexedDB.open.mockReturnValue(mockRequest);
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
      mockIDBDatabase.createObjectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.createIndex.mockReturnValue(undefined);

      const initPromise = offlineStorage.init();
      setTimeout(() => mockRequest.onsuccess?.(), 0);
      await initPromise;
    });

    it('should get offline statistics', async () => {
      const mockComandas = [
        { id: '1', sincronizado: false, total: 25.50 },
        { id: '2', sincronizado: true, total: 15.00 },
        { id: '3', sincronizado: false, total: 30.00 }
      ];

      const mockPagos = [
        { id: 'p1', sincronizado: false },
        { id: 'p2', sincronizado: false }
      ];

      const mockCaja = { id: 'caja-1', estado: 'abierta' };

      // Mock comandas request
      const mockComandasRequest = {
        onsuccess: null,
        onerror: null,
        result: mockComandas
      };

      // Mock pagos request
      const mockPagosRequest = {
        onsuccess: null,
        onerror: null,
        result: mockPagos
      };

      // Mock caja request
      const mockCajaRequest = {
        onsuccess: null,
        onerror: null,
        result: mockCaja
      };

      mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
      mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
      mockIDBObjectStore.getAll.mockReturnValue(mockComandasRequest);
      mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);
      mockIDBIndex.getAll.mockReturnValue(mockPagosRequest);
      mockIDBIndex.get.mockReturnValue(mockCajaRequest);

      const statsPromise = offlineStorage.obtenerEstadisticasOffline();
      
      setTimeout(() => {
        mockComandasRequest.onsuccess?.();
        setTimeout(() => {
          mockPagosRequest.onsuccess?.();
          setTimeout(() => {
            mockCajaRequest.onsuccess?.();
          }, 0);
        }, 0);
      }, 0);

      const result = await statsPromise;
      expect(result).toEqual({
        comandasPendientes: 2,
        pagosPendientes: 2,
        cajaAbierta: true,
        totalOffline: 55.50
      });
    });
  });
}); 