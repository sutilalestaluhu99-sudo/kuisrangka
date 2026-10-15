import Dexie from 'dexie'
import { materials } from '../data/materials.js'

export class SkeletalQuestDB extends Dexie {
  constructor() {
    super('SkeletalQuestDB')
    this.version(1).stores({
      students: '++id, displayName, updatedAt',
      materials: 'id, category, order, updatedAt',
      materialProgress: '++id, &materialId, isCompleted, completedAt, lastOpenedAt',
      puzzleProgress: '++id, &puzzleId, difficulty, status, updatedAt',
      puzzleResults: '++id, puzzleId, difficulty, completedAt',
      quizResults: '++id, quizId, accuracy, completedAt',
      achievements: '++id, &achievementCode, unlockedAt',
      settings: '&key, updatedAt'
    })
    this.version(2).stores({
      students: '++id, displayName, updatedAt',
      materials: 'id, category, order, updatedAt',
      materialProgress: '++id, &materialId, isCompleted, completedAt, lastOpenedAt',
      puzzleProgress: '++id, &puzzleId, difficulty, status, updatedAt',
      puzzleResults: '++id, puzzleId, difficulty, completedAt',
      quizResults: '++id, quizId, accuracy, completedAt',
      achievements: '++id, &achievementCode, unlockedAt',
      settings: '&key, updatedAt',
      sessions: '++id, type, startedAt, completedAt'
    }).upgrade(async (transaction) => {
      await transaction.table('puzzleProgress').toCollection().modify((row) => {
        row.status ??= 'in-progress'
      })
    })
  }
}

export const db = new SkeletalQuestDB()

export async function initializeDatabase() {
  try {
    await db.open()
    await db.transaction('rw', db.materials, db.students, db.settings, async () => {
      const materialRows = (await db.materials.toArray())
      if (materialRows.length === 0) {
        await db.materials.bulkPut(materials.map((item) => ({ ...item, updatedAt: new Date().toISOString() })))
      }
      if (!(await db.students.count())) {
        await db.students.add({ displayName: 'Siswa', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      }
      await db.settings.put({ key: 'soundEnabled', value: true, updatedAt: new Date().toISOString() })
      await db.settings.put({ key: 'theme', value: 'light', updatedAt: new Date().toISOString() })
    })
    return db
  } catch (error) {
    console.error('Gagal menginisialisasi database lokal.', error)
    throw new Error('Database lokal tidak dapat dibuka. Periksa ruang penyimpanan browser dan izin situs.', { cause: error })
  }
}
