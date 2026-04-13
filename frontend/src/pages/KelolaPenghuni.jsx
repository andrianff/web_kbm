import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KelolaPenghuni() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [penghuni, setPenghuni] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ username: '', nama: '', no_hp: '', email: '', no_kamar: '' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    if(isAdmin) fetchData(); 
  }, [isAdmin]);

  const fetchData = async () => {
    try { 
      const res = await api.get('/penghuni'); 
      setPenghuni(res.data); 
    } catch (err) { 
      toast.error('Gagal memuat data penghuni'); 
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.nama) {
      toast.warning('Nama penghuni wajib diisi');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.put(`/penghuni/${editing.id}`, form);
      toast.success('Data penghuni berhasil diperbarui');
      setShowModal(false);
      setEditing(null);
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal mengubah penghuni'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Hentikan Akses Penghuni',
      message: 'Penghuni yang dihapus tidak dapat login lagi dan semua datanya akan dipertahankan dengan status dihapus. Lanjutkan?',
      confirmText: 'Ya, Hapus Akses',
      variant: 'danger'
    });
    if (!ok) return;

    try { 
      await api.delete(`/penghuni/${id}`); 
      toast.success('Akses penghuni berhasil ditutup');
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menghapus penghuni'); 
    }
  };

  if (!isAdmin) return <div className="text-center text-danger mt-4" role="alert">Akses Ditolak</div>;
  if (loading) return <LoadingSpinner fullPage text="Memuat daftar penghuni..." />;

  const openEdit = (p) => {
    setEditing(p);
    setForm({ username: p.username, nama: p.nama, no_hp: p.no_hp || '', email: p.email || '', no_kamar: p.no_kamar || '' });
    setShowModal(true);
  };

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>👥 Kelola Penghuni</h2>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Daftar Penghuni Kos Terdaftar</span>
          <span className="badge badge-primary">{penghuni.length} Orang</span>
        </div>
        <div className="table-wrapper">
          {penghuni.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">👥</div>
              <p>Belum ada penghuni yang mendaftar</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Nama Lengkap</th>
                  <th>No. Kamar</th>
                  <th>Kontak HP</th>
                  <th>Email Aktif</th>
                  <th>Tanggal Bergabung</th>
                  <th>Aksi Admin</th>
                </tr>
              </thead>
              <tbody>
                {penghuni.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge badge-default">{p.username}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{p.nama}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{p.no_kamar || '-'}</td>
                    <td>{p.no_hp || '-'}</td>
                    <td>{p.email || '-'}</td>
                    <td>{new Date(p.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>🗑️ Kick</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Identitas Penghuni"
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" type="button" onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
          </>
        }>
        {editing && (
          <form onSubmit={handleUpdate} noValidate>
            <div className="form-group">
              <label className="form-label required">Username Login</label>
              <input className="form-input" value={form.username} readOnly disabled title="Username tidak bisa diganti di sistem" />
            </div>
            <div className="form-group">
              <label className="form-label required">Nama Lengkap KTP</label>
              <input className="form-input" placeholder="Misal: Ahmad S." value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">No. Kamar Dimiliki</label>
                <input className="form-input" placeholder="Contoh: A1" value={form.no_kamar} onChange={e => setForm({...form, no_kamar: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">No. Handphone (WA Aktif)</label>
                <input className="form-input" type="tel" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Komunikasi</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
