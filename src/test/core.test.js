import { beforeEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { db, initializeDatabase } from '../db/database.js'
import { calculatePuzzleScore, difficultySettings, piecesForDifficulty } from '../data/puzzleData.js'
import { questionBank, selectQuizQuestions } from '../data/questionBank.js'
import {
  achievementRepository, exportData, importData, materialRepository, puzzleRepository, quizRepository
} from '../db/repositories.js'

beforeEach(async () => {
  await db.delete()
  await initializeDatabase()
})

describe('database dan repositori lokal', () => {
  it('menginisialisasi IndexedDB dan menambahkan materi awal', async () => {
    expect((await db.materials.count())).toBeGreaterThanOrEqual(10)
    expect((await db.students.toCollection().first()).displayName).toBe('Siswa')
  })

  it('menyimpan dan membaca progres materi tanpa duplikasi', async () => {
    await materialRepository.complete('tengkorak')
    await materialRepository.open('tengkorak')
    expect(await db.materialProgress.count()).toBe(1)
    expect((await materialRepository.getProgress())[0].isCompleted).toBe(true)
  })

  it('mempertahankan data setelah koneksi database dibuka ulang', async () => {
    await materialRepository.complete('sendi')
    await db.close()
    await db.open()
    expect((await materialRepository.getProgress())[0].materialId).toBe('sendi')
  })

  it('menyimpan hasil puzzle lengkap sekali dan skor dihitung tepat', async () => {
    const difficulty = 'mudah'
    const pieces = piecesForDifficulty(difficulty)
    const placedPieces = Object.fromEntries(pieces.map((piece) => [piece.id, piece.target]))
    const score = await puzzleRepository.complete({ difficulty, placedPieces, mistakes: 0, hintsUsed: 0, elapsedSeconds: 42 })
    await puzzleRepository.complete({ difficulty, placedPieces, mistakes: 0, hintsUsed: 0, elapsedSeconds: 42 })
    expect(score).toBe(450)
    expect(await db.puzzleResults.count()).toBe(1)
    expect((await db.puzzleProgress.where('puzzleId').equals('current').first()).status).toBe('completed')
  })

  it('menolak puzzle yang targetnya belum benar dan penalti petunjuk berlaku', async () => {
    const piece = piecesForDifficulty('mudah')[0]
    await expect(puzzleRepository.complete({
      difficulty: 'mudah', placedPieces: { [piece.id]: 'Dada' }, mistakes: 1, hintsUsed: 0, elapsedSeconds: 1
    })).rejects.toThrow('Puzzle belum lengkap')
    expect(calculatePuzzleScore({ placements: 1, hintsUsed: 1, difficulty: 'mudah', mistakes: 1 }))
      .toBe(100 - difficultySettings.mudah.hintPenalty)
    expect(calculatePuzzleScore({ placements: 1, hintsUsed: 0, difficulty: 'mudah', mistakes: 0 })).toBe(100)
  })

  it('menghitung hasil kuis dan menyimpan jejak sesi', async () => {
    const result = await quizRepository.save({
      answers: [{ questionId: 'q1', correct: true }, { questionId: 'q2', correct: false }],
      durationSeconds: 30
    })
    expect(result.accuracy).toBe(50)
    expect(result.score).toBe(10)
    expect(await db.sessions.count()).toBe(1)
  })

  it('membuka badge hanya satu kali', async () => {
    await achievementRepository.unlock('first-puzzle')
    await achievementRepository.unlock('first-puzzle')
    expect(await db.achievements.count()).toBe(1)
  })

  it('mengekspor dan mengimpor data dengan validasi struktur', async () => {
    await materialRepository.complete('sendi')
    const backup = await exportData()
    await db.materialProgress.clear()
    await importData(backup)
    expect((await materialRepository.getProgress())[0].materialId).toBe('sendi')
    await expect(importData({ format: 'not-a-backup', version: 1, data: {} })).rejects.toThrow('Berkas tidak valid')
  })

  it('memigrasikan progres puzzle versi lama tanpa kehilangan data', async () => {
    await db.delete()
    const legacy = new Dexie('SkeletalQuestDB')
    legacy.version(1).stores({
      students: '++id, displayName, updatedAt',
      materials: 'id, category, order, updatedAt',
      materialProgress: '++id, &materialId, isCompleted, completedAt, lastOpenedAt',
      puzzleProgress: '++id, &puzzleId, difficulty, status, updatedAt',
      puzzleResults: '++id, puzzleId, difficulty, completedAt',
      quizResults: '++id, quizId, accuracy, completedAt',
      achievements: '++id, &achievementCode, unlockedAt',
      settings: '&key, updatedAt'
    })
    await legacy.open()
    await legacy.puzzleProgress.add({ puzzleId: 'current', difficulty: 'mudah', placedPieces: { skull: 'Kepala' } })
    legacy.close()
    await db.open()
    const migrated = await db.puzzleProgress.where('puzzleId').equals('current').first()
    expect(migrated.placedPieces).toEqual({ skull: 'Kepala' })
    expect(migrated.status).toBe('in-progress')
  })
})

describe('logika permainan', () => {
  it('memilih soal tanpa pengulangan dalam satu kuis', () => {
    const questions = selectQuizQuestions(10, () => 0.5)
    expect(questions).toHaveLength(10)
    expect(new Set(questions.map((question) => question.id)).size).toBe(10)
    expect(questions.every((question) => question.options.includes(question.answer))).toBe(true)
    expect(questionBank.some((question) => question.type === 'image')).toBe(true)
  })
})
