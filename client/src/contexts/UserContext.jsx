import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        }
    }
    setLoading(false);
    }, []);



    // Login function
    const login = async (username, password) => {
        try {
        const response = await authAPI.login(username, password);
        
        if (response.token) {
            const userData = {
                ...response.user,
                token: response.token
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // No longer clear localStorage or reload page
            // TodoList component will automatically switch data source based on isLoggedIn state

            return { success: true };
        } else {
            return { success: false, error: response.message };
        }
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    };

    const register = async (username, password, email) => {
        try {
                const response = await authAPI.register(username, password, email);
                
                if (response.token) {
                    const userData = {
                        ...response.user,
                        token: response.token
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));

                    // No longer clear localStorage or reload page

                    return { success: true };
                } else {
                    return { success: false, error: response.message };
                }
            } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    };


    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // No longer clear localStorage or reload page
        // TodoList component will automatically switch back to localStorage mode
    };

    // Update user function
    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        login,
        logout,
        register,
        updateUser,
        isLoggedIn: !!user
    };

    return (
        <UserContext.Provider value={value}>
        {children}
        </UserContext.Provider>
    );
}; 