import { useState, useRef, useEffect } from 'react';
import { NodeRendererProps } from 'react-arborist';
import { getCardTypeIcon, getCardTypeColor } from '../../lib/treeUtils';
import type { TreeNode } from '../../lib/treeUtils';
import './TreeNode.css';

export function TreeNodeComponent({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const icon = getCardTypeIcon(node.data.data.cardType);
  const color = getCardTypeColor(node.data.data.cardType);
  const hasChildren = node.data.children && node.data.children.length > 0;

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showContextMenu && nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }

    return undefined;
  }, [showContextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    node.toggle();
  };

  return (
    <div
      ref={nodeRef}
      style={style}
      className={`tree-node ${node.isSelected ? 'selected' : ''} ${node.state.isEditing ? 'editing' : ''}`}
      onClick={() => node.select()}
      onContextMenu={handleContextMenu}
      {...dragHandle}
    >
      <div className="tree-node-content">
        {/* Expand/collapse arrow */}
        {hasChildren && (
          <span
            className={`tree-arrow ${node.isOpen ? 'open' : ''}`}
            onClick={handleToggle}
          >
            ▶
          </span>
        )}
        {!hasChildren && <span className="tree-arrow-spacer" />}

        {/* Card type icon */}
        <span className="tree-icon" style={{ color }}>
          {icon}
        </span>

        {/* Card title */}
        <span className="tree-title">{node.data.name}</span>

        {/* Child count badge */}
        {hasChildren && (
          <span className="tree-badge">{node.data.children!.length}</span>
        )}
      </div>

      {/* Context menu */}
      {showContextMenu && (
        <div
          className="tree-context-menu"
          style={{
            position: 'fixed',
            top: contextMenuPos.y,
            left: contextMenuPos.x,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              // TODO: Implement add child
              setShowContextMenu(false);
            }}
          >
            Add Child Card
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              // TODO: Implement edit
              setShowContextMenu(false);
            }}
          >
            Edit
          </button>
          <button
            className="context-menu-item"
            onClick={() => {
              // TODO: Implement duplicate
              setShowContextMenu(false);
            }}
          >
            Duplicate
          </button>
          <div className="context-menu-divider" />
          <button
            className="context-menu-item danger"
            onClick={() => {
              // TODO: Implement delete
              setShowContextMenu(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
