import { useTreeStore } from '../../stores/treeStore';
import { useCards } from '../../hooks/useCards';
import { useLinks } from '../../hooks/useLinks';
import './LinkPanel.css';

export function LinkPanel() {
  const { selectedId, setSelected } = useTreeStore();
  const { data: cards } = useCards();
  const { data: links, isLoading } = useLinks(selectedId || undefined);

  // Helper to get card title by ID
  const getCardTitle = (cardId: string) => {
    const card = cards?.find(c => c.id === cardId);
    return card?.title || cardId;
  };

  // Group links by direction (whether selected card is cardA or cardB)
  const outgoingLinks = links?.filter(link => link.cardAId === selectedId) || [];
  const incomingLinks = links?.filter(link => link.cardBId === selectedId) || [];

  const handleLinkClick = (cardId: string) => {
    setSelected(cardId);
  };

  if (!selectedId) {
    return (
      <div className="link-panel">
        <div className="link-header">
          <h2>Links</h2>
        </div>
        <div className="link-content">
          <div className="link-empty-state">
            <p>No card selected</p>
            <p className="hint-text">Select a card to view its links</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="link-panel">
        <div className="link-header">
          <h2>Links</h2>
        </div>
        <div className="link-content">
          <p className="placeholder-text">Loading links...</p>
        </div>
      </div>
    );
  }

  const hasLinks = outgoingLinks.length > 0 || incomingLinks.length > 0;

  return (
    <div className="link-panel">
      <div className="link-header">
        <h2>Links</h2>
        <button className="link-action" title="Add Link">
          +
        </button>
      </div>

      <div className="link-content">
        {!hasLinks ? (
          <div className="link-empty-state">
            <p>No links yet</p>
            <p className="hint-text">Links will appear here</p>
          </div>
        ) : (
          <>
            {outgoingLinks.length > 0 && (
              <div className="link-section">
                <h3 className="link-section-title">Outgoing ({outgoingLinks.length})</h3>
                <div className="link-list">
                  {outgoingLinks.map((link) => (
                    <div
                      key={link.id}
                      className="link-item"
                      onClick={() => handleLinkClick(link.cardBId)}
                    >
                      <div className="link-item-content">
                        <span className="link-item-title">{getCardTitle(link.cardBId)}</span>
                        {link.linkType && (
                          <span className="link-item-type">{link.linkType}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomingLinks.length > 0 && (
              <div className="link-section">
                <h3 className="link-section-title">Incoming ({incomingLinks.length})</h3>
                <div className="link-list">
                  {incomingLinks.map((link) => (
                    <div
                      key={link.id}
                      className="link-item"
                      onClick={() => handleLinkClick(link.cardAId)}
                    >
                      <div className="link-item-content">
                        <span className="link-item-title">{getCardTitle(link.cardAId)}</span>
                        {link.linkType && (
                          <span className="link-item-type">{link.linkType}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
