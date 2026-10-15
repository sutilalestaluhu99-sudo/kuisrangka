import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { selectQuizQuestions } from '../data/questionBank.js'
import { achievementRepository, settingsRepository } from '../db/repositories.js'
import { playFeedbackSound } from '../utils/sound.js'
import { quizRepository } from '../db/repositories.js'

export function QuizPage() {
  const history = useLiveQuery(() => quizRepository.list(), [], [])
  const soundEnabled = useLiveQuery(() => settingsRepository.get('soundEnabled'), [], true)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [choice, setChoice] = useState(null)
  const [startedAt, setStartedAt] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const savedRef = useRef(false)
  const current = questions[answers.length]
  const result = answers.length ? Math.round(answers.filter((answer) => answer.correct).length / answers.length * 100) : 0

  function start() {
    setQuestions(selectQuizQuestions(10))
    setAnswers([]); setChoice(null); setStartedAt(Date.now()); setFinished(false); setError(''); savedRef.current = false
  }

  async function saveResult(finalAnswers) {
    if (savedRef.current || finalAnswers.length !== questions.length) return
    savedRef.current = true
    setSaving(true)
    try {
      const savedResult = await quizRepository.save({ answers: finalAnswers, durationSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)) })
      if (savedResult.accuracy >= 90) await achievementRepository.unlock('quiz-expert')
      setFinished(true)
    } catch (issue) {
      savedRef.current = false
      setError(`Hasil kuis tidak dapat disimpan: ${issue.message}`)
    } finally { setSaving(false) }
  }

  async function submitAnswer() {
    if (!current || choice === null) return
    const selected = current.options[choice]
    playFeedbackSound(selected === current.answer, soundEnabled)
    const nextAnswers = [...answers, { questionId: current.id, question: current.question, selected, correct: selected === current.answer, explanation: current.explanation }]
    setAnswers(nextAnswers); setChoice(null)
    if (nextAnswers.length === questions.length) await saveResult(nextAnswers)
  }

  return <div className="content-wrap">
    <PageHeader eyebrow="UJI PEMAHAMANMU" title="Kuis biologi" description="Sepuluh soal acak, umpan balik langsung, dan pembahasan di setiap jawaban." />
    {!questions.length && <section className="panel quiz-start"><span className="quiz-start-icon"><Icon name="Brain" size={27} /></span><p className="eyebrow">TANTANGAN 10 SOAL</p><h2>Seberapa kenal kamu dengan rangka?</h2><p>Pilihan ganda, benar atau salah, dan mencocokkan tulang dengan lokasinya. Jawabanmu tersimpan lokal di perangkat ini.</p><div className="quiz-start-facts"><span><Icon name="ListChecks" /> 10 soal acak</span><span><Icon name="Timer" /> Tanpa batas waktu</span><span><Icon name="MessageCircle" /> Pembahasan langsung</span></div><button className="button button-primary" onClick={start}><Icon name="Play" size={17} /> Mulai kuis</button></section>}
    {current && <section className="panel quiz-panel"><div className="quiz-topline"><span>SOAL {answers.length + 1} <i>/ {questions.length}</i></span><span className="quiz-kind">{current.type === 'match' ? 'COCOKKAN LOKASI' : current.type === 'truefalse' ? 'BENAR ATAU SALAH' : current.type === 'image' ? 'IDENTIFIKASI ILUSTRASI' : 'PILIHAN GANDA'}</span></div><div className="progress-track"><span style={{ width: `${answers.length / questions.length * 100}%` }} /></div>{current.type === 'image' && <div className="quiz-question-illustration" role="img" aria-label="Ilustrasi konseptual tulang panjang"><svg viewBox="0 0 240 88" aria-hidden="true"><path d="M72 19c-13-12-30 2-20 14l37 34c-4 14 13 21 22 9 5-7 4-14-2-20L81 25c1-3-2-5-9-6zm96 50c13 12 30-2 20-14l-37-34c4-14-13-21-22-9-5 7-4 14 2 20l28 31c-1 3 2 5 9 6z" fill="#83b9aa"/><path d="m78 25 83 45" stroke="#4d8c7d" strokeWidth="8" strokeLinecap="round"/></svg><span>ILUSTRASI KONSEPTUAL · TULANG PANJANG</span></div>}<h2>{current.question}</h2><div className="quiz-options">{current.options.map((option, index) => <button key={option} className={`quiz-option${choice === index ? ' chosen' : ''}`} onClick={() => setChoice(index)} aria-pressed={choice === index}><span className="option-letter">{String.fromCharCode(65 + index)}</span>{option}<span className="option-check"><Icon name="Check" size={17} /></span></button>)}</div><button className="button button-primary quiz-submit" disabled={choice === null || saving} onClick={submitAnswer}>{saving ? 'Menyimpan hasil...' : answers.length === questions.length - 1 ? 'Lihat hasil' : 'Periksa jawaban'} <Icon name="ArrowRight" size={17} /></button>
      {answers.length > 0 && <div className={`answer-feedback${answers.at(-1).correct ? ' correct' : ' incorrect'}`} role="status"><Icon name={answers.at(-1).correct ? 'CircleCheck' : 'CircleX'} /><div><strong>{answers.at(-1).correct ? 'Tepat sekali!' : 'Belum tepat, yuk pahami.'}</strong><p>{answers.at(-1).explanation}</p></div></div>}
      {error && <p className="inline-error" role="alert">{error} <button className="text-button" onClick={() => saveResult(answers)}>Coba simpan lagi</button></p>}
    </section>}
    {error && !current && !finished && <section className="panel quiz-panel" role="alert"><p className="inline-error">{error}</p><button className="button button-primary" disabled={saving} onClick={() => saveResult(answers)}>Coba simpan lagi</button></section>}
    {finished && <section className="panel quiz-result"><span className="result-icon"><Icon name={result >= 70 ? 'Trophy' : 'BookOpenCheck'} size={27} /></span><p className="eyebrow">HASIL KUIS</p><h2>{result >= 90 ? 'Luar biasa!' : result >= 70 ? 'Kerja bagus!' : 'Terus berlatih!'}</h2><div className="result-score">{result}<small>%</small></div><p>{answers.filter((answer) => answer.correct).length} benar dari {questions.length} soal · {answers.filter((answer) => answer.correct).length * 10} XP diperoleh</p><div className="answer-review">{answers.map((answer, index) => <div key={`${answer.questionId}-${index}`} className={answer.correct ? 'review-correct' : 'review-wrong'}><Icon name={answer.correct ? 'CircleCheck' : 'CircleX'} size={17} /><span><strong>{answer.question}</strong><small>Jawabanmu: {answer.selected}</small><small>{answer.explanation}</small></span></div>)}</div><button className="button button-primary" onClick={start}><Icon name="RotateCcw" size={17} /> Ulangi kuis</button></section>}
    <section className="panel quiz-history"><div className="panel-heading"><div><p className="eyebrow">PERJALANANMU</p><h3>Riwayat kuis</h3></div><span className="history-total">{history.length} sesi</span></div>{history.length ? <div className="history-list">{[...history].reverse().slice(0, 5).map((item) => <div className="history-row" key={item.quizId}><span className="history-icon"><Icon name="ClipboardCheck" /></span><span><strong>{item.correctAnswers}/{item.totalQuestions} jawaban benar</strong><small>{new Date(item.completedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</small></span><b>{item.accuracy}%</b></div>)}</div> : <p className="empty-hint">Selesaikan sesi kuis pertamamu, hasilnya akan tampil di sini.</p>}</section>
  </div>
}
