export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  error?: string;
}

export function SaveIndicator({ status, error }: SaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="save-indicator">
      {status === 'saving' && (
        <span className="save-status saving">Saving...</span>
      )}
      {status === 'saved' && (
        <span className="save-status saved">✓ Saved</span>
      )}
      {status === 'error' && (
        <span className="save-status error" title={error}>
          ✗ Error
        </span>
      )}
    </div>
  );
}
