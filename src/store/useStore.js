import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      nodes: [],
      selectedNodeId: null,

      setSelectedNodeId: (id) => set({ selectedNodeId: id }),

      addNode: (nodeData) => {
        const newId = `${nodeData.type.charAt(0)}-${Date.now()}`;
        set((state) => ({
          nodes: [...state.nodes, {
            ...nodeData,
            id: newId,
            timestamp: Date.now(),
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
          }],
          lastAddedNodeId: newId // <--- Add this tracker
        }));
      },

      updateNode: (id, updatedData) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, ...updatedData } : n),
        selectedNodeId: null // Deselect after edit
      })),

      deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        selectedNodeId: null
      })),

      clearAll: () => set({ nodes: [], selectedNodeId: null })
    }),
    { name: 'cosmic-synastre-storage' }
  )
);
