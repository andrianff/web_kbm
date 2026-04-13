import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Layout - Main app shell with responsive sidebar management
 * Golden Rule #2: Seek universal usability (works on all screen sizes)
 */
export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Lewati ke konten utama
      </a>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="main-content">
        <Header onMenuToggle={toggleSidebar} />
        <main id="main-content" className="page-content" role="main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
