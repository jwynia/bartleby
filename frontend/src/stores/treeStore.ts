import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TreeState {
  // Expanded node IDs
  expandedIds: Set<string>;

  // Selected node ID
  selectedId: string | null;

  // Actions
  toggleExpanded: (id: string) => void;
  expandNode: (id: string) => void;
  collapseNode: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setSelected: (id: string | null) => void;
}

export const useTreeStore = create<TreeState>()(
  persist(
    (set) => ({
      expandedIds: new Set<string>(),
      selectedId: null,

      toggleExpanded: (id) =>
        set((state) => {
          const newExpanded = new Set(state.expandedIds);
          if (newExpanded.has(id)) {
            newExpanded.delete(id);
          } else {
            newExpanded.add(id);
          }
          return { expandedIds: newExpanded };
        }),

      expandNode: (id) =>
        set((state) => ({
          expandedIds: new Set(state.expandedIds).add(id),
        })),

      collapseNode: (id) =>
        set((state) => {
          const newExpanded = new Set(state.expandedIds);
          newExpanded.delete(id);
          return { expandedIds: newExpanded };
        }),

      expandAll: () =>
        set({ expandedIds: new Set<string>() }), // Empty set = all expanded in Arborist

      collapseAll: () =>
        set({ expandedIds: new Set<string>() }),

      setSelected: (id) =>
        set({ selectedId: id }),
    }),
    {
      name: 'bartleby-tree',
      // Custom serialization for Set
      partialize: (state) => ({
        expandedIds: Array.from(state.expandedIds),
        selectedId: state.selectedId,
      }),
      // Custom deserialization
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        expandedIds: new Set(persistedState?.expandedIds || []),
        selectedId: persistedState?.selectedId || null,
      }),
    }
  )
);
