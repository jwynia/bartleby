import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  variant?: 'tree' | 'editor' | 'links';
}

export function LoadingSkeleton({ variant = 'tree' }: LoadingSkeletonProps) {
  if (variant === 'tree') {
    return (
      <div className="loading-skeleton tree-skeleton">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton-item" style={{ marginLeft: `${(i % 3) * 20}px` }}>
            <div className="skeleton skeleton-icon" />
            <div className="skeleton skeleton-text" style={{ width: `${60 + Math.random() * 40}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'editor') {
    return (
      <div className="loading-skeleton editor-skeleton">
        <div className="skeleton skeleton-title" />
        <div className="skeleton-lines">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton-line"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'links') {
    return (
      <div className="loading-skeleton links-skeleton">
        <div className="skeleton skeleton-header" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-link-item">
            <div className="skeleton skeleton-link-text" />
            <div className="skeleton skeleton-link-badge" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
