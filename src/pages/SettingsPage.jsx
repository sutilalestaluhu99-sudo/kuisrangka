import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { studentRepository, settingsRepository, exportData, importData } from '../db/repositories.js'

export function SettingsPage() {
  const student = useLiveQuery(() => studentRepository.get(), [], null)
  const settings = useLiveQuery(() => settingsRepository.list(), [], [])
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const inputFile = useRef(null)
  const soundEnabled = settings.find((item) => item.key === 'soundEnabled')?.value ?? true

  async function saveName(event) {
    event.preventDefault()
    try {
      const updated = await studentRepository.updateName(name || student?.displayName || '')
      setName(''); setError(''); setNotice(`Profil diperbarui untuk ${updated.displayName}.`)
    } catch (issue) { setError(issue.message); setNotice('') }
  }
  async function toggleSound(event) {
    try { await settingsRepository.set('soundEnabled', event.target.checked); setNotice('Pengaturan suara tersimpan.'); setError('') }
    catch (issue) { setError(`Pengaturan gagal tersimpan: ${issue.message}`) }
  }
  async function downloadBackup() {
    try {
      const backup = await exportData()
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url; link.download = `skeletalquest-cadangan-${new Date().toISOString().slice(0, 10)}.json`
      link.click(); URL.revokeObjectURL(url); setNotice('Cadangan data berhasil dibuat.')
    } catch (issue) { setError(`Ekspor gagal: ${issue.message}`) }
  }
  async function loadBackup(event) {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const payload = JSON.parse(await file.text())
      await importData(payload)
      setNotice('Data berhasil dipulihkan. Muat ulang halaman jika ada informasi yang belum diperbarui.')
      setError('')
    } catch (issue) { setError(`Impor gagal: ${issue.message}`); setNotice('') }
    finally { event.target.value = '' }
  }
  return <div className="content-wrap"><PageHeader eyebrow="PREFERENSI BELAJAR" title="Pengaturan" description="Kelola profil lokal dan cadangan progres belajar pada perangkat ini." />
    <div className="settings-layout"><section className="panel settings-card"><div className="settings-heading"><span><Icon name="UserRound" /></span><div><p className="eyebrow">PROFIL LOKAL</p><h3>Nama siswa</h3></div></div><p>Nama hanya disimpan di browser ini dan tidak dikirim ke mana pun.</p><form className="name-form" onSubmit={saveName}><label htmlFor="student-name">Nama yang ditampilkan</label><div><input id="student-name" value={name} onChange={(event) => setName(event.target.value)} placeholder={student?.displayName ?? 'Nama siswa'} maxLength={40} /><button className="button button-primary" type="submit">Simpan nama</button></div></form></section>
      <section className="panel settings-card"><div className="settings-heading"><span><Icon name="Volume2" /></span><div><p className="eyebrow">PENGALAMAN</p><h3>Efek suara</h3></div></div><div className="toggle-row"><span><strong>Suara interaksi</strong><small>Kontrol preferensi efek suara sederhana.</small></span><label className="switch"><input type="checkbox" checked={soundEnabled} onChange={toggleSound} aria-label="Aktifkan suara" /><span /></label></div></section>
      <section className="panel settings-card"><div className="settings-heading"><span><Icon name="DatabaseBackup" /></span><div><p className="eyebrow">DATA PERANGKAT</p><h3>Cadangan & pemulihan</h3></div></div><p>Ekspor progres sebagai berkas JSON untuk disimpan. Impor akan menggabungkan data yang cocok dan memperbarui data dengan ID yang sama.</p><div className="backup-actions"><button className="button button-secondary" onClick={downloadBackup}><Icon name="Download" size={17} /> Ekspor data</button><button className="button button-outline" onClick={() => inputFile.current?.click()}><Icon name="Upload" size={17} /> Impor data</button><input ref={inputFile} type="file" accept="application/json,.json" onChange={loadBackup} hidden /></div></section>
      <div className="privacy-note"><Icon name="ShieldCheck" /><p><strong>Privasi dan mode offline</strong> Progres belajar disimpan secara lokal di IndexedDB browser. Aplikasi dapat dibuka offline setelah asetnya dimuat dan di-cache.</p></div>
    </div>{notice && <p className="notice-message" role="status"><Icon name="CircleCheck" size={17} />{notice}</p>}{error && <p className="inline-error" role="alert"><Icon name="CircleAlert" size={17} />{error}</p>}
  </div>
}
