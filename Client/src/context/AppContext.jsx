import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Context
export const AppContext = createContext();

// Create a Provider component
export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    const backendUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://lostify-backend-6nsq.onrender.com';

    useEffect(() => {
        const fetchUserData = async (token) => {
            try {
                const response = await fetch(`${backendUrl}/api/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                }
            } catch (error) {
                console.error("Failed to sync user data:", error);
            }
        };

        const token = localStorage.getItem('token');

        if (token) {
            setIsLoggedIn(true);
            fetchUserData(token);
        }
    }, [backendUrl]);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AppContext.Provider value={{ isLoggedIn, user, login, logout, backendUrl }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom hook for using the context
export const useAuth = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
