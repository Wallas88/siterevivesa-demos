/*
 * indexed-db-store.ts — the DemoStore adapter that keeps a visitor's
 * content and photos in IndexedDB in their own browser, so a reload keeps
 * them and no other visitor ever sees them. Photos are stored as Blobs
 * (IndexedDB holds them far better than localStorage could). Browser
 * errors become Result codes here; nothing throws past this file. Which
 * database, and how saved data is checked, come from the demo (StoreSetup).
 */
import { CORE_ERROR_CODES } from '../result/core-errors.ts'
import type { CoreErrorCode } from '../result/core-errors.ts'
import { succeed, fail } from '../result/result.ts'
import { logIssue } from '../result/log-issue.ts'
import type { Result } from '../result/result.ts'
import type { DemoStore, StoreSetup } from './demo-store.ts'
import { toSavedEnvelope } from './saved-envelope.ts'

const DATABASE_VERSION = 1
const STATE_STORE = 'state'
const PHOTO_STORE = 'photos'
const STATE_KEY = 'demo'
const QUOTA_ERROR = 'QuotaExceededError'

// Wraps IndexedDB's callback requests; the one place a Promise is built by hand.
function settled<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>(listen)

  function listen(resolveRequest: (value: T) => void, rejectRequest: (reason: unknown) => void): void {
    request.addEventListener('success', onSuccess)
    request.addEventListener('error', onError)

    function onSuccess(): void {
      resolveRequest(request.result)
    }

    function onError(): void {
      rejectRequest(request.error)
    }
  }
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>(listen)

  function listen(resolveDone: () => void, rejectDone: (reason: unknown) => void): void {
    transaction.addEventListener('complete', onComplete)
    transaction.addEventListener('error', onFailure)
    transaction.addEventListener('abort', onFailure)

    function onComplete(): void {
      resolveDone()
    }

    function onFailure(): void {
      rejectDone(transaction.error)
    }
  }
}

// Every caught browser error goes through here: logged as a code, returned as a Result.
function failedWith<T>(code: CoreErrorCode): Result<T, CoreErrorCode> {
  logIssue(code)
  return fail(code)
}

function writeFailure<T>(error: unknown): Result<T, CoreErrorCode> {
  const full = error instanceof DOMException && error.name === QUOTA_ERROR
  return failedWith(full ? CORE_ERROR_CODES.STORAGE_FULL : CORE_ERROR_CODES.STORAGE_FAILED)
}

function createStores(database: IDBDatabase): void {
  if (!database.objectStoreNames.contains(STATE_STORE)) database.createObjectStore(STATE_STORE)
  if (!database.objectStoreNames.contains(PHOTO_STORE)) database.createObjectStore(PHOTO_STORE)
}

// Opens the database, or STORAGE_BLOCKED when the browser refuses (private windows, blocked site data).
export async function openIndexedDbStore<Data>(factory: IDBFactory, setup: StoreSetup<Data>): Promise<Result<DemoStore<Data>, CoreErrorCode>> {
  try {
    const request = factory.open(setup.databaseName, DATABASE_VERSION)
    request.addEventListener('upgradeneeded', onUpgrade)
    const database = await settled(request)
    return succeed(storeFor(database, setup))

    function onUpgrade(): void {
      createStores(request.result)
    }
  } catch {
    return failedWith(CORE_ERROR_CODES.STORAGE_BLOCKED)
  }
}

async function write(database: IDBDatabase, storeName: string, change: (store: IDBObjectStore) => void): Promise<Result<true, CoreErrorCode>> {
  try {
    const transaction = database.transaction(storeName, 'readwrite')
    change(transaction.objectStore(storeName))
    await transactionDone(transaction)
    return succeed(true)
  } catch (error) {
    return writeFailure(error)
  }
}

async function read(database: IDBDatabase, storeName: string, key: string): Promise<Result<unknown, CoreErrorCode>> {
  try {
    return succeed(await settled(database.transaction(storeName, 'readonly').objectStore(storeName).get(key)))
  } catch {
    return failedWith(CORE_ERROR_CODES.STORAGE_FAILED)
  }
}

async function loadData<Data>(database: IDBDatabase, setup: StoreSetup<Data>): Promise<Result<Data | null, CoreErrorCode>> {
  const saved = await read(database, STATE_STORE, STATE_KEY)
  if (!saved.ok || saved.value == null) return saved.ok ? succeed(null) : saved
  const data = setup.readSaved(saved.value)
  return data == null ? failedWith(CORE_ERROR_CODES.SAVED_DATA_INVALID) : succeed(data)
}

function saveData<Data>(database: IDBDatabase, setup: StoreSetup<Data>, data: Data): Promise<Result<true, CoreErrorCode>> {
  return write(database, STATE_STORE, putState)

  function putState(store: IDBObjectStore): void {
    store.put(toSavedEnvelope(setup.version, data), STATE_KEY)
  }
}

function savePhoto(database: IDBDatabase, photoId: string, photo: Blob): Promise<Result<true, CoreErrorCode>> {
  return write(database, PHOTO_STORE, putPhoto)

  function putPhoto(store: IDBObjectStore): void {
    store.put(photo, photoId)
  }
}

async function loadPhoto(database: IDBDatabase, photoId: string): Promise<Result<Blob | null, CoreErrorCode>> {
  const found = await read(database, PHOTO_STORE, photoId)
  if (!found.ok) return found
  return succeed(found.value instanceof Blob ? found.value : null)
}

function deletePhoto(database: IDBDatabase, photoId: string): Promise<Result<true, CoreErrorCode>> {
  return write(database, PHOTO_STORE, deleteOne)

  function deleteOne(store: IDBObjectStore): void {
    store.delete(photoId)
  }
}

function clearStore(store: IDBObjectStore): void {
  store.clear()
}

// Both stores in one transaction: a reset clears the content and its photos together, or neither.
async function clear(database: IDBDatabase): Promise<Result<true, CoreErrorCode>> {
  try {
    const transaction = database.transaction([STATE_STORE, PHOTO_STORE], 'readwrite')
    clearStore(transaction.objectStore(STATE_STORE))
    clearStore(transaction.objectStore(PHOTO_STORE))
    await transactionDone(transaction)
    return succeed(true)
  } catch (error) {
    return writeFailure(error)
  }
}

function storeFor<Data>(database: IDBDatabase, setup: StoreSetup<Data>): DemoStore<Data> {
  return {
    mode: 'browser',
    loadData: loadData.bind(null, database, setup) as DemoStore<Data>['loadData'],
    saveData: saveData.bind(null, database, setup) as DemoStore<Data>['saveData'],
    savePhoto: savePhoto.bind(null, database),
    loadPhoto: loadPhoto.bind(null, database),
    deletePhoto: deletePhoto.bind(null, database),
    clear: clear.bind(null, database),
  }
}
