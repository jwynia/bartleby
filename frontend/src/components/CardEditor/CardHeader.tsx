import { useCards } from '../../hooks/useCards';
import type { Card } from '../../lib/types';
import { getCardTypeIcon } from '../../lib/treeUtils';
import './CardHeader.css';

interface CardHeaderProps {
  card: Card;
}

export function CardHeader({ card }: CardHeaderProps) {
  const { data: allCards } = useCards();

  // Build breadcrumb path
  const buildBreadcrumb = (cardId: string): Card[] => {
    if (!allCards) return [];

    const path: Card[] = [];
    let current = allCards.find(c => c.id === cardId);

    while (current) {
      path.unshift(current);
      if (!current.parentId) break;
      current = allCards.find(c => c.id === current?.parentId);
    }

    return path;
  };

  const breadcrumb = buildBreadcrumb(card.id);

  // Format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card-header-info">
      <div className="card-breadcrumb">
        {breadcrumb.map((crumb, index) => (
          <span key={crumb.id} className="breadcrumb-item">
            {index > 0 && <span className="breadcrumb-separator">›</span>}
            <span className="breadcrumb-icon">{getCardTypeIcon(crumb.cardType)}</span>
            <span className="breadcrumb-title">{crumb.title}</span>
          </span>
        ))}
      </div>
      <div className="card-metadata">
        <span className="metadata-item">
          <span className="metadata-label">Type:</span>
          <span className="metadata-value">{card.cardType}</span>
        </span>
        <span className="metadata-item">
          <span className="metadata-label">Created:</span>
          <span className="metadata-value">{formatDate(card.createdAt)}</span>
        </span>
        <span className="metadata-item">
          <span className="metadata-label">Modified:</span>
          <span className="metadata-value">{formatDate(card.modifiedAt)}</span>
        </span>
      </div>
    </div>
  );
}
