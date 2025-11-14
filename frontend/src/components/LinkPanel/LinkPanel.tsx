import './LinkPanel.css';

export function LinkPanel() {
  return (
    <div className="link-panel">
      <div className="link-header">
        <h2>Links</h2>
        <button className="link-action">+</button>
      </div>
      <div className="link-content">
        <p className="placeholder-text">Link panel coming soon...</p>
        <p className="hint-text">This will display connections to other cards</p>
      </div>
    </div>
  );
}
