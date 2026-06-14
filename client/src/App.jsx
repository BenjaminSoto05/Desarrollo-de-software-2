import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SolicitudesPage from './pages/SolicitudesPage';
import CreateSolicitudPage from './pages/CreateSolicitudPage';
import SolicitudDetailPage from './pages/SolicitudDetailPage';
import MisSolicitudesPage from './pages/MisSolicitudesPage';

function AppLayout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
      <Navbar />
      <main id="main-content">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Landing Page — Página pública principal (igual que Django index) */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
          } />
          <Route path="/solicitudes" element={
            <ProtectedRoute><AppLayout><SolicitudesPage /></AppLayout></ProtectedRoute>
          } />
          <Route path="/solicitudes/nueva" element={
            <ProtectedRoute roles={['ADULTO_MAYOR', 'TUTOR']}><AppLayout><CreateSolicitudPage /></AppLayout></ProtectedRoute>
          } />
          <Route path="/solicitudes/:id" element={
            <ProtectedRoute><AppLayout><SolicitudDetailPage /></AppLayout></ProtectedRoute>
          } />
          <Route path="/mis-solicitudes" element={
            <ProtectedRoute><AppLayout><MisSolicitudesPage /></AppLayout></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
