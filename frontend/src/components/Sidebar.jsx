import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from './ConfirmDialog';

/**
 * Sidebar - Navigation with mobile responsiveness
 * Golden Rule #1: Consistency (all nav items follow same pattern)
 * Golden Rule #8: Reduce memory load (grouped sections with clear labels)
 * Heuristic #6: Recognition over recall (icons + text labels)
 */
export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const { confirm, ConfirmDialogComponent } = useConfirm();

  const penghuniNav = [
    { path: '/', icon: '📊', label: 'Dashboard', desc: 'Ringkasan informasi' },
    { path: '/booking-ruangan', icon: '🏠', label: 'Booking Ruangan', desc: 'Pesan ruangan bersama' },
    { path: '/booking-fasilitas', icon: '🧺', label: 'Booking Fasilitas', desc: 'Pesan fasilitas' },
    { path: '/laporan', icon: '🔧', label: 'Laporan Kerusakan', desc: 'Laporkan kerusakan' },
    { path: '/tagihan', icon: '💰', label: 'Tagihan', desc: 'Info pembayaran' },
    { path: '/uang-kas', icon: '💵', label: 'Uang Kas', desc: 'Kelola iuran kas' },
    { path: '/pengumuman', icon: '📢', label: 'Pengumuman', desc: 'Pengumuman terbaru' },
  ];

  const adminExtraNav = [
    { path: '/kelola-ruangan', icon: '🏢', label: 'Kelola Ruangan', desc: 'Manajemen ruangan' },
    { path: '/kelola-fasilitas', icon: '⚙️', label: 'Kelola Fasilitas', desc: 'Manajemen fasilitas' },
    { path: '/kelola-penghuni', icon: '👥', label: 'Kelola Penghuni', desc: 'Data penghuni' },
  ];

  const navItems = penghuniNav;

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      onToggle?.();
    }
  };

  const handleLogout = async () => {
    if (window.innerWidth <= 768) onToggle?.();
    const ok = await confirm({
      title: 'Keluar dari Akun?',
      message: 'Anda yakin ingin keluar (logout) dari portal KBM?',
      confirmText: 'Ya, Keluar',
      variant: 'danger'
    });
    if (ok) {
      logout();
    }
  };

  return (
    <>
      {ConfirmDialogComponent}
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} aria-hidden="true" />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Menu navigasi utama">
        <div className="sidebar-header">
          <div className="sidebar-logo" aria-hidden="true">K</div>
          <div className="sidebar-title">
            <h1>KBM</h1>
            <span>Kos Bu Mary</span>
          </div>
          {/* Mobile close button */}
          <button className="sidebar-close-btn" onClick={onToggle} aria-label="Tutup menu">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Menu navigasi">
          <div className="nav-section">
            <div className="nav-section-title" id="nav-main">Menu Utama</div>
            <ul role="list" aria-labelledby="nav-main" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navItems.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={handleNavClick}
                    title={item.desc}
                    aria-label={item.label}
                  >
                    <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {isAdmin && (
            <div className="nav-section">
              <div className="nav-section-title" id="nav-admin">Manajemen</div>
              <ul role="list" aria-labelledby="nav-admin" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {adminExtraNav.map(item => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                      onClick={handleNavClick}
                      title={item.desc}
                      aria-label={item.label}
                    >
                      <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="nav-section">
            <div className="nav-section-title" id="nav-account">Akun</div>
            <ul role="list" aria-labelledby="nav-account" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>
                <NavLink
                  to="/profil"
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                  aria-label="Profil saya"
                >
                  <span className="nav-icon" aria-hidden="true">👤</span>
                  <span>Profil</span>
                </NavLink>
              </li>
              <li>
                <button
                  className="nav-item nav-item-btn"
                  onClick={handleLogout}
                  aria-label="Keluar dari akun"
                >
                  <span className="nav-icon" aria-hidden="true">🚪</span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" aria-label={`Akun: ${user?.nama}`}>
            <div className="sidebar-avatar" aria-hidden="true">
              {user?.nama?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.nama}</div>
              <div className="sidebar-user-role">
                {user?.role === 'admin' ? '🔑 Admin' : '🏠 Penghuni'}
                {user?.no_kamar && user.no_kamar !== '-' ? ` • ${user.no_kamar}` : ''}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
