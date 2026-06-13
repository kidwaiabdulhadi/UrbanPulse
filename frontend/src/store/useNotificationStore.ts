import { create } from 'zustand';

export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface Notification {
    id: string;
    message: string;
    severity: Severity;
    timestamp: Date;
    read: boolean;
    link?: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

// Initial mock data simulating real-time AI alerts
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        message: 'Critical overcrowding predicted at Stop A in 20 minutes.',
        severity: 'CRITICAL',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        read: false,
    },
    {
        id: '2',
        message: 'Recommended action: Dispatch one additional vehicle.',
        severity: 'INFO',
        timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 mins ago
        read: false,
    },
    {
        id: '3',
        message: 'Weather anomaly detected: Heavy rain reducing platform throughput.',
        severity: 'WARNING',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
    }
];

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: MOCK_NOTIFICATIONS,
    unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
    
    addNotification: (notification) => set((state) => {
        const newNotif = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            read: false,
        };
        
        // Browser Push Notification integration (if supported and permitted)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`UrbanPulse ${notification.severity}`, { body: notification.message });
        }

        const updated = [newNotif, ...state.notifications];
        return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length,
        };
    }),
    
    markAsRead: (id) => set((state) => {
        const updated = state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        return {
            notifications: updated,
            unreadCount: updated.filter(n => !n.read).length,
        };
    }),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
    })),

    clearAll: () => set({ notifications: [], unreadCount: 0 })
}));
