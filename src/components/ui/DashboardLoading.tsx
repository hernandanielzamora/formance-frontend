export default function DashboardLoading({ message = 'Preparando tu espacio…' }: { message?: string }) {
  return <div className="dashboard-loading" role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{message}</span>
    <div className="skeleton skeleton-topbar" aria-hidden="true" />
    <div className="skeleton-intro" aria-hidden="true"><div className="skeleton skeleton-label" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-description" /></div>
    <div className="skeleton skeleton-banner" aria-hidden="true" />
    <div className="cards" aria-hidden="true">{[0, 1, 2].map((key) => <div key={key} className="skeleton skeleton-card" />)}</div>
  </div>;
}
