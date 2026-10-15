import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { MetricCard } from '../components/MetricCard.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { dashboardRepository } from '../db/repositories.js'

const badges = [
  ['first-puzzle', 'Penjelajah Rangka', 'Selesaikan puzzle pertamamu', 'Bone'],
  ['quiz-expert', 'Ahli Anatomi', 'Raih akurasi kuis ≥90%', 'GraduationCap'],
  ['perfect-puzzle', 'Tanpa Kesalahan', 'Selesaikan puzzle tanpa salah', 'Sparkles']
]

export function DashboardPage() {
  const summary = useLiveQuery(() => dashboardRepository.getSummary(), [], null)
  if (!summary) return <div className="content-wrap"><div className="skeleton-block" /></div>
  const xp = summary.totalScore
  const level = Math.floor(xp / 500) + 1
  const completion = summary.materialCount ? Math.round(summary.completedMaterials / summary.materialCount * 100) : 0
  const unlocked = new Set(summary.achievements.map((item) => item.achievementCode))
  const nextMaterial = summary.nextMaterial
    ? `Lanjutkan materi: ${summary.nextMaterial.title}`
    : 'Semua materi sudah ditandai. Coba ulangi kuis untuk mempertajam ingatan.'

  return <div className="content-wrap">
    <PageHeader eyebrow="RUANG BELAJAR BIOLOGI" title={`Halo, ${summary.student?.displayName ?? 'Siswa'}! 👋`} description="Siap mengenal rangka manusia lebih dekat hari ini?" action={<div className="level-pill"><Icon name="Zap" size={17} /><span>Level {level}</span></div>} />
    <section className="hero-banner"><div className="hero-text"><span className="hero-kicker"><Icon name="Sparkles" size={15} /> PETUALANGAN ANATOMI</span><h2>Rangka manusia,<br /><em>siap kamu susun?</em></h2><p>Pelajari tulang, susun puzzle, dan buktikan pemahamanmu.</p><div className="hero-actions"><Link className="button button-light" to="/puzzle">{summary.puzzleInProgress ? 'Lanjutkan permainan' : 'Mulai belajar'} <Icon name="ArrowRight" size={17} /></Link><Link className="text-button" to="/materi">Jelajahi materi <Icon name="ArrowUpRight" size={16} /></Link></div></div><div className="hero-illustration" aria-hidden="true"><div className="hero-ring ring-one" /><div className="hero-ring ring-two" /><div className="skeleton-art"><span className="art-head" /><span className="art-neck" /><span className="art-rib rib-a" /><span className="art-rib rib-b" /><span className="art-rib rib-c" /><span className="art-spine" /><span className="art-pelvis" /><span className="art-arm arm-left" /><span className="art-arm arm-right" /><span className="art-leg leg-left" /><span className="art-leg leg-right" /></div><span className="floating-label label-one">206 tulang*</span><span className="floating-label label-two">Belajar sambil bermain</span></div></section>
    <div className="metric-grid">
      <MetricCard label="Total XP" value={xp.toLocaleString('id-ID')} detail={`Level ${level} · ${xp % 500}/500 XP ke level berikutnya`} icon="Zap" tone="orange" />
      <MetricCard label="Puzzle selesai" value={summary.puzzleCount} detail="Terus susun rangkanya!" icon="Puzzle" tone="green" />
      <MetricCard label="Akurasi kuis" value={`${summary.accuracy}%`} detail={summary.quizResults.length ? `${summary.quizResults.length} sesi tersimpan` : 'Belum ada sesi kuis'} icon="Target" tone="purple" />
      <MetricCard label="Hari belajar" value={summary.streak} detail="Hari belajar berturut-turut" icon="Flame" tone="blue" />
    </div>
    <div className="dashboard-lower">
      <section className="panel progress-panel"><div className="panel-heading"><div><p className="eyebrow">LANGKAH BELAJARMU</p><h3>Progres materi</h3></div><Link className="link-arrow" to="/materi">Lihat materi <Icon name="ArrowRight" size={15} /></Link></div><div className="progress-summary"><strong>{completion}%</strong><span>{summary.completedMaterials} dari {summary.materialCount} topik selesai</span></div><div className="progress-track"><span style={{ width: `${completion}%` }} /></div><div className="recommendation"><span className="recommendation-icon"><Icon name="Lightbulb" /></span><div><small>REKOMENDASI BERIKUTNYA</small><p>{nextMaterial}</p></div><Link to="/materi" aria-label="Buka materi"><Icon name="ArrowRight" /></Link></div></section>
      <section className="panel achievement-panel"><div className="panel-heading"><div><p className="eyebrow">KOLEKSI BADGE</p><h3>Pencapaian</h3></div><Link className="link-arrow" to="/progres">Semua <Icon name="ArrowRight" size={15} /></Link></div><div className="badge-list">{badges.map(([code, title, hint, icon]) => <div className={`badge-item${unlocked.has(code) ? ' earned' : ' locked'}`} key={code}><span className="badge-icon"><Icon name={icon} size={18} /></span><span><strong>{title}</strong><small>{unlocked.has(code) ? 'Berhasil dibuka!' : hint}</small></span><Icon name={unlocked.has(code) ? 'Check' : 'Lock'} size={16} /></div>)}</div></section>
    </div>
    <p className="footnote">* Jumlah tulang rangka orang dewasa umumnya sekitar 206; variasi anatomi individual dapat terjadi.</p>
  </div>
}
