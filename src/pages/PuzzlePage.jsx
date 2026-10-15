import { useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { calculatePuzzleScore, difficultySettings, piecesForDifficulty, targets } from '../data/puzzleData.js'
import { achievementRepository, puzzleProgressRepository, puzzleRepository, settingsRepository } from '../db/repositories.js'
import { playFeedbackSound } from '../utils/sound.js'

function BonePiece({ piece, selected, placed, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: piece.id, disabled: placed })
  return <button ref={setNodeRef} {...attributes} {...listeners} onClick={() => onSelect(piece.id)} className={`bone-piece${selected ? ' selected' : ''}${placed ? ' placed' : ''}${isDragging ? ' dragging' : ''}`} style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined} aria-pressed={selected}>
    <span className="bone-piece-icon"><Icon name={placed ? 'CircleCheck' : 'Bone'} size={17} /></span><span>{piece.name}</span>{placed && <small>terpasang</small>}
  </button>
}

function TargetSlot({ target, piece, selectedPiece, onPlace }) {
  const { setNodeRef, isOver } = useDroppable({ id: target.id })
  return <button ref={setNodeRef} className={`target-slot${piece ? ' filled' : ''}${isOver ? ' over' : ''}`} onClick={() => onPlace(target.id)} aria-label={`${target.id}${piece ? `: ${piece.name}` : ', area kosong'}`}>
    <span className="target-icon">{target.icon}</span><span className="target-name">{target.id}</span>
    {piece ? <small><Icon name="Check" size={13} /> {piece.name}</small> : selectedPiece ? <small className="target-instruction">Pilih untuk menempatkan</small> : <small className="target-empty">Lepaskan atau pilih potongan</small>}
  </button>
}

export function PuzzlePage() {
  const saved = useLiveQuery(() => puzzleProgressRepository.getCurrent(), [], null)
  const soundEnabled = useLiveQuery(() => settingsRepository.get('soundEnabled'), [], true)
  const [difficulty, setDifficulty] = useState('mudah')
  const [placed, setPlaced] = useState({})
  const [selected, setSelected] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const [hints, setHints] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [active, setActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [message, setMessage] = useState('')
  const [paused, setPaused] = useState(false)
  const completedRef = useRef(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )
  const pieces = useMemo(() => piecesForDifficulty(difficulty), [difficulty])
  const placedCount = Object.keys(placed).length
  const score = calculatePuzzleScore({ placements: placedCount, hintsUsed: hints, difficulty, mistakes })
  const selectedPiece = pieces.find((piece) => piece.id === selected)

  useEffect(() => {
    if (!active || paused || finished) return undefined
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [active, paused, finished])

  useEffect(() => {
    if (!active || paused || finished || seconds === 0 || seconds % 5 !== 0) return
    void persist(placed, mistakes, hints, difficulty, seconds)
  }, [active, paused, finished, seconds])

  useEffect(() => {
    if (!saved || saved.status !== 'in-progress') return
    const valid = piecesForDifficulty(saved.difficulty)
    if (!valid.length) return
    setDifficulty(saved.difficulty)
    setPlaced(saved.placedPieces ?? {})
    setMistakes(saved.mistakes ?? 0)
    setHints(saved.hintsUsed ?? 0)
    setSeconds(saved.elapsedSeconds ?? 0)
    setActive(true)
  }, [saved?.updatedAt])

  async function persist(nextPlaced, nextMistakes = mistakes, nextHints = hints, nextDifficulty = difficulty, nextSeconds = seconds) {
    try {
      await puzzleRepository.saveProgress({ difficulty: nextDifficulty, placedPieces: nextPlaced, score: calculatePuzzleScore({ placements: Object.keys(nextPlaced).length, hintsUsed: nextHints, difficulty: nextDifficulty, mistakes: nextMistakes }), mistakes: nextMistakes, hintsUsed: nextHints, elapsedSeconds: nextSeconds })
    } catch (error) { setMessage(`Progres gagal tersimpan: ${error.message}`) }
  }

  async function start(nextDifficulty = difficulty, reset = false) {
    if (reset && active && !finished && !window.confirm('Mulai ulang puzzle? Progres sesi ini akan diganti.')) return
    const nextPlaced = reset ? {} : placed
    setDifficulty(nextDifficulty); setPlaced(nextPlaced); setMistakes(0); setHints(0); setSeconds(0)
    setSelected(null); setFinished(false); completedRef.current = false; setActive(true); setPaused(false); setMessage('')
    await puzzleRepository.saveProgress({ difficulty: nextDifficulty, placedPieces: nextPlaced, score: 0, mistakes: 0, hintsUsed: 0, elapsedSeconds: 0 })
  }

  async function complete(nextPlaced, nextMistakes = mistakes, nextHints = hints) {
    if (completedRef.current) return
    completedRef.current = true
    try {
      const finalScore = await puzzleRepository.complete({ difficulty, placedPieces: nextPlaced, mistakes: nextMistakes, hintsUsed: nextHints, elapsedSeconds: seconds })
      setPlaced(nextPlaced); setFinished(true); setActive(false); setMessage(`Hebat! Puzzle selesai dengan ${finalScore} poin.`)
      await achievementRepository.unlock('first-puzzle')
      if (nextMistakes === 0 && nextHints === 0) await achievementRepository.unlock('perfect-puzzle')
    } catch (error) {
      completedRef.current = false
      setMessage(`Puzzle selesai, tetapi hasil belum tersimpan: ${error.message}`)
    }
  }

  async function placeOn(targetId, pieceId = selected) {
    if (paused || finished) return
    const piece = pieces.find((item) => item.id === pieceId)
    if (!piece || placed[piece.id]) return
    if (piece.target !== targetId) {
      playFeedbackSound(false, soundEnabled)
      const nextMistakes = mistakes + 1
      setMistakes(nextMistakes)
      setMessage(`Belum tepat. ${piece.name} berada di ${piece.location.toLowerCase()}. Coba target lain.`)
      await persist(placed, nextMistakes)
      return
    }
    const nextPlaced = { ...placed, [piece.id]: targetId }
    playFeedbackSound(true, soundEnabled)
    setPlaced(nextPlaced); setSelected(null); setMessage(`Tepat! ${piece.name}: ${piece.function}`)
    await persist(nextPlaced)
    if (Object.keys(nextPlaced).length === pieces.length) await complete(nextPlaced)
  }

  async function showHint() {
    if (!active || paused || finished) return
    const nextHints = hints + 1
    setHints(nextHints)
    const piece = pieces.find((item) => !placed[item.id])
    setSelected(piece?.id ?? null)
    const hint = difficulty === 'sulit' ? `Petunjuk: ${piece?.clue}` : `Petunjuk: ${piece?.name} — ${piece?.clue} ${piece?.function}`
    setMessage(`${hint} (-${difficultySettings[difficulty].hintPenalty} poin)`)
    await persist(placed, mistakes, nextHints)
  }

  const formatTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  return <div className="content-wrap">
    <PageHeader eyebrow="TANTANGAN INTERAKTIF" title="Puzzle rangka manusia" description="Pilih potongan lalu pilih lokasi, atau seret ke area yang tepat. Puzzle juga dapat dimainkan dengan keyboard." />
    {!active && !finished && <section className="panel difficulty-picker"><div><p className="eyebrow">PILIH TANTANGAN</p><h2>Siap menyusun rangka?</h2><p>Penempatan tepat +100 poin · petunjuk mengurangi poin · tanpa kesalahan bonus +50 poin.</p></div><div className="difficulty-options">{Object.entries(difficultySettings).map(([key, option]) => <button key={key} className={`difficulty-card${difficulty === key ? ' chosen' : ''}`} onClick={() => setDifficulty(key)}><strong>{option.label}</strong><span>{option.description}</span><small>{piecesForDifficulty(key).length} potongan</small></button>)}</div><button className="button button-primary" onClick={() => start(difficulty, true)}><Icon name="Play" size={17} /> Mulai puzzle</button></section>}
    {(active || finished) && <DndContext sensors={sensors} onDragEnd={({ active: dragged, over }) => over && placeOn(over.id, dragged.id)}>
      <div className="puzzle-toolbar panel"><div className="puzzle-stats"><span><Icon name="Star" /> <b>{score}</b><small>POIN</small></span><span><Icon name="Footprints" /> <b>{mistakes}</b><small>KESALAHAN</small></span><span><Icon name="Clock3" /> <b>{formatTime}</b><small>WAKTU</small></span></div><div className="toolbar-actions"><button className="icon-button" onClick={() => { const nextPaused = !paused; setPaused(nextPaused); if (nextPaused) void persist(placed, mistakes, hints, difficulty, seconds) }} disabled={finished} aria-label={paused ? 'Lanjutkan' : 'Jeda'}><Icon name={paused ? 'Play' : 'Pause'} /></button><button className="icon-button" onClick={showHint} disabled={!active || finished || paused} aria-label="Petunjuk"><Icon name="Lightbulb" /></button><button className="icon-button" onClick={() => start(difficulty, true)} aria-label="Mulai ulang"><Icon name="RotateCcw" /></button></div></div>
      <section className="panel puzzle-board"><div className="puzzle-progress-head"><span><strong>{placedCount}</strong> dari {pieces.length} potongan</span><span>{difficultySettings[difficulty].label}</span></div><div className="progress-track"><span style={{ width: `${placedCount / pieces.length * 100}%` }} /></div>
        <div className="puzzle-workspace"><div className="piece-bank"><h3><Icon name="Bone" size={18} /> Potongan tulang</h3><p>Pilih potongan, lalu pilih area target.</p><div className="pieces-list">{pieces.map((piece) => <BonePiece key={piece.id} piece={piece} selected={selected === piece.id} placed={Boolean(placed[piece.id])} onSelect={(id) => setSelected((current) => current === id ? null : id)} />)}</div></div>
          <div className="target-bank"><h3><Icon name="Scan" size={18} /> Peta anatomi</h3><p>Target sesuai posisi anatomi, bukan acak.</p><div className="anatomy-map" aria-hidden="true"><span className="map-head" /><span className="map-body" /><span className="map-arm left" /><span className="map-arm right" /><span className="map-legs left" /><span className="map-legs right" /></div><div className="targets-grid">{targets.filter((target) => pieces.some((piece) => piece.target === target.id)).map((target) => <TargetSlot key={target.id} target={target} piece={pieces.find((piece) => placed[piece.id] === target.id)} selectedPiece={selectedPiece} onPlace={placeOn} />)}</div></div></div>
        <div className={`puzzle-feedback${finished ? ' success' : ''}`} role="status"><Icon name={finished ? 'PartyPopper' : 'Info'} size={18} /><span>{paused && !finished ? 'Puzzle dijeda. Ambil napas, lalu lanjutkan.' : message || 'Pilih tulang dan lokasi target untuk memulai.'}</span></div>
        {finished && <button className="button button-secondary" onClick={() => start(difficulty, true)}><Icon name="RotateCcw" size={17} /> Main lagi</button>}
      </section>
    </DndContext>}
    {!active && !finished && <div className="scoring-note"><Icon name="ShieldCheck" /><span><strong>Aturan skor transparan</strong> Jawaban salah tidak menambah poin. Kemajuan disimpan otomatis setelah setiap langkah.</span></div>}
  </div>
}
