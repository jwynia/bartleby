import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  // Panel sizes (percentages)
  treeWidth: number;
  editorWidth: number;
  linksWidth: number;

  // Collapsed states
  treeCollapsed: boolean;
  linksCollapsed: boolean;

  // Actions
  setTreeWidth: (width: number) => void;
  setEditorWidth: (width: number) => void;
  setLinksWidth: (width: number) => void;
  toggleTreeCollapsed: () => void;
  toggleLinksCollapsed: () => void;
  resetLayout: () => void;
}

const DEFAULT_TREE_WIDTH = 25;
const DEFAULT_EDITOR_WIDTH = 50;
const DEFAULT_LINKS_WIDTH = 25;

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      // Default panel sizes
      treeWidth: DEFAULT_TREE_WIDTH,
      editorWidth: DEFAULT_EDITOR_WIDTH,
      linksWidth: DEFAULT_LINKS_WIDTH,

      // Default collapsed states
      treeCollapsed: false,
      linksCollapsed: false,

      // Actions
      setTreeWidth: (width) => set({ treeWidth: width }),
      setEditorWidth: (width) => set({ editorWidth: width }),
      setLinksWidth: (width) => set({ linksWidth: width }),
      toggleTreeCollapsed: () => set((state) => ({ treeCollapsed: !state.treeCollapsed })),
      toggleLinksCollapsed: () => set((state) => ({ linksCollapsed: !state.linksCollapsed })),
      resetLayout: () => set({
        treeWidth: DEFAULT_TREE_WIDTH,
        editorWidth: DEFAULT_EDITOR_WIDTH,
        linksWidth: DEFAULT_LINKS_WIDTH,
        treeCollapsed: false,
        linksCollapsed: false,
      }),
    }),
    {
      name: 'bartleby-layout',
    }
  )
);
