import './TreeView.css';

export function TreeView() {
  return (
    <div className="tree-view">
      <div className="tree-header">
        <h2>Cards</h2>
        <button className="tree-action">+</button>
      </div>
      <div className="tree-content">
        <p className="placeholder-text">Tree view coming soon...</p>
        <p className="hint-text">This will display your card hierarchy</p>
      </div>
    </div>
  );
}
