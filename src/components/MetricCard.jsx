import { Icon } from './Icon.jsx'

export function MetricCard({ label, value, detail, icon, tone = 'blue' }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><Icon name={icon} /></span><div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>
}
