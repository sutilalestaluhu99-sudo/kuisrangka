export const puzzlePieces = [
  { id: 'skull', name: 'Tengkorak', group: 'Kepala', location: 'Kepala', function: 'Melindungi otak dan membentuk wajah.', clue: 'Cari target di bagian paling atas tubuh.', target: 'Kepala', difficulty: ['mudah', 'sedang', 'sulit'] },
  { id: 'spine', name: 'Tulang belakang', group: 'Badan', location: 'Garis tengah punggung', function: 'Menopang tubuh dan melindungi sumsum tulang belakang.', clue: 'Susun pada sumbu tengah bagian belakang badan.', target: 'Punggung', difficulty: ['mudah', 'sedang', 'sulit'] },
  { id: 'ribs', name: 'Tulang rusuk', group: 'Badan', location: 'Rongga dada', function: 'Melindungi jantung dan paru-paru.', clue: 'Tempatkan mengelilingi rongga dada.', target: 'Dada', difficulty: ['mudah', 'sedang', 'sulit'] },
  { id: 'pelvis', name: 'Gelang panggul', group: 'Panggul', location: 'Pangkal tungkai', function: 'Menghubungkan tungkai dengan rangka aksial dan menopang organ panggul.', clue: 'Cari bagian penghubung badan dan kedua tungkai.', target: 'Panggul', difficulty: ['mudah', 'sedang', 'sulit'] },
  { id: 'humerus', name: 'Humerus', group: 'Lengan', location: 'Lengan atas', function: 'Membentuk lengan atas dan menghubungkan bahu dengan siku.', clue: 'Tempatkan pada bagian lengan antara bahu dan siku.', target: 'Lengan atas', difficulty: ['sedang', 'sulit'] },
  { id: 'radius-ulna', name: 'Radius dan ulna', group: 'Lengan', location: 'Lengan bawah', function: 'Membentuk lengan bawah dan membantu gerak pergelangan.', clue: 'Cari bagian di antara siku dan pergelangan tangan.', target: 'Lengan bawah', difficulty: ['sedang', 'sulit'] },
  { id: 'femur', name: 'Femur', group: 'Tungkai', location: 'Paha', function: 'Menopang beban dan menjadi tulang panjang utama pada paha.', clue: 'Tempatkan pada bagian atas tungkai, dari panggul ke lutut.', target: 'Paha', difficulty: ['sedang', 'sulit'] },
  { id: 'tibia-fibula', name: 'Tibia dan fibula', group: 'Tungkai', location: 'Tungkai bawah', function: 'Tibia menanggung sebagian besar beban; fibula membantu stabilitas.', clue: 'Cari bagian antara lutut dan pergelangan kaki.', target: 'Tungkai bawah', difficulty: ['sedang', 'sulit'] }
]

export const difficultySettings = {
  mudah: { label: 'Mudah', hintPenalty: 15, targetCount: 4, description: '4 kelompok besar, petunjuk lokasi dan fungsi.' },
  sedang: { label: 'Sedang', hintPenalty: 20, targetCount: 8, description: '8 bagian rangka dengan petunjuk.' },
  sulit: { label: 'Sulit', hintPenalty: 30, targetCount: 8, description: '8 bagian rangka tanpa petunjuk fungsi.' }
}

export const targets = [
  { id: 'Kepala', icon: '◉' }, { id: 'Punggung', icon: '╎' }, { id: 'Dada', icon: '▤' },
  { id: 'Panggul', icon: '⌑' }, { id: 'Lengan atas', icon: '╱' }, { id: 'Lengan bawah', icon: '╲' },
  { id: 'Paha', icon: '╱' }, { id: 'Tungkai bawah', icon: '╲' }
]

export function piecesForDifficulty(difficulty) {
  return puzzlePieces.filter((piece) => piece.difficulty.includes(difficulty))
    .slice(0, difficultySettings[difficulty].targetCount)
}

export function calculatePuzzleScore({ placements, hintsUsed, difficulty, mistakes }) {
  const base = placements * 100
  const penalty = hintsUsed * (difficultySettings[difficulty]?.hintPenalty ?? 15)
  const perfectBonus = placements === difficultySettings[difficulty]?.targetCount && mistakes === 0 && hintsUsed === 0 ? 50 : 0
  return Math.max(0, base - penalty + perfectBonus)
}
