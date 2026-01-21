import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Group } from '@/types/bill.types';

// Predefined color palette for groups
const GROUP_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

interface GroupStore {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  createGroup: (name: string, lineNumbers: string[]) => Group;
  updateGroup: (id: string, updates: Partial<Omit<Group, 'id'>>) => void;
  deleteGroup: (id: string) => void;
  addLinesToGroup: (groupId: string, lineNumbers: string[]) => void;
  removeLinesFromGroup: (groupId: string, lineNumbers: string[]) => void;
  moveLinesBetweenGroups: (lineNumbers: string[], fromGroupId: string | null, toGroupId: string) => void;
  getGroupedLineNumbers: () => Set<string>;
  getGroupForLine: (lineNumber: string) => Group | undefined;
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],

      setGroups: (groups) => {
        // Clear localStorage if setting demo groups (they shouldn't persist)
        const isDemoGroups = groups.some(g => g.id.startsWith('demo-group-'));
        if (isDemoGroups) {
          // Don't persist demo groups - just set in memory
          set({ groups });
          return;
        }
        set({ groups });
      },

      createGroup: (name, lineNumbers) => {
        const newGroup: Group = {
          id: crypto.randomUUID(),
          name,
          lineNumbers,
          color: GROUP_COLORS[get().groups.length % GROUP_COLORS.length],
        };
        set((state) => ({ groups: [...state.groups, newGroup] }));
        return newGroup;
      },

      updateGroup: (id, updates) => {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      deleteGroup: (id) => {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        }));
      },

      addLinesToGroup: (groupId, lineNumbers) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === groupId) {
              const existingLines = new Set(g.lineNumbers);
              const newLines = lineNumbers.filter((ln) => !existingLines.has(ln));
              return { ...g, lineNumbers: [...g.lineNumbers, ...newLines] };
            }
            return g;
          }),
        }));
      },

      removeLinesFromGroup: (groupId, lineNumbers) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === groupId) {
              const linesToRemove = new Set(lineNumbers);
              return { ...g, lineNumbers: g.lineNumbers.filter((ln) => !linesToRemove.has(ln)) };
            }
            return g;
          }),
        }));
      },

      moveLinesBetweenGroups: (lineNumbers, fromGroupId, toGroupId) => {
        set((state) => ({
          groups: state.groups.map((g) => {
            if (g.id === fromGroupId) {
              const linesToMove = new Set(lineNumbers);
              return { ...g, lineNumbers: g.lineNumbers.filter((ln) => !linesToMove.has(ln)) };
            } else if (g.id === toGroupId) {
              const existingLines = new Set(g.lineNumbers);
              const newLines = lineNumbers.filter((ln) => !existingLines.has(ln));
              return { ...g, lineNumbers: [...g.lineNumbers, ...newLines] };
            }
            return g;
          }),
        }));
      },

      getGroupedLineNumbers: () => {
        return new Set(get().groups.flatMap((g) => g.lineNumbers));
      },

      getGroupForLine: (lineNumber) => {
        return get().groups.find((g) => g.lineNumbers.includes(lineNumber));
      },
    }),
    {
      name: 'splitbill-groups',
    }
  )
);
