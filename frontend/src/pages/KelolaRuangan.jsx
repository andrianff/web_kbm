import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KelolaRuangan() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [ruangan, setRuangan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', kapasitas: '', status: 'tersedia' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    if(isAdmin) fetchData(); 
  }, [isAdmin]);

  const fetchData = async () => {
    try { 
      const res = await api.get('/ruangan'); 
      setRuangan(res.data); 
    } catch (err) { 
      toast.error('Gagal memuat data ruangan'); 
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.kapasitas) {
      toast.warning('Nama ruangan dan kapasitas harus diisi');
      return;
    }
    
    setSubmitting(true);
    const data = { ...form, kapasitas: parseInt(form.kapasitas, 10) };
    try {
      if (editing) {
        await api.put(`/ruangan/${editing.id}`, data);
        toast.success('Informasi ruangan berhasil diperbarui');
      } else {
        await api.post('/ruangan', data);
        toast.success('Ruangan baru berhasil ditambahkan');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ nama: '', deskripsi: '', kapasitas: '', status: 'tersedia' });
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menyimpan ruangan'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Hapus Ruangan',
      message: 'Anda yakin ingin menghapus ruangan ini? Aksi ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      variant: 'danger'
    });
    if (!ok) return;
    
    try { 
      await api.delete(`/ruangan/${id}`); 
      toast.success('Ruangan berhasil dihapus');
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menghapus ruangan'); 
    }
  };

  const openEdit = (r) => {
    setEditing(r);
    setForm({ nama: r.nama, deskripsi: r.deskripsi, kapasitas: r.kapasitas.toString(), status: r.status });
    setShowModal(true);
  };

  if (!isAdmin) return <div className="text-center text-danger mt-4" role="alert">Akses Ditolak</div>;
  if (loading) return <LoadingSpinner fullPage text="Memuat daftar ruangan..." />;

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>🏢 Kelola Ruangan</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => { 
            setEditing(null); 
            setForm({ nama: '', deskripsi: '', kapasitas: '', status: 'tersedia' }); 
            setShowModal(true); 
          }}
        >
          + Tambah Ruangan
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Daftar Ruangan</span>
        </div>
        <div className="table-wrapper">
          {ruangan.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">🏢</div>
              <p>Belum ada ruangan yang didaftarkan</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama Ruangan</th>
                  <th>Kapasitas (Orang)</th>
                  <th>Deskripsi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ruangan.map(r => (
                  <tr key={r.id}>
                    <td data-label="Nama" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.nama}</td>
                    <td data-label="Kapasitas">{r.kapasitas}</td>
                    <td data-label="Deskripsi">{r.deskripsi || '-'}</td>
                    <td data-label="Status"><StatusBadge status={r.status} /></td>
                    <td data-label="Aksi">
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => openEdit(r)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id)}>🗑️ Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Ruangan' : 'Tambah Ruangan'}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '💾 Simpan'}
            </button>
          </>
        }>
        <form onSubmit={handleSave} noValidate>
          <div className="form-group">
            <label className="form-label required">Nama Ruangan</label>
            <input className="form-input" placeholder="Contoh: Ruang Belajar, Dapur" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Kapasitas Maksimal (Orang)</label>
              <input className="form-input" type="number" min="1" value={form.kapasitas} onChange={e => setForm({...form, kapasitas: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label required">Status Perbaikan/Ketersediaan</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="tersedia">Tersedia (Bisa dibooking)</option>
                <option value="perbaikan">Perbaikan (Tidak bisa dibooking)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi Fasilitas di Ruangan</label>
            <textarea className="form-textarea" placeholder="Informasi detail ruangan tersebut..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
