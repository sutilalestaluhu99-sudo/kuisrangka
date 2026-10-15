import { db } from './database.js'
import { calculatePuzzleScore, piecesForDifficulty } from '../data/puzzleData.js'

const now = () => new Date().toISOString()

export const studentRepository = {
  async get() { return (await db.students.toCollection().first()) ?? null },
  async updateName(displayName) {
    const name = displayName.trim()
    if (!name || name.length > 40) throw new Error('Nama harus berisi 1–40 karakter.')
    const student = await this.get()
    if (!student) throw new Error('Profil siswa belum tersedia.')
    await db.students.update(student.id, { displayName: name, updatedAt: now() })
    return { ...student, displayName: name }
  }
}

export const materialRepository = {
  async list() { return db.materials.orderBy('order').toArray() },
  async getProgress() { return db.materialProgress.toArray() },
  async open(materialId) {
    const item = await db.materials.get(materialId)
    if (!item) throw new Error('Materi tidak ditemukan.')
    const progress = await db.materialProgress.where('materialId').equals(materialId).first()
    if (progress) await db.materialProgress.update(progress.id, { lastOpenedAt: now() })
    else await db.materialProgress.add({ materialId, isCompleted: false, lastOpenedAt: now() })
    return item
  },
  async complete(materialId) {
    if (!(await db.materials.get(materialId))) throw new Error('Materi tidak ditemukan.')
    const timestamp = now()
    const progress = await db.materialProgress.where('materialId').equals(materialId).first()
    if (progress) await db.materialProgress.update(progress.id, { isCompleted: true, completedAt: timestamp, lastOpenedAt: timestamp })
    else await db.materialProgress.add({ materialId, isCompleted: true, completedAt: timestamp, lastOpenedAt: timestamp })
    return db.materialProgress.where('materialId').equals(materialId).first()
  }
}

export const puzzleRepository = {
  async getProgress() { return db.puzzleProgress.toArray() },
  async saveProgress({ difficulty, placedPieces, score, mistakes, hintsUsed, elapsedSeconds }) {
    const validIds = new Set(piecesForDifficulty(difficulty).map((piece) => piece.id))
    const placements = Object.fromEntries(Object.entries(placedPieces).filter(([id, target]) => validIds.has(id) && typeof target === 'string'))
    const progress = await db.puzzleProgress.where('puzzleId').equals('current').first()
    const row = {
      puzzleId: 'current', difficulty, placedPieces: placements, score, mistakes, hintsUsed,
      elapsedSeconds, status: 'in-progress', startedAt: progress?.startedAt ?? now(), updatedAt: now()
    }
    if (progress) await db.puzzleProgress.update(progress.id, row)
    else await db.puzzleProgress.add(row)
    return row
  },
  async complete({ difficulty, placedPieces, mistakes, hintsUsed, elapsedSeconds }) {
    const pieces = piecesForDifficulty(difficulty)
    if (pieces.some((piece) => placedPieces[piece.id] !== piece.target)) throw new Error('Puzzle belum lengkap.')
    const score = calculatePuzzleScore({ placements: pieces.length, hintsUsed, difficulty, mistakes })
    await db.transaction('rw', db.puzzleProgress, db.puzzleResults, db.sessions, async () => {
      const progress = await db.puzzleProgress.where('puzzleId').equals('current').first()
      if (progress?.status === 'completed') return
      const completedAt = now()
      await db.puzzleResults.add({ puzzleId: 'current', difficulty, score, mistakes, hintsUsed, elapsedSeconds, completedAt })
      const completedProgress = {
        puzzleId: 'current', difficulty, placedPieces, score, mistakes, hintsUsed, elapsedSeconds,
        status: 'completed', startedAt: progress?.startedAt ?? completedAt, updatedAt: completedAt, completedAt
      }
      if (progress) await db.puzzleProgress.update(progress.id, completedProgress)
      else await db.puzzleProgress.add(completedProgress)
      await db.sessions.add({ type: 'puzzle', score, startedAt: completedAt, completedAt, durationSeconds: elapsedSeconds })
    })
    return score
  }
}

export const quizRepository = {
  async list() { return db.quizResults.orderBy('completedAt').reverse().toArray() },
  async save({ answers, durationSeconds, quizId = `quiz-${Date.now()}` }) {
    if (!Array.isArray(answers) || !answers.length) throw new Error('Jawaban kuis tidak valid.')
    const correctAnswers = answers.filter((answer) => answer.correct).length
    const totalQuestions = answers.length
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    const row = { quizId, score: correctAnswers * 10, totalQuestions, correctAnswers, accuracy, answers, durationSeconds, completedAt: now() }
    await db.transaction('rw', db.quizResults, db.sessions, async () => {
      await db.quizResults.add(row)
      await db.sessions.add({ type: 'quiz', score: row.score, startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(), completedAt: row.completedAt, durationSeconds })
    })
    return row
  }
}

export const achievementRepository = {
  async list() { return db.achievements.toArray() },
  async unlock(code) {
    const existing = await db.achievements.where('achievementCode').equals(code).first()
    if (existing) return existing
    const id = await db.achievements.add({ achievementCode: code, unlockedAt: now() })
    return db.achievements.get(id)
  }
}

export const settingsRepository = {
  async list() { return db.settings.toArray() },
  async get(key) { return (await db.settings.get(key))?.value },
  async set(key, value) {
    await db.settings.put({ key, value, updatedAt: now() })
  }
}

export const dashboardRepository = {
  async getSummary() {
    const [student, materialRows, materialProgress, puzzleResults, quizResults, achievements, sessions, currentPuzzle] = await Promise.all([
      studentRepository.get(), materialRepository.list(), materialRepository.getProgress(),
      db.puzzleResults.toArray(), quizRepository.list(), achievementRepository.list(), db.sessions.toArray(),
      db.puzzleProgress.where('puzzleId').equals('current').first()
    ])
    const quizzesCount = quizResults.reduce((sum, result) => sum + result.totalQuestions, 0)
    const correctCount = quizResults.reduce((sum, result) => sum + result.correctAnswers, 0)
    const totalSeconds = sessions.reduce((sum, session) => sum + (session.durationSeconds ?? 0), 0)
    const uniqueDays = [...new Set(sessions.map((session) => session.completedAt?.slice(0, 10)).filter(Boolean))].sort()
    const streak = uniqueDays.length ? uniqueDays.reduce((count, day, index) => {
      if (!index) return 1
      return (new Date(day) - new Date(uniqueDays[index - 1])) / 86400000 === 1 ? count + 1 : 1
    }, 0) : 0
    const completedMaterialIds = new Set(materialProgress.filter((item) => item.isCompleted).map((item) => item.materialId))
    return {
      student, materialCount: materialRows.length,
      completedMaterials: materialProgress.filter((item) => item.isCompleted).length,
      nextMaterial: materialRows.find((item) => !completedMaterialIds.has(item.id)) ?? null,
      puzzleInProgress: currentPuzzle?.status === 'in-progress' ? currentPuzzle : null,
      puzzleCount: puzzleResults.length,
      totalScore: puzzleResults.reduce((sum, result) => sum + result.score, 0) + quizResults.reduce((sum, result) => sum + result.score, 0),
      accuracy: quizzesCount ? Math.round(correctCount / quizzesCount * 100) : 0,
      streak, achievements, puzzleResults, quizResults, sessions, totalSeconds
    }
  }
}

export const puzzleProgressRepository = {
  async getCurrent() { return db.puzzleProgress.where('puzzleId').equals('current').first() }
}

export async function exportData() {
  const tables = ['students', 'materials', 'materialProgress', 'puzzleProgress', 'puzzleResults', 'quizResults', 'achievements', 'settings', 'sessions']
  const data = Object.fromEntries(await Promise.all(tables.map(async (table) => [table, await db.table(table).toArray()])))
  return { format: 'SkeletalQuest', version: 1, exportedAt: now(), data }
}

export async function importData(payload) {
  const tableNames = ['students', 'materials', 'materialProgress', 'puzzleProgress', 'puzzleResults', 'quizResults', 'achievements', 'settings', 'sessions']
  if (!payload || payload.format !== 'SkeletalQuest' || payload.version !== 1 || !payload.data || tableNames.some((name) => !Array.isArray(payload.data[name]))) {
    throw new Error('Berkas tidak valid atau versinya tidak didukung.')
  }
  if (payload.data.students.some((student) => typeof student.displayName !== 'string') ||
      payload.data.settings.some((setting) => typeof setting.key !== 'string')) throw new Error('Berkas berisi data yang tidak valid.')
  await db.transaction('rw', ...tableNames.map((name) => db.table(name)), async () => {
    for (const name of tableNames) await db.table(name).bulkPut(payload.data[name])
  })
}
