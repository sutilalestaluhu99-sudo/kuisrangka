import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { MetricCard } from '../components/MetricCard.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { dashboardRepository, materialRepository, puzzleRepository, quizRepository } from '../db/repositories.js'

const badges = [
  ['first-puzzle', 'Penjelajah Rangka', 'Selesaikan puzzle pertamamu', 'Bone'],
  ['quiz-expert', 'Ahli Anatomi', 'Raih akurasi kuis minimal 90%', 'GraduationCap'],
  ['perfect-puzzle', 'Tanpa Kesalahan', 'Selesaikan puzzle tanpa salah', 'Sparkles']
]

export function ProgressPage() {
  const summary = useLiveQuery(() => dashboardRepository.getSummary(), [], null)
  const puzzleProgress = useLiveQuery(() => puzzleRepository.getProgress(), [], [])
  const materials = useLiveQuery(() => materialRepository.list(), [], [])
  const materialProgress = useLiveQuery(() => materialRepository.getProgress(), [], [])
  const quizzes = useLiveQuery(() => quizRepository.list(), [], [])
  if (!summary) return <div className="content-wrap"><div className="skeleton-block" /></div>
  const earned = new Set(summary.achievements.map((item) => item.achievementCode))
  const totalMinutes = Math.floor(summary.totalSeconds / 60)
  const allSessions = [...summary.sessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const maxScore = Math.max(1, ...allSessions.map((item) => item.score ?? 0))
  const completed = new Set(materialProgress.filter((item) => item.isCompleted).map((item) => item.materialId))
  return <div className="content-wrap">
    <PageHeader eyebrow="JEJAK BELAJARMU" title="Progres & pencapaian" description="Lihat kemajuanmu dari sesi belajar yang benar-benar tersimpan di perangkat." />
    <div className="metric-grid progress-metrics"><MetricCard label="Skor terbaik" value={Math.max(0, ...allSessions.map((item) => item.score ?? 0))} detail="Poin dalam satu sesi" icon="Trophy" tone="orange" /><MetricCard label="Waktu belajar" value={`${totalMinutes} mnt`} detail={`${summary.sessions.length} sesi belajar`} icon="Clock3" tone="blue" /><MetricCard label="Materi dipelajari" value={`${completed.size}/${materials.length}`} detail="Topik selesai dibaca" icon="BookOpenCheck" tone="green" /><MetricCard label="Akurasi kuis" value={`${summary.accuracy}%`} detail={`${quizzes.length} sesi kuis`} icon="Target" tone="purple" /></div>
    <div className="progress-columns"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">KONSISTENSI</p><h3>Aktivitas belajar</h3></div></div>{allSessions.length ? <div className="activity-chart" role="img" aria-label="Grafik skor sesi belajar terbaru">{allSessions.slice(0, 8).reverse().map((session, index) => <div className="chart-column" key={`${session.type}-${session.completedAt}-${index}`}><span>{session.score ?? 0}</span><i style={{ height: `${Math.max(8, (session.score ?? 0) / maxScore * 100)}%` }} /><small>{new Date(session.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</small></div>)}</div> : <p className="empty-hint">Grafik muncul setelah kamu menyelesaikan permainan atau kuis.</p>}</section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">KOLEKSI</p><h3>Badge pencapaian</h3></div></div><div className="badge-list">{badges.map(([code, title, hint, icon]) => <div className={`badge-item${earned.has(code) ? ' earned' : ' locked'}`} key={code}><span className="badge-icon"><Icon name={icon} size={18} /></span><span><strong>{title}</strong><small>{earned.has(code) ? 'Berhasil dibuka!' : hint}</small></span><Icon name={earned.has(code) ? 'Check' : 'Lock'} size={16} /></div>)}</div></section></div>
    <section className="panel session-history"><div className="panel-heading"><div><p className="eyebrow">CATATAN LOKAL</p><h3>Riwayat sesi</h3></div></div>{allSessions.length ? <div className="history-list">{allSessions.map((session, index) => <div className="history-row" key={`${session.type}-${session.completedAt}-${index}`}><span className="history-icon"><Icon name={session.type === 'puzzle' ? 'Puzzle' : 'CircleHelp'} /></span><span><strong>{session.type === 'puzzle' ? `Puzzle · ${puzzleProgress.find((item) => item.status === 'completed')?.difficulty ?? 'rangka'}` : 'Kuis biologi'}</strong><small>{new Date(session.completedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} · {Math.floor((session.durationSeconds ?? 0) / 60)} menit</small></span><b>{session.score ?? 0} XP</b></div>)}</div> : <p className="empty-hint">Belum ada sesi selesai. Mulai dari puzzle atau kuis untuk mencatat progres.</p>}</section>
  </div>
}
