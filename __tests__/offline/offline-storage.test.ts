import { offlineStorage } from '../../lib/offline-storage';
describe('OfflineStorage', () => {
  it('should have required methods', () => {
    expect(typeof offlineStorage.hasOfflineData).toBe('function');
    expect(typeof offlineStorage.syncWithServer).toBe('function');
  });
});
