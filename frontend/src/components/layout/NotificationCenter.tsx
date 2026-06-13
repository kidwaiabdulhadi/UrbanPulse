"use client";

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, Trash2 } from 'lucide-react';
import { useNotificationStore, Severity } from '@/store/useNotificationStore';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<Severity | 'ALL'>('ALL');

    const getIcon = (severity: Severity) => {
        switch(severity) {
            case 'CRITICAL': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'INFO': return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const filteredNotifications = notifications.filter(n => filter === 'ALL' || n.severity === filter);

    return (
        <div className="relative">
            {/* Bell Trigger */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors focus:outline-none"
            >
                <Bell className="w-5 h-5 text-zinc-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={markAllAsRead} className="text-zinc-400 hover:text-white transition-colors" title="Mark all as read">
                                    <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button onClick={clearAll} className="text-zinc-400 hover:text-red-400 transition-colors" title="Clear all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="px-4 py-2 flex gap-2 border-b border-zinc-800/50 bg-zinc-900/30 overflow-x-auto no-scrollbar">
                            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        filter === f 
                                        ? 'bg-zinc-700 text-white' 
                                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* History Scroll Area */}
                        <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                            {filteredNotifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No notifications found.
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredNotifications.map((notification) => (
                                        <div 
                                            key={notification.id}
                                            onClick={() => markAsRead(notification.id)}
                                            className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-900/50 cursor-pointer transition-colors flex gap-4 ${
                                                !notification.read ? 'bg-blue-900/10' : ''
                                            }`}
                                        >
                                            <div className="shrink-0 mt-1">
                                                {getIcon(notification.severity)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-zinc-300'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-zinc-500">
                                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="shrink-0 mt-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
