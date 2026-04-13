import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner, { SkeletonCard } from '../components/LoadingSpinner';

export default function UangKas() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [saldo, setSaldo] = useState({ total_pemasukan: 0, total_pengeluaran: 0, saldo: 0 });
  const [transaksi, setTransaksi] = useState([]);
  const [iuran, setIuran] = useState([]);
  const [tab, setTab] = useState('iuran');
  
  const [showTrxModal, setShowTrxModal] = useState(false);
  const [showIuranModal, setShowIuranModal] = useState(false);
  const [trxForm, setTrxForm] = useState({ tipe: 'pengeluaran', jumlah: '', keterangan: '', kategori: 'belanja', tanggal: '' });
  const [iuranForm, setIuranForm] = useState({ jumlah: '', bulan: '' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sRes, tRes, iRes] = await Promise.all([
        api.get('/kas/saldo'), api.get('/kas'), api.get('/kas/iuran')
      ]);
      setSaldo(sRes.data);
      setTransaksi(tRes.data);
      setIuran(iRes.data);
    } catch (err) { 
      toast.error('Gagal memuat catatan kas'); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrx = async (e) => {
    e.preventDefault();
    if (!trxForm.jumlah || !trxForm.tanggal) {
      toast.warning('Jumlah dan tanggal wajib diisi');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/kas/transaksi', { ...trxForm, jumlah: parseFloat(trxForm.jumlah) });
      setShowTrxModal(false);
      setTrxForm({ tipe: 'pengeluaran', jumlah: '', keterangan: '', kategori: 'belanja', tanggal: '' });
      toast.success('Transaksi kas berhasil dicatat');
      fetchAll();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal mencatat transaksi'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIuran = async (e) => {
    e.preventDefault();
    if (!iuranForm.jumlah || !iuranForm.bulan) {
      toast.warning('Jumlah tagihan dan bulan wajib diisi');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/kas/iuran', { ...iuranForm, jumlah: parseFloat(iuranForm.jumlah) });
      setShowIuranModal(false);
      setIuranForm({ jumlah: '', bulan: '' });
      toast.success(`Tagihan iuran bulan ${iuranForm.bulan} berhasil diterbitkan (kepada semua penghuni).`);
      fetchAll();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal membuat tagihan iuran'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleBayarIuran = async (id) => {
    const ok = await confirm({
      title: 'Konfirmasi Bayar Iuran',
      message: 'Anda menyatakan telah membayar iuran ini. Lanjutkan mengirim konfirmasi ke Admin?',
      confirmText: 'Ya, Saya Sudah Bayar',
      variant: 'info'
    });
    if (!ok) return;
    
    try { 
      await api.put(`/kas/iuran/${id}/bayar`, {}); 
      toast.success('Pemberitahuan pembayaran telah dikirim ke Admin');
      fetchAll(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal konfirmasi pembayaran'); 
    }
  };

  const handleVerifikasiIuran = async (id) => {
    const ok = await confirm({
      title: 'Verifikasi Pembayaran Iuran',
      message: 'Verifikasi bahwa penghuni telah membayar iuran. Lanjutkan?',
      confirmText: 'Verifikasi Lunas',
      variant: 'success'
    });
    if (!ok) return;
    
    try { 
      await api.put(`/kas/iuran/${id}/verifikasi`, {}); 
      toast.success('Iuran berhasil diverifikasi');
      fetchAll(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal memverifikasi pembayaran'); 
    }
  };

  if (loading) return <SkeletonCard count={3} />;

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>💵 Uang Kas Bersama</h2>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <button className="btn btn-primary" onClick={() => setShowIuranModal(true)}>+ Buat Iuran Bulanan</button>
            <button className="btn btn-ghost" onClick={() => setShowTrxModal(true)}>+ Catat Transaksi</button>
          </div>
        )}
      </div>

      <div className="stats-grid kas-summary">
        <div className="stat-card green" style={{ display: 'block', flexDirection: 'column' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>Total Pemasukan</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-white)' }}>
            Rp {saldo.total_pemasukan?.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="stat-card red" style={{ display: 'block', flexDirection: 'column' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>Total Pengeluaran</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-white)' }}>
            Rp {saldo.total_pengeluaran?.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="stat-card blue" style={{ display: 'block', flexDirection: 'column' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>Saldo Saat Ini</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#60a5fa' }}>
            Rp {saldo.saldo?.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }} role="tablist">
        <button 
          role="tab"
          aria-selected={tab === 'iuran'}
          className={`btn ${tab === 'iuran' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setTab('iuran')}
        >
          Iuran Bulanan Penghuni
        </button>
        <button 
          role="tab"
          aria-selected={tab === 'transaksi'}
          className={`btn ${tab === 'transaksi' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => setTab('transaksi')}
        >
          Riwayat Transaksi Kas
        </button>
      </div>

      {tab === 'iuran' && (
        <div className="table-container" role="tabpanel">
          <div className="table-header">
            <span className="table-title">Daftar Tagihan Iuran</span>
          </div>
          <div className="table-wrapper">
            {iuran.length === 0 ? (
              <div className="table-empty">
                <div className="empty-icon">💵</div>
                <p>Belum ada penagihan iuran kas</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {isAdmin && <th>Penghuni</th>}
                    <th>Bulan</th>
                    <th>Jumlah</th>
                    <th>Status</th>
                    <th>Tgl Bayar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {iuran.map(i => (
                    <tr key={i.id}>
                      {isAdmin && <td style={{color:'var(--text-primary)'}}>{i.user?.nama}</td>}
                      <td>{i.bulan}</td>
                      <td style={{fontWeight:600, color:'var(--text-primary)'}}>Rp {parseFloat(i.jumlah).toLocaleString('id-ID')}</td>
                      <td><StatusBadge status={i.status} /></td>
                      <td>{i.tanggal_bayar || '-'}</td>
                      <td>
                        {!isAdmin && i.status === 'belum_bayar' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleBayarIuran(i.id)}>💳 Konfirmasi Bayar</button>
                        )}
                        {isAdmin && i.status === 'belum_bayar' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleVerifikasiIuran(i.id)}>✓ Verifikasi</button>
                        )}
                        {!isAdmin && i.status === 'lunas' && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'transaksi' && (
        <div className="table-container" role="tabpanel">
          <div className="table-header">
            <span className="table-title">Buku Kas</span>
          </div>
          <div className="table-wrapper">
            {transaksi.length === 0 ? (
              <div className="table-empty">
                <div className="empty-icon">📊</div>
                <p>Belum ada catatan transaksi</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Tipe Transaksi</th>
                    <th>Kategori</th>
                    <th>Jumlah</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksi.map(t => (
                    <tr key={t.id}>
                      <td>{t.tanggal}</td>
                      <td>
                        <span className={`badge ${t.tipe === 'pemasukan' ? 'badge-success' : 'badge-danger'}`}>
                          {t.tipe === 'pemasukan' ? '↑ Masukan' : '↓ Pengeluaran'}
                        </span>
                      </td>
                      <td style={{textTransform:'capitalize'}}>{t.kategori?.replace('_', ' ') || '-'}</td>
                      <td style={{fontWeight:600, color: t.tipe === 'pemasukan' ? '#34d399' : '#f87171'}}>
                        Rp {parseFloat(t.jumlah).toLocaleString('id-ID')}
                      </td>
                      <td>{t.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modals for Admins */}
      {isAdmin && (
        <>
          <Modal isOpen={showTrxModal} onClose={() => setShowTrxModal(false)} title="Catat Transaksi Kas"
            footer={
              <>
                <button className="btn btn-ghost" type="button" onClick={() => setShowTrxModal(false)}>Batal</button>
                <button className="btn btn-primary" type="button" onClick={handleCreateTrx} disabled={submitting}>
                  {submitting ? 'Menyimpan...' : '💾 Simpan Transaksi'}
                </button>
              </>
            }>
            <form onSubmit={handleCreateTrx} noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Tipe Jurnal</label>
                  <select className="form-select" value={trxForm.tipe} onChange={e => setTrxForm({...trxForm, tipe: e.target.value})}>
                    <option value="pemasukan">Uang Masuk (+)</option>
                    <option value="pengeluaran">Uang Keluar (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Kategori</label>
                  <select className="form-select" value={trxForm.kategori} onChange={e => setTrxForm({...trxForm, kategori: e.target.value})}>
                    <option value="iuran_bulanan">Iuran Bulanan / Wajib</option>
                    <option value="belanja">Belanja / Kebutuhan Bersama</option>
                    <option value="kegiatan">Kegiatan / Makan Bersama</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Jumlah Nominal (Rp)</label>
                  <input className="form-input" type="number" min="0" placeholder="Contoh: 50000" value={trxForm.jumlah} onChange={e => setTrxForm({...trxForm, jumlah: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label required">Tanggal Transaksi</label>
                  <input className="form-input" type="date" value={trxForm.tanggal} onChange={e => setTrxForm({...trxForm, tanggal: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Keterangan Singkat</label>
                <input className="form-input" placeholder="Misal: Beli gas dapur, atau Sisa iuran bulan lalu..." value={trxForm.keterangan} onChange={e => setTrxForm({...trxForm, keterangan: e.target.value})} />
              </div>
            </form>
          </Modal>

          <Modal isOpen={showIuranModal} onClose={() => setShowIuranModal(false)} title="Terbitkan Iuran Bulanan"
            footer={
              <>
                <button className="btn btn-ghost" type="button" onClick={() => setShowIuranModal(false)}>Batal</button>
                <button className="btn btn-primary" type="button" onClick={handleCreateIuran} disabled={submitting}>
                  {submitting ? 'Memproses...' : 'Kirim Tagihan ke Semua Penghuni'}
                </button>
              </>
            }>
            <form onSubmit={handleCreateIuran} noValidate>
              <div className="card" style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                <p style={{ color: '#60a5fa', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 18 }}>ℹ️</span> 
                  Aksi ini akan membuatkan tagihan iuran yang sama besarnya kepada seluruh penghuni terdaftar.
                </p>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Besaran Iuran per Orang (Rp)</label>
                  <input className="form-input" type="number" min="0" placeholder="25000" value={iuranForm.jumlah} onChange={e => setIuranForm({...iuranForm, jumlah: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label required">Bulan Penagihan</label>
                  <input className="form-input" type="month" value={iuranForm.bulan} onChange={e => setIuranForm({...iuranForm, bulan: e.target.value})} required />
                </div>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
}
