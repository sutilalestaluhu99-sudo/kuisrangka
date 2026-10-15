import { Component, lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { initializeDatabase } from './db/database.js'
import { Sidebar } from './components/Sidebar.jsx'
import { Icon } from './components/Icon.jsx'

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage })))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage.jsx').then((module) => ({ default: module.MaterialsPage })))
const PuzzlePage = lazy(() => import('./pages/PuzzlePage.jsx').then((module) => ({ default: module.PuzzlePage })))
const QuizPage = lazy(() => import('./pages/QuizPage.jsx').then((module) => ({ default: module.QuizPage })))
const ProgressPage = lazy(() => import('./pages/ProgressPage.jsx').then((module) => ({ default: module.ProgressPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then((module) => ({ default: module.SettingsPage })))

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error) { console.error('Kesalahan komponen aplikasi.', error) }
  render() {
    if (this.state.hasError) return <main className="error-screen"><div className="error-card"><Icon name="CircleAlert" /><h1>Terjadi kendala</h1><p>Halaman tidak dapat ditampilkan. Muat ulang aplikasi untuk mencoba kembali.</p><button className="button button-primary" onClick={() => window.location.reload()}>Muat ulang</button></div></main>
    return this.props.children
  }
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    initializeDatabase().then(() => setReady(true)).catch((issue) => setError(issue.message))
  }, [])

  if (error) return <main className="error-screen"><div className="error-card"><Icon name="Database" /><h1>Penyimpanan belum tersedia</h1><p>{error}</p><button className="button button-secondary" onClick={() => { setError(''); initializeDatabase().then(() => setReady(true)).catch((issue) => setError(issue.message)) }}>Coba lagi</button></div></main>
  if (!ready) return <main className="loading-screen"><span className="loading-orbit" /><p>Menyiapkan ruang belajar lokal...</p></main>

  return <ErrorBoundary><div className="app-shell"><Sidebar /><main className="main-content"><Suspense fallback={<main className="loading-screen"><span className="loading-orbit" /><p>Membuka ruang belajar...</p></main>}><Routes>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/materi" element={<MaterialsPage />} />
    <Route path="/puzzle" element={<PuzzlePage />} />
    <Route path="/kuis" element={<QuizPage />} />
    <Route path="/progres" element={<ProgressPage />} />
    <Route path="/pengaturan" element={<SettingsPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Suspense></main></div></ErrorBoundary>
}
