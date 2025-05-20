import React, { useState, useEffect } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { authService } from './src/services/auth';
import { USER_LEVELS } from './src/constants/userLevels';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await authService.getUser();
      setIsAuthenticated(!!user);
      setIsAdmin(user?.level === USER_LEVELS.ADMIN);
    } catch (error) {
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#B39B94' }}>
        <ActivityIndicator size="large" color="#8B6B61" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <CadastroScreen setShowRegister={setShowRegister} />
    ) : (
      <LoginScreen 
        setShowRegister={setShowRegister}
        onLoginSuccess={checkAuth}
      />
    );
  }

  if (!isAdmin) {
    return <HomeScreen onLogout={handleLogout} />;
  }

  return <AdminScreen />;
}
