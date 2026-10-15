export const questionBank = [
  { id: 'q1', type: 'multiple', question: 'Berapakah jumlah tulang pada rangka orang dewasa yang umumnya dijadikan acuan?', options: ['206 tulang', '150 tulang', '300 tulang', '33 tulang'], answer: '206 tulang', explanation: 'Rangka orang dewasa umumnya memiliki sekitar 206 tulang, dengan variasi anatomi individual.' },
  { id: 'q2', type: 'truefalse', question: 'Tulang rusuk dan tulang dada termasuk rangka aksial.', options: ['Benar', 'Salah'], answer: 'Benar', explanation: 'Keduanya membentuk bagian sumbu tubuh dan melindungi organ di rongga dada.' },
  { id: 'q3', type: 'multiple', question: 'Tulang yang melindungi otak adalah …', options: ['Tengkorak', 'Femur', 'Radius', 'Patela'], answer: 'Tengkorak', explanation: 'Kranium pada tengkorak membentuk pelindung bagi otak.' },
  { id: 'q4', type: 'match', question: 'Tulang apakah yang terletak di paha?', options: ['Femur', 'Humerus', 'Ulna', 'Klavikula'], answer: 'Femur', explanation: 'Femur adalah tulang paha dan merupakan tulang terpanjang pada tubuh.' },
  { id: 'q5', type: 'truefalse', question: 'Rangka apendikular mencakup gelang bahu dan anggota gerak.', options: ['Benar', 'Salah'], answer: 'Benar', explanation: 'Rangka apendikular terdiri atas gelang bahu, anggota gerak atas, gelang panggul, dan anggota gerak bawah.' },
  { id: 'q6', type: 'multiple', question: 'Tulang yang menghubungkan bahu dengan siku adalah …', options: ['Humerus', 'Tibia', 'Sternum', 'Mandibula'], answer: 'Humerus', explanation: 'Humerus merupakan tulang lengan atas.' },
  { id: 'q7', type: 'match', question: 'Pasangkan fungsi melindungi jantung dan paru-paru dengan bagian rangka …', options: ['Tulang rusuk', 'Tulang jari', 'Patela', 'Koksigis'], answer: 'Tulang rusuk', explanation: 'Tulang rusuk bersama sternum membentuk rongga dada yang melindungi jantung dan paru-paru.' },
  { id: 'q8', type: 'multiple', question: 'Sendi peluru dapat ditemukan pada …', options: ['Bahu', 'Sutura tengkorak', 'Antarruas sakrum', 'Gigi'], answer: 'Bahu', explanation: 'Sendi bahu memungkinkan gerakan luas ke berbagai arah.' },
  { id: 'q9', type: 'truefalse', question: 'Radius berada di sisi ibu jari pada posisi anatomi.', options: ['Benar', 'Salah'], answer: 'Benar', explanation: 'Radius terletak di sisi lateral lengan bawah, yaitu sisi ibu jari pada posisi anatomi.' },
  { id: 'q10', type: 'multiple', question: 'Sumsum tulang merah berperan dalam …', options: ['Pembentukan sel darah', 'Pencernaan protein', 'Pertukaran gas', 'Penglihatan'], answer: 'Pembentukan sel darah', explanation: 'Hematopoiesis atau pembentukan sel darah berlangsung di sumsum tulang merah.' },
  { id: 'q11', type: 'multiple', question: 'Apa fungsi utama tulang belakang selain menopang tubuh?', options: ['Melindungi sumsum tulang belakang', 'Menyaring darah', 'Menghasilkan empedu', 'Menggerakkan rahang'], answer: 'Melindungi sumsum tulang belakang', explanation: 'Lubang pada ruas-ruas tulang belakang membentuk saluran yang melindungi sumsum tulang belakang.' },
  { id: 'q12', type: 'match', question: 'Tibia dan fibula berada di bagian …', options: ['Tungkai bawah', 'Lengan atas', 'Dada', 'Tengkorak'], answer: 'Tungkai bawah', explanation: 'Tibia dan fibula adalah tulang pada tungkai bawah.' },
  { id: 'q13', type: 'image', image: 'femur', question: 'Perhatikan ilustrasi tulang panjang berikut. Tulang apakah yang ditunjukkan?', options: ['Femur', 'Mandibula', 'Sternum', 'Patela'], answer: 'Femur', explanation: 'Femur adalah tulang panjang pada paha, di antara gelang panggul dan lutut.' }
]

export function selectQuizQuestions(count = 10, random = Math.random) {
  const pool = [...questionBank]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]]
  }
  return pool.slice(0, Math.min(count, pool.length)).map((question) => {
    const options = [...question.options]
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1))
      ;[options[index], options[swapIndex]] = [options[swapIndex], options[index]]
    }
    return { ...question, options }
  })
}
