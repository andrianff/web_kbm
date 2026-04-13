import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Breadcrumb mapping for each route
 * Heuristic #6: Recognition rather than recall - users know where they are
 * Golden Rule #8: Reduce short-term memory load
 */
const pageConfig = {
  '/': { title: 'Dashboard', breadcrumb: ['Dashboard'], icon: '📊' },
  '/booking-ruangan': { title: 'Booking Ruangan', breadcrumb: ['Menu', 'Booking Ruangan'], icon: '🏠' },
  '/booking-fasilitas': { title: 'Booking Fasilitas', breadcrumb: ['Menu', 'Booking Fasilitas'], icon: '🧺' },
  '/laporan': { title: 'Laporan Kerusakan', breadcrumb: ['Menu', 'Laporan Kerusakan'], icon: '🔧' },
  '/tagihan': { title: 'Tagihan', breadcrumb: ['Menu', 'Tagihan'], icon: '💰' },
  '/uang-kas': { title: 'Uang Kas', breadcrumb: ['Menu', 'Uang Kas'], icon: '💵' },
  '/pengumuman': { title: 'Pengumuman', breadcrumb: ['Menu', 'Pengumuman'], icon: '📢' },
  '/kelola-ruangan': { title: 'Kelola Ruangan', breadcrumb: ['Manajemen', 'Kelola Ruangan'], icon: '🏢' },
  '/kelola-fasilitas': { title: 'Kelola Fasilitas', breadcrumb: ['Manajemen', 'Kelola Fasilitas'], icon: '⚙️' },
  '/kelola-penghuni': { title: 'Kelola Penghuni', breadcrumb: ['Manajemen', 'Kelola Penghuni'], icon: '👥' },
  '/profil': { title: 'Profil Saya', breadcrumb: ['Akun', 'Profil'], icon: '👤' },
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const config = pageConfig[location.pathname] || { title: 'KBM', breadcrumb: ['KBM'], icon: '🏠' };

  return (
    <header className="header" role="banner">
      {/* Mobile hamburger button */}
      <div className="header-left">
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          aria-label="Buka menu navigasi"
          title="Menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className="header-info">
          <h1 className="header-title">{config.title}</h1>
          {/* Breadcrumb trail */}
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><span aria-hidden="true">🏠</span> KBM</li>
              {config.breadcrumb.map((item, i) => (
                <li key={i}>
                  <span className="breadcrumb-sep" aria-hidden="true">/</span>
                  {item}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="theme-toggle btn-icon" 
          onClick={toggleTheme} 
          aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <span className="header-date" aria-label="Tanggal hari ini">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
        <div className="header-user-badge" aria-label={`Login sebagai ${user?.nama}`}>
          <span className="header-user-avatar" aria-hidden="true">
            {user?.nama?.charAt(0)?.toUpperCase()}
          </span>
          <span className="header-user-name">{user?.nama?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  );
}
