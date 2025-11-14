import './CardEditor.css';

export function CardEditor() {
  return (
    <div className="card-editor">
      <div className="editor-header">
        <input
          type="text"
          className="card-title-input"
          placeholder="Card title..."
          defaultValue="Welcome to Bartleby"
        />
        <div className="editor-actions">
          <span className="save-status">Saved</span>
        </div>
      </div>
      <div className="editor-content">
        <p className="placeholder-text">Markdown editor coming soon...</p>
        <p className="hint-text">This will be your Milkdown editor with wiki link support</p>
      </div>
    </div>
  );
}
