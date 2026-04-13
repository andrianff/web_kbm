import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function KelolaFasilitas() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [fasilitas, setFasilitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', jumlah_tersedia: '', status: 'tersedia' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { 
    if(isAdmin) fetchData(); 
  }, [isAdmin]);

  const fetchData = async () => {
    try { 
      const res = await api.get('/fasilitas'); 
      setFasilitas(res.data); 
    } catch (err) { 
      toast.error('Gagal memuat manajemen fasilitas'); 
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nama || !form.jumlah_tersedia) {
      toast.warning('Nama fasilitas dan jumlah wajib diisi');
      return;
    }
    
    setSubmitting(true);
    const data = { ...form, jumlah_tersedia: parseInt(form.jumlah_tersedia, 10) };
    try {
      if (editing) {
        await api.put(`/fasilitas/${editing.id}`, data);
        toast.success('Pembaruan fasilitas berhasil disimpan');
      } else {
        await api.post('/fasilitas', data);
        toast.success('Fasilitas baru berhasil ditambahkan');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ nama: '', deskripsi: '', jumlah_tersedia: '', status: 'tersedia' });
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menyimpan fasilitas'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Hapus Inventaris Fasilitas?',
      message: 'Menghapus fasilitas akan menghilangkan data ini. Anda yakin?',
      confirmText: 'Ya, Hapus Data',
      variant: 'danger'
    });
    if (!ok) return;

    try { 
      await api.delete(`/fasilitas/${id}`); 
      toast.success('Data fasilitas dihapus');
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menghapus fasilitas'); 
    }
  };

  if (!isAdmin) return <div className="text-center text-danger mt-4" role="alert">Akses Ditolak</div>;
  if (loading) return <LoadingSpinner fullPage text="Memuat data persediaan..." />;

  const openEdit = (f) => {
    setEditing(f);
    setForm({ nama: f.nama, deskripsi: f.deskripsi, jumlah_tersedia: f.jumlah_tersedia.toString(), status: f.status });
    setShowModal(true);
  };

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>⚙️ Kelola Fasilitas</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => { 
            setEditing(null); 
            setForm({ nama: '', deskripsi: '', jumlah_tersedia: '', status: 'tersedia' }); 
            setShowModal(true); 
          }}
        >
          + Tambah Fasilitas
        </button>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Daftar Inventaris Fasilitas Kos</span>
        </div>
        <div className="table-wrapper">
          {fasilitas.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">⚙️</div>
              <p>Belum ada data fasilitas</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama Fasilitas</th>
                  <th>Total Tersedia (Unit)</th>
                  <th>Deskripsi Alat</th>
                  <th>Status Kondisi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {fasilitas.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.nama}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-info)' }}>{f.jumlah_tersedia} Unit</td>
                    <td>{f.deskripsi || '-'}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary" onClick={() => openEdit(f)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f.id)}>🗑️ Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Informasi Fasilitas' : 'Tambah Fasilitas Baru'}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" type="button" onClick={handleSave} disabled={submitting}>
              {submitting ? 'Menyimpan...' : '💾 Simpan Fasilitas'}
            </button>
          </>
        }>
        <form onSubmit={handleSave} noValidate>
          <div className="form-group">
            <label className="form-label required">Nama Fasilitas/Barang</label>
            <input className="form-input" placeholder="Misal: Mesin Cuci 1" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required autoFocus />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Kuantitas Unit / Barang</label>
              <input className="form-input" type="number" min="0" placeholder="1" value={form.jumlah_tersedia} onChange={e => setForm({...form, jumlah_tersedia: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label required">Kondisi / Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="tersedia">Baik & Tersedia</option>
                <option value="perbaikan">Dalam Perbaikan (Rusak)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Catatan Tambahan Barang</label>
            <textarea className="form-textarea" placeholder="Detail, merk, dll..." value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
