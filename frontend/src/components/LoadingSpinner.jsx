/**
 * LoadingSpinner - Visual feedback for loading states
 * Heuristic #1: Visibility of System Status
 */
export default function LoadingSpinner({ text = 'Memuat...', fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loading-fullpage" role="status" aria-label={text}>
        <div className="loading-spinner" />
        <p className="loading-text">{text}</p>
      </div>
    );
  }

  return (
    <div className="loading-inline" role="status" aria-label={text}>
      <div className="loading-spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}

/**
 * SkeletonCard - Placeholder while content loads
 * Prevents layout shift and shows users something is coming
 */
export function SkeletonCard({ count = 3 }) {
  return (
    <div className="stats-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card skeleton-card" aria-hidden="true">
          <div className="skeleton skeleton-icon" />
          <div className="skeleton-info">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
          </div>
        </div>
      ))}
    </div>
  );
}
