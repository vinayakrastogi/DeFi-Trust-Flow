import { create } from "zustand";

interface UserState {
    role: "borrower" | "lender" | "both" | "admin" | null;
    walletAddress: string | null;
    riskScore: number | null;
    kycStatus: string;
    onboardingComplete: boolean;
    activeView: "borrower" | "lender" | "admin";
    sidebarOpen: boolean;
    currency: string;
    setRole: (role: UserState["role"]) => void;
    setWalletAddress: (address: string | null) => void;
    setRiskScore: (score: number | null) => void;
    setKycStatus: (status: string) => void;
    setOnboardingComplete: (complete: boolean) => void;
    setActiveView: (view: "borrower" | "lender" | "admin") => void;
    toggleSidebar: () => void;
    setCurrency: (currency: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
    role: null,
    walletAddress: null,
    riskScore: null,
    kycStatus: "pending",
    onboardingComplete: false,
    activeView: "borrower",
    sidebarOpen: true,
    currency: "USDC",
    setRole: (role) => set({ role }),
    setWalletAddress: (walletAddress) => set({ walletAddress }),
    setRiskScore: (riskScore) => set({ riskScore }),
    setKycStatus: (kycStatus) => set({ kycStatus }),
    setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
    setActiveView: (activeView) => set({ activeView }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setCurrency: (currency) => set({ currency }),
}));

interface NotificationState {
    unreadCount: number;
    notifications: Array<{
        id: string;
        type: string;
        title: string;
        message: string;
        read: boolean;
        createdAt: string;
        actionUrl?: string;
    }>;
    setNotifications: (notifications: NotificationState["notifications"]) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    notifications: [],
    setNotifications: (notifications) =>
        set({
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
        }),
    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
        })),
    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
        })),
    setUnreadCount: (unreadCount) => set({ unreadCount }),
}));
