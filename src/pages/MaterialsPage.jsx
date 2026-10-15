import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Icon } from '../components/Icon.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { materialRepository } from '../db/repositories.js'

export function MaterialsPage() {
  const [selected, setSelected] = useState(null)
  const materials = useLiveQuery(() => materialRepository.list(), [], [])
  const progress = useLiveQuery(() => materialRepository.getProgress(), [], [])
  const completed = new Set(progress.filter((item) => item.isCompleted).map((item) => item.materialId))

  async function open(material) {
    try { await materialRepository.open(material.id); setSelected(material) }
    catch (error) { window.alert(error.message) }
  }
  async function markComplete(material) {
    try { await materialRepository.complete(material.id); setSelected(null) }
    catch (error) { window.alert(error.message) }
  }

  return <div className="content-wrap">
    <PageHeader eyebrow="PERPUSTAKAAN ANATOMI" title="Materi sistem rangka" description="Kenali susunan, fungsi, dan peran tulang dalam sistem gerak manusia." />
    <div className="materials-intro"><span className="materials-icon"><Icon name="BookOpenCheck" size={25} /></span><div><strong>Belajar bertahap, pahami lebih dalam</strong><p>Baca ringkasan, temukan fakta menarik, lalu tandai topik yang sudah kamu pelajari.</p></div><span className="materials-count">{completed.size}/{materials.length} topik</span></div>
    <div className="material-grid">{materials.map((material, index) => <button className={`material-card${completed.has(material.id) ? ' done' : ''}`} key={material.id} onClick={() => open(material)}><span className={`material-number n${index % 4}`}>{String(index + 1).padStart(2, '0')}</span><span className="material-card-body"><small>{material.category}</small><strong>{material.title}</strong><span>{material.content}</span></span><span className="material-card-footer">{completed.has(material.id) ? <span className="completed-label"><Icon name="CircleCheck" size={15} /> Dipelajari</span> : <span>Baca ringkasan <Icon name="ArrowRight" size={15} /></span>}</span></button>)}</div>
    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="material-modal" role="dialog" aria-modal="true" aria-labelledby="material-title" onClick={(event) => event.stopPropagation()}><button className="modal-close" aria-label="Tutup" onClick={() => setSelected(null)}><Icon name="X" /></button><p className="eyebrow">{selected.category} · SISTEM RANGKA</p><h2 id="material-title">{selected.title}</h2><div className="anatomy-illustration" aria-hidden="true"><div className="anatomy-mark"><span /><i /><b /><em /></div><span className="illustration-caption">ILUSTRASI KONSEPTUAL · {selected.category.toUpperCase()}</span></div><p className="material-content">{selected.content}</p><div className="info-pair"><div><small><Icon name="MapPin" size={15} /> LOKASI</small><p>{selected.location}</p></div><div><small><Icon name="ShieldPlus" size={15} /> FUNGSI</small><p>{selected.function}</p></div></div><div className="fact-box"><Icon name="Sparkles" /><p><strong>Fakta menarik</strong>{selected.fact}</p></div><button className="button button-primary full-button" onClick={() => markComplete(selected)}><Icon name="Check" size={17} /> Tandai sudah dipelajari</button></article></div>}
  </div>
}
