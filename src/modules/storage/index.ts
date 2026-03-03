// src/modules/storage/index.ts
// Public API for storage module

export type { StoragePort, StoredProject, StoredDuctItem } from './storage-interface'
export { IDBStorageAdapter, storage } from './idb-adapter'
