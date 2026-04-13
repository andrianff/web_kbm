import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LaporanKerusakan() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  
  const [laporan, setLaporan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ judul: '', deskripsi: '', lokasi: '', prioritas: 'sedang' });
  const [adminForm, setAdminForm] = useState({ status: '', tanggapan_admin: '' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { 
      const res = await api.get('/laporan'); 
      setLaporan(res.data); 
    } catch (err) { 
      toast.error('Gagal memuat daftar laporan kerusakan'); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.deskripsi) {
      toast.warning('Judul dan deskripsi laporan wajib diisi');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/laporan', form);
      setShowModal(false);
      setForm({ judul: '', deskripsi: '', lokasi: '', prioritas: 'sedang' });
      toast.success('Laporan berhasil dikirim!');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal mengirim laporan'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminUpdate = async () => {
    setSubmitting(true);
    try {
      await api.put(`/laporan/${selected.id}`, adminForm);
      setShowDetailModal(false);
      toast.success('Status laporan berhasil diperbarui');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal memperbarui laporan'); 
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat laporan kerusakan..." />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>🔧 Laporan Kerusakan</h2>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} aria-label="Buat Laporan Baru">
            + Buat Laporan
          </button>
        )}
      </div>

      <div className="table-container" role="region" aria-label="Tabel Laporan Kerusakan">
        <div className="table-header">
          <span className="table-title">Daftar Laporan</span>
          <span className="badge badge-info">{laporan.length} laporan</span>
        </div>
        <div className="table-wrapper">
          {laporan.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">🔧</div>
              <p>Belum ada laporan kerusakan</p>
            </div>
          ) : (
            <table aria-label="Data Laporan Kerusakan">
              <thead>
                <tr>
                  {isAdmin && <th scope="col">Pelapor</th>}
                  <th scope="col">Judul</th>
                  <th scope="col">Lokasi</th>
                  <th scope="col">Prioritas</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tanggapan</th>
                  <th scope="col">Tanggal</th>
                  {isAdmin && <th scope="col">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {laporan.map(l => (
                  <tr key={l.id}>
                    {isAdmin && <td data-label="Pelapor" style={{color: 'var(--text-primary)'}}>{l.user?.nama}</td>}
                    <td data-label="Judul" style={{color: 'var(--text-primary)', fontWeight: 500}}>{l.judul}</td>
                    <td data-label="Lokasi">{l.lokasi || '-'}</td>
                    <td data-label="Prioritas"><StatusBadge status={l.prioritas} /></td>
                    <td data-label="Status"><StatusBadge status={l.status} /></td>
                    <td data-label="Tanggapan" style={{maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={l.tanggapan_admin}>
                      {l.tanggapan_admin || '-'}
                    </td>
                    <td data-label="Tanggal">{new Date(l.created_at).toLocaleDateString('id-ID')}</td>
                    {isAdmin && (
                      <td data-label="Aksi">
                        {l.status !== 'selesai' && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            aria-label={`Tanggapi laporan ${l.judul}`}
                            onClick={() => {
                              setSelected(l);
                              setAdminForm({ status: l.status, tanggapan_admin: l.tanggapan_admin || '' });
                              setShowDetailModal(true);
                            }}>
                            📝 Tanggapi
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Laporan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Laporan Kerusakan" size="large"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Mengirim...' : '📤 Kirim Laporan'}
            </button>
          </>
        }>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required">Judul Laporan</label>
            <input className="form-input" placeholder="Contoh: AC kamar mati / Kran bocor" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required aria-required="true" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Lokasi</label>
              <input className="form-input" placeholder="Contoh: Kamar A1, Dapur" value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label required">Prioritas</label>
              <select className="form-select" value={form.prioritas} onChange={e => setForm({...form, prioritas: e.target.value})} required aria-required="true">
                <option value="rendah">Rendah (Dapat ditunda)</option>
                <option value="sedang">Sedang (Perlu segera)</option>
                <option value="tinggi">Tinggi (Mengganggu aktivitas)</option>
                <option value="darurat">Darurat (Bahaya/Mendesak)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Deskripsi Detail</label>
            <textarea className="form-textarea" placeholder="Jelaskan detail kerusakan yang terjadi agar teknisi mudah memahami masalahnya..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} required aria-required="true" rows={4} />
          </div>
        </form>
      </Modal>

      {/* Admin Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Tanggapi Laporan"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleAdminUpdate} disabled={submitting}>
              {submitting ? '⏳ Menyimpan...' : '💾 Simpan Tanggapan'}
            </button>
          </>
        }>
        {selected && (
          <div>
            <div className="card" style={{ marginBottom: 20, padding: 16 }}>
              <p style={{marginBottom: 6, fontSize: 13}}><strong>Pelapor:</strong> {selected.user?.nama}</p>
              <p style={{marginBottom: 6, fontSize: 13}}><strong>Prioritas:</strong> <StatusBadge status={selected.prioritas} /></p>
              <p style={{marginBottom: 6, fontSize: 13}}><strong>Lokasi:</strong> {selected.lokasi || '-'}</p>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                <h4 style={{fontSize: 14, fontWeight: 600, color: 'var(--text-white)', marginBottom: 4}}>{selected.judul}</h4>
                <p style={{fontSize: 14, color: 'var(--text-secondary)'}}>{selected.deskripsi || '-'}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Update Status</label>
              <select className="form-select" value={adminForm.status} onChange={e => setAdminForm({...adminForm, status: e.target.value})}>
                <option value="dilaporkan">Dilaporkan (Menunggu)</option>
                <option value="diproses">Diproses (Sedang dikerjakan)</option>
                <option value="selesai">Selesai (Sudah diperbaiki)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tanggapan Admin / Catatan Teknisi</label>
              <textarea className="form-textarea" placeholder="Berikan informasi kepada penghuni terkait perbaikan..." value={adminForm.tanggapan_admin} onChange={e => setAdminForm({...adminForm, tanggapan_admin: e.target.value})} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
