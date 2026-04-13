import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Pengumuman() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ judul: '', isi: '', prioritas: 'biasa', is_pinned: false });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { 
      const res = await api.get('/pengumuman'); 
      setList(res.data); 
    } catch (err) { 
      toast.error('Gagal memuat papan pengumuman'); 
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.judul || !form.isi) {
      toast.warning('Judul dan isi pengumuman wajib diisi');
      return;
    }
    
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/pengumuman/${editing.id}`, form);
        toast.success('Pengumuman berhasil diperbarui');
      } else {
        await api.post('/pengumuman', form);
        toast.success('Pengumuman berhasil diterbitkan');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ judul: '', isi: '', prioritas: 'biasa', is_pinned: false });
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal menyimpan pengumuman'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Hapus Pengumuman',
      message: 'Apakah Anda yakin ingin menghapus pengumuman ini secara permanen?',
      confirmText: 'Ya, Hapus',
      variant: 'danger'
    });
    if (!ok) return;
    
    try { 
      await api.delete(`/pengumuman/${id}`); 
      toast.success('Pengumuman dihapus');
      fetchData(); 
    } catch (err) { 
      toast.error('Gagal menghapus pengumuman'); 
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ judul: p.judul, isi: p.isi, prioritas: p.prioritas, is_pinned: p.is_pinned });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat papan pengumuman..." />;

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>📢 Papan Pengumuman</h2>
        {isAdmin && (
          <button 
            className="btn btn-primary" 
            onClick={() => { 
              setEditing(null); 
              setForm({ judul: '', isi: '', prioritas: 'biasa', is_pinned: false }); 
              setShowModal(true); 
            }}
          >
            + Buat Pengumuman
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card text-center" style={{padding: 48, marginTop: 16}}>
          <div style={{fontSize: 56, marginBottom: 16, opacity: 0.3}}>📢</div>
          <h3 style={{fontSize: 18, color: 'var(--text-white)', marginBottom: 8}}>Belum Ada Pengumuman</h3>
          <p className="text-muted">Papan pengumuman saat ini kosong.</p>
        </div>
      ) : (
        <div className="pengumuman-list" role="feed" aria-busy={loading}>
          {list.map(p => (
            <article key={p.id} className={`pengumuman-card card ${p.is_pinned ? 'pinned' : ''} ${p.prioritas}`} role="article" style={{ marginBottom: 16, borderLeft: p.is_pinned ? '4px solid var(--color-primary)' : '' }}>
              <div className="pengumuman-meta" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <StatusBadge status={p.prioritas} />
                {p.is_pinned && <span className="badge badge-primary" title="Pengumuman ini selalu muncul di atas">📌 Terset</span>}
                <span className="pengumuman-date" style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto' }}>
                  {new Date(p.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-white)', marginBottom: 8 }}>{p.judul}</h3>
              <p className="content" style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.isi}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                {p.admin && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                     <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient-secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>
                       {p.admin.nama?.charAt(0).toUpperCase()}
                     </div>
                     <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Diterbitkan oleh: <strong style={{ color: 'var(--text-primary)' }}>{p.admin.nama}</strong></span>
                   </div>
                )}
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.judul}`}>✏️ Edit</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(p.id)} aria-label={`Hapus ${p.judul}`} style={{ color: '#f87171' }}>🗑️ Hapus</button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {isAdmin && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title={editing ? 'Edit Pengumuman' : 'Tulis Pengumuman Baru'}
          size="large"
          footer={
            <>
              <button className="btn btn-ghost" type="button" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" type="button" onClick={handleSave} disabled={submitting}>
                {submitting ? '⏳ Menyimpan...' : (editing ? '💾 Simpan Perubahan' : '📢 Terbitkan')}
              </button>
            </>
          }
        >
          <form onSubmit={handleSave} noValidate>
            <div className="form-group">
              <label className="form-label required">Judul Utama</label>
              <input className="form-input" placeholder="Masukkan judul yang jelas" value={form.judul} onChange={e => setForm({...form, judul: e.target.value})} required autoFocus />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Tingkat Prioritas</label>
                <select className="form-select" value={form.prioritas} onChange={e => setForm({...form, prioritas: e.target.value})}>
                  <option value="biasa">Biasa (Informasi Umum)</option>
                  <option value="penting">Penting (Wajib Baca)</option>
                  <option value="darurat">Darurat (Segera & Mendesak)</option>
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: 'auto', marginBottom: 2 }}>
                  <input type="checkbox" checked={form.is_pinned} onChange={e => setForm({...form, is_pinned: e.target.checked})} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-white)' }}>📌 Sematkan ke Atas</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>Meskipun ada pengumuman baru</span>
                  </div>
                </label>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label required">Isi Pengumuman</label>
              <textarea className="form-textarea" style={{ minHeight: 160 }} placeholder="Tuliskan pesan Anda secara lengkap di sini..." value={form.isi} onChange={e => setForm({...form, isi: e.target.value})} required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
