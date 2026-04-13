import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonCard count={6} />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Halo, {user?.nama} 👋</h2>
      </div>

      {isAdmin ? <AdminDashboard stats={stats} /> : <PenghuniDashboard stats={stats} />}
    </div>
  );
}

function AdminDashboard({ stats }) {
  return (
    <>
      {stats.pengumuman_terbaru?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <Link to="/pengumuman" style={{ textDecoration: 'none' }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-white)', fontSize: 16, fontWeight: 600 }}>📢 Pengumuman Terbaru</h3>
          </Link>
          <div className="pengumuman-list">
            {stats.pengumuman_terbaru.map(p => (
              <div key={p.id} className={`pengumuman-card ${p.is_pinned ? 'pinned' : ''}`}>
                <div className="pengumuman-meta">
                  <StatusBadge status={p.prioritas} />
                  {p.is_pinned && <span className="badge badge-primary">📌 Disematkan</span>}
                </div>
                <h3>{p.judul}</h3>
                <p className="content">{p.isi}</p>
                <p className="pengumuman-date">{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid bento">
        <Link to="/kelola-penghuni" className="stat-card purple wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon purple">👥</div>
          <div className="stat-info">
            <h3>{stats.total_penghuni || 0}</h3>
            <p>Total Penghuni</p>
          </div>
        </Link>
        <Link to="/kelola-ruangan" className="stat-card cyan wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon cyan">🏠</div>
          <div className="stat-info">
            <h3>{stats.total_ruangan || 0}</h3>
            <p>Total Ruangan</p>
          </div>
        </Link>
        <Link to="/booking-ruangan" className="stat-card orange" style={{ textDecoration: 'none' }}>
          <div className="stat-icon orange">📋</div>
          <div className="stat-info">
            <h3>{stats.booking_pending || 0}</h3>
            <p>Booking Menunggu</p>
          </div>
        </Link>
        <Link to="/laporan" className="stat-card red" style={{ textDecoration: 'none' }}>
          <div className="stat-icon red">🔧</div>
          <div className="stat-info">
            <h3>{stats.laporan_baru || 0}</h3>
            <p>Laporan Baru</p>
          </div>
        </Link>
        <Link to="/tagihan" className="stat-card green" style={{ textDecoration: 'none' }}>
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>{stats.tagihan_belum_bayar || 0}</h3>
            <p>Tagihan Belum Bayar</p>
          </div>
        </Link>
        <Link to="/uang-kas" className="stat-card blue" style={{ textDecoration: 'none' }}>
          <div className="stat-icon blue">💵</div>
          <div className="stat-info stat-money">
            <h3>Rp {(stats.saldo_kas?.saldo || 0).toLocaleString('id-ID')}</h3>
            <p>Saldo Kas</p>
          </div>
        </Link>
      </div>
    </>
  );
}

function PenghuniDashboard({ stats }) {
  return (
    <>
      {stats.pengumuman_terbaru?.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <Link to="/pengumuman" style={{ textDecoration: 'none' }}>
            <h3 style={{ marginBottom: 16, color: 'var(--text-white)', fontSize: 16, fontWeight: 600 }}>📢 Pengumuman Terbaru</h3>
          </Link>
          <div className="pengumuman-list">
            {stats.pengumuman_terbaru.map(p => (
              <div key={p.id} className={`pengumuman-card ${p.is_pinned ? 'pinned' : ''}`}>
                <div className="pengumuman-meta">
                  <StatusBadge status={p.prioritas} />
                  {p.is_pinned && <span className="badge badge-primary">📌 Disematkan</span>}
                </div>
                <h3>{p.judul}</h3>
                <p className="content">{p.isi}</p>
                <p className="pengumuman-date">{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid bento">
        <Link to="/booking-ruangan" className="stat-card purple wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon purple">📅</div>
          <div className="stat-info">
            <h3>{stats.booking_aktif || 0}</h3>
            <p>Booking Aktif</p>
          </div>
        </Link>
        <Link to="/tagihan" className="stat-card red wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon red">💰</div>
          <div className="stat-info">
            <h3>{stats.tagihan_pending || 0}</h3>
            <p>Tagihan Belum Bayar</p>
          </div>
        </Link>
        <Link to="/tagihan" className="stat-card orange wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon orange">💵</div>
          <div className="stat-info stat-money">
            <h3>Rp {(stats.total_tagihan || 0).toLocaleString('id-ID')}</h3>
            <p>Total Tagihan</p>
          </div>
        </Link>
        <Link to="/laporan" className="stat-card cyan wide" style={{ textDecoration: 'none' }}>
          <div className="stat-icon cyan">🔧</div>
          <div className="stat-info">
            <h3>{stats.laporan_aktif || 0}</h3>
            <p>Laporan Aktif</p>
          </div>
        </Link>
        <Link to="/uang-kas" className="stat-card green full" style={{ textDecoration: 'none' }}>
          <div className="stat-icon green">💵</div>
          <div className="stat-info stat-money">
            <h3>Rp {(stats.iuran_belum_bayar || 0).toLocaleString('id-ID')}</h3>
            <p>Total Tunggakan Iuran Kas Bersama</p>
          </div>
        </Link>
      </div>
    </>
  );
}
