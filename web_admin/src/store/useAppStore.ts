import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BusinessAPI } from '../api';

interface AppState {
    business: any | null;
    preferences: any | null;
    isConfigured: boolean;
    setSetupData: (business: any, preferences: any) => void;
    refreshBusiness: () => Promise<void>;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            business: null,
            preferences: null,
            isConfigured: false,

            setSetupData: (business, preferences) => set({
                business,
                preferences,
                isConfigured: true
            }),

            refreshBusiness: async () => {
                try {
                    const res = await BusinessAPI.getCurrent();
                    if (res.data) {
                        set({ business: res.data });
                    }
                } catch (e) {
                    console.error('Failed to refresh business', e);
                }
            },

            logout: () => set({
                business: null,
                preferences: null,
                isConfigured: false
            }),
        }),
        { name: 'moneymitra-storage' }
    )
);
