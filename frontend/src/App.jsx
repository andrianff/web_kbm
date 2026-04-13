import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookingRuangan from './pages/BookingRuangan';
import BookingFasilitas from './pages/BookingFasilitas';
import LaporanKerusakan from './pages/LaporanKerusakan';
import Tagihan from './pages/Tagihan';
import UangKas from './pages/UangKas';
import Pengumuman from './pages/Pengumuman';
import KelolaRuangan from './pages/KelolaRuangan';
import KelolaFasilitas from './pages/KelolaFasilitas';
import KelolaPenghuni from './pages/KelolaPenghuni';
import Profil from './pages/Profil';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/booking-ruangan" element={<ProtectedRoute><Layout><BookingRuangan /></Layout></ProtectedRoute>} />
      <Route path="/booking-fasilitas" element={<ProtectedRoute><Layout><BookingFasilitas /></Layout></ProtectedRoute>} />
      <Route path="/laporan" element={<ProtectedRoute><Layout><LaporanKerusakan /></Layout></ProtectedRoute>} />
      <Route path="/tagihan" element={<ProtectedRoute><Layout><Tagihan /></Layout></ProtectedRoute>} />
      <Route path="/uang-kas" element={<ProtectedRoute><Layout><UangKas /></Layout></ProtectedRoute>} />
      <Route path="/pengumuman" element={<ProtectedRoute><Layout><Pengumuman /></Layout></ProtectedRoute>} />
      <Route path="/profil" element={<ProtectedRoute><Layout><Profil /></Layout></ProtectedRoute>} />
      
      {/* Admin only */}
      <Route path="/kelola-ruangan" element={<ProtectedRoute adminOnly><Layout><KelolaRuangan /></Layout></ProtectedRoute>} />
      <Route path="/kelola-fasilitas" element={<ProtectedRoute adminOnly><Layout><KelolaFasilitas /></Layout></ProtectedRoute>} />
      <Route path="/kelola-penghuni" element={<ProtectedRoute adminOnly><Layout><KelolaPenghuni /></Layout></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
