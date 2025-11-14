import { ReactNode, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLayoutStore } from '../../stores/layoutStore';
import './MainLayout.css';

interface MainLayoutProps {
  treePanel: ReactNode;
  editorPanel: ReactNode;
  linksPanel: ReactNode;
}

export function MainLayout({ treePanel, editorPanel, linksPanel }: MainLayoutProps) {
  const {
    treeWidth,
    editorWidth,
    linksWidth,
    treeCollapsed,
    linksCollapsed,
    setTreeWidth,
    setEditorWidth,
    setLinksWidth,
  } = useLayoutStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Toggle tree panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        useLayoutStore.getState().toggleTreeCollapsed();
      }
      // Cmd/Ctrl + L: Toggle links panel
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        useLayoutStore.getState().toggleLinksCollapsed();
      }
      // Cmd/Ctrl + 0: Reset layout
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        useLayoutStore.getState().resetLayout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="main-layout">
      <PanelGroup direction="horizontal" autoSaveId="bartleby-main-layout">
        {/* Tree Panel (Left) */}
        <Panel
          id="tree-panel"
          defaultSize={treeWidth}
          minSize={15}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onResize={(size) => setTreeWidth(size)}
          className={treeCollapsed ? 'panel-collapsed' : ''}
        >
          <div className="panel-content tree-panel">
            {treePanel}
          </div>
        </Panel>

        {!treeCollapsed && <PanelResizeHandle className="resize-handle" />}

        {/* Editor Panel (Center) */}
        <Panel
          id="editor-panel"
          defaultSize={editorWidth}
          minSize={30}
          onResize={(size) => setEditorWidth(size)}
        >
          <div className="panel-content editor-panel">
            {editorPanel}
          </div>
        </Panel>

        {!linksCollapsed && <PanelResizeHandle className="resize-handle" />}

        {/* Links Panel (Right) */}
        <Panel
          id="links-panel"
          defaultSize={linksWidth}
          minSize={15}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onResize={(size) => setLinksWidth(size)}
          className={linksCollapsed ? 'panel-collapsed' : ''}
        >
          <div className="panel-content links-panel">
            {linksPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
