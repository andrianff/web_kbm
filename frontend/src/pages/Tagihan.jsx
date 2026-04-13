import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Tagihan() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [tagihan, setTagihan] = useState([]);
  const [penghuni, setPenghuni] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    user_id: '', jumlah: '', bulan: '', jenis: 'sewa', jatuh_tempo: '', keterangan: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/tagihan');
      setTagihan(res.data);
      if (isAdmin) {
        const pRes = await api.get('/penghuni');
        setPenghuni(pRes.data);
      }
    } catch (err) { 
      toast.error('Gagal memuat data tagihan'); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.jumlah || !form.bulan) {
      toast.warning('Tolong isi Penghuni, Bulan, dan Jumlah nominal.');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/tagihan', {
        ...form, user_id: parseInt(form.user_id), jumlah: parseFloat(form.jumlah)
      });
      setShowModal(false);
      setForm({ user_id: '', jumlah: '', bulan: '', jenis: 'sewa', jatuh_tempo: '', keterangan: '' });
      toast.success('Tagihan berhasil dibuat');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal membuat tagihan'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleBayar = async (id) => {
    // We could use a custom modal for this later, but for now a simple native prompt or just confirming is structurally okay.
    // Let's use standard confirm dialog and default to Transfer.
    const ok = await confirm({
      title: 'Konfirmasi Pembayaran',
      message: 'Anda akan mengkonfirmasi pembayaran tagihan ini. Lanjutkan?',
      confirmText: 'Ya, Bayar Sekarang',
      variant: 'info'
    });
    
    if (!ok) return;
    
    try {
      await api.put(`/tagihan/${id}/bayar`, { metode_pembayaran: 'transfer' });
      toast.success('Pemberitahuan pembayaran berhasil dikirim. Menunggu verifikasi admin.');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal memproses pembayaran'); 
    }
  };

  const handleVerifikasi = async (id, status) => {
    const ok = await confirm({
      title: 'Verifikasi Pembayaran',
      message: 'Anda menyetujui bahwa pembayaran telah diterima. Lanjutkan?',
      confirmText: 'Verifikasi Lunas',
      variant: 'success'
    });
    if (!ok) return;
    
    try {
      await api.put(`/tagihan/${id}/verifikasi`, { status });
      toast.success('Tagihan telah diverifikasi lunas');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal melakukan verifikasi'); 
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat informasi tagihan..." />;

  // Calculate stats
  const totalBelumBayar = tagihan.filter(t => t.status === 'belum_bayar').reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}
      
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h2>💰 Tagihan {isAdmin ? 'Penghuni' : 'Saya'}</h2>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Buat Tagihan
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Total Belum Dibayar</h4>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#f87171' }}>
          Rp {totalBelumBayar.toLocaleString('id-ID')}
        </div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <span className="table-title">Daftar Tagihan</span>
          <span className="badge badge-default">{tagihan.length} tagihan</span>
        </div>
        <div className="table-wrapper">
          {tagihan.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">💰</div>
              <p>Tidak ada riwayat tagihan</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {isAdmin && <th>Penghuni</th>}
                  <th>Bulan</th>
                  <th>Jenis</th>
                  <th>Jumlah</th>
                  <th>Jatuh Tempo</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tagihan.map(t => (
                  <tr key={t.id}>
                    {isAdmin && <td style={{ color: 'var(--text-primary)' }}>{t.user?.nama}</td>}
                    <td>{t.bulan}</td>
                    <td style={{ textTransform: 'capitalize', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {t.jenis}
                      {t.keterangan && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.keterangan}</div>}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Rp {parseFloat(t.jumlah).toLocaleString('id-ID')}
                    </td>
                    <td>{t.jatuh_tempo || '-'}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div className="flex gap-2">
                        {!isAdmin && t.status === 'belum_bayar' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleBayar(t.id)}>
                            💳 Bayar
                          </button>
                        )}
                        {isAdmin && t.status === 'lunas' && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleVerifikasi(t.id, 'lunas')}>
                            ✓ Verifikasi
                          </button>
                        )}
                        {isAdmin && t.status === 'belum_bayar' && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Menunggu</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isAdmin && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title="Buat Tagihan Baru"
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                {submitting ? '⏳ Membuat...' : 'Membuat Tagihan'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreate} noValidate>
            <div className="form-group">
              <label className="form-label required">Penghuni</label>
              <select className="form-select" value={form.user_id}
                onChange={e => setForm({ ...form, user_id: e.target.value })} required>
                <option value="">-- Pilih Penghuni --</option>
                {penghuni.map(p => (
                  <option key={p.id} value={p.id}>{p.nama} ({p.no_kamar || 'Tidak ada kamar'})</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Jenis Tagihan</label>
                <select className="form-select" value={form.jenis}
                  onChange={e => setForm({ ...form, jenis: e.target.value })}>
                  <option value="sewa">Sewa Kamar</option>
                  <option value="listrik">Listrik & Air</option>
                  <option value="denda">Denda Keterlambatan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label required">Bulan Penagihan</label>
                <input className="form-input" type="month" value={form.bulan}
                  onChange={e => setForm({ ...form, bulan: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Jumlah Total (Rp)</label>
                <input className="form-input" type="number" min="0" placeholder="Contoh: 500000" value={form.jumlah}
                  onChange={e => setForm({ ...form, jumlah: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Jatuh Tempo (Opsional)</label>
                <input className="form-input" type="date" value={form.jatuh_tempo}
                  onChange={e => setForm({ ...form, jatuh_tempo: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan Tambahan</label>
              <input className="form-input" placeholder="Tulis rincian jika perlu (opsional)" value={form.keterangan}
                onChange={e => setForm({ ...form, keterangan: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
