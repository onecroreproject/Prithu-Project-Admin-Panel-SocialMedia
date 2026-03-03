import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../Utils/axiosApi';
import { useAdminAuth } from './adminAuthContext';

const UpdateContext = createContext();

export const useUpdates = () => {
    const context = useContext(UpdateContext);
    if (!context) {
        throw new Error('useUpdates must be used within an UpdateProvider');
    }
    return context;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const UpdateProvider = ({ children }) => {
    const { user, isAuthenticated } = useAdminAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [recentUpdate, setRecentUpdate] = useState(null);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/web/api/user/updates/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    }, [isAuthenticated]);

    // Initialize Socket
    useEffect(() => {
        if (isAuthenticated && !socket) {
            const token = localStorage.getItem('token');
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('✅ Connected to Update Socket');
            });

            newSocket.on('new-update', (data) => {
                console.log('📢 New Update Received:', data);
                setUnreadCount(prev => prev + 1);
                setRecentUpdate(data);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, socket]);

    // Fetch initial count
    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        } else {
            setUnreadCount(0);
        }
    }, [isAuthenticated, fetchUnreadCount]);

    const markAsRead = async (updateId) => {
        try {
            const response = await api.post(`/web/api/user/updates/mark-read/${updateId}`);
            if (response.data.success) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return response.data;
        } catch (error) {
            console.error("Failed to mark update as read:", error);
            return { success: false };
        }
    };

    const value = {
        unreadCount,
        recentUpdate,
        fetchUnreadCount,
        markAsRead,
        socket
    };

    return (
        <UpdateContext.Provider value={value}>
            {children}
        </UpdateContext.Provider>
    );
};
