import { create } from 'zustand';

export const useGymStore = create((set, get) => ({
  currentLogs: [],
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addLog: (log) => set((state) => ({ currentLogs: [...state.currentLogs, log] })),
  setCurrentLogs: (logs) => set({ currentLogs: logs }),
  activityModalOpen: false,
  setActivityModalOpen: (open) => set({ activityModalOpen: open }),
  editingLogId: null,
  setEditingLogId: (id) => set({ editingLogId: id }),
}));