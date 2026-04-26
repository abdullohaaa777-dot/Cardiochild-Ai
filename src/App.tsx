import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ParentDashboard from './pages/ParentDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ChildProfile from './pages/ChildProfile';
import DietGenerator from './pages/DietGenerator';
import CameraAnalysis from './pages/CameraAnalysis';
import DailyTracking from './pages/DailyTracking';
import HealthModules from './pages/HealthModules';
import { getCurrentUser } from './services/storage';
import { User } from './types';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'parent' | 'doctor' }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/auth" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Parent Routes */}
        <Route path="/parent" element={
          <ProtectedRoute allowedRole="parent">
            <ParentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/child/:id" element={
          <ProtectedRoute>
            <ChildProfile />
          </ProtectedRoute>
        } />
        <Route path="/child/new" element={
          <ProtectedRoute allowedRole="parent">
            <ChildProfile />
          </ProtectedRoute>
        } />
        <Route path="/diet/:childId" element={
          <ProtectedRoute>
            <DietGenerator />
          </ProtectedRoute>
        } />
        <Route path="/camera/:childId" element={
          <ProtectedRoute>
            <CameraAnalysis />
          </ProtectedRoute>
        } />
        <Route path="/tracking/:childId" element={
          <ProtectedRoute>
            <DailyTracking />
          </ProtectedRoute>
        } />
        <Route path="/modules/:childId" element={
          <ProtectedRoute>
            <HealthModules />
          </ProtectedRoute>
        } />

        {/* Doctor Routes */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
