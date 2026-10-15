import { NavLink } from 'react-router-dom'
import { Icon } from './Icon.jsx'

const links = [
  { to: '/', label: 'Beranda', icon: 'LayoutDashboard' },
  { to: '/materi', label: 'Materi', icon: 'BookOpen' },
  { to: '/puzzle', label: 'Puzzle rangka', icon: 'Puzzle' },
  { to: '/kuis', label: 'Kuis biologi', icon: 'CircleHelp' },
  { to: '/progres', label: 'Progres', icon: 'ChartNoAxesCombined' },
  { to: '/pengaturan', label: 'Pengaturan', icon: 'Settings2' }
]

export function Sidebar() {
  return <aside className="sidebar">
    <NavLink to="/" className="brand"><span className="brand-mark"><Icon name="Bone" size={23} /></span><span>Skeletal<span className="brand-accent">Quest</span><small>Susun Rangka, Kuasai Biologi!</small></span></NavLink>
    <nav className="nav-links" aria-label="Navigasi utama">{links.map(({ to, label, icon }) =>
      <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}><Icon name={icon} /><span>{label}</span>{to === '/puzzle' && <span className="nav-dot" />}</NavLink>
    )}</nav>
    <div className="sidebar-bottom"><div className="offline-status"><span className="status-dot" /><span>Tersimpan di perangkat</span></div><p>Belajar kapan saja,<br />bahkan tanpa internet.</p></div>
  </aside>
}
