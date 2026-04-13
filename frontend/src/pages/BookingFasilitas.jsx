import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../components/ConfirmDialog';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TIME_SLOTS = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00',
];

export default function BookingFasilitas() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  
  const [bookings, setBookings] = useState([]);
  const [fasilitas, setFasilitas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form, setForm] = useState({ fasilitas_id: '', tanggal: '', slot_waktu: '' });
  const [approveForm, setApproveForm] = useState({ status: '', catatan_admin: '' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, fRes] = await Promise.all([api.get('/booking/fasilitas'), api.get('/fasilitas')]);
      setBookings(bRes.data);
      setFasilitas(fRes.data);
    } catch (err) { 
      toast.error('Gagal memuat data booking fasilitas'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fasilitas_id || !form.tanggal || !form.slot_waktu) {
      toast.warning('Mohon lengkapi semua field yang wajib');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/booking/fasilitas', { ...form, fasilitas_id: parseInt(form.fasilitas_id) });
      setShowModal(false);
      setForm({ fasilitas_id: '', tanggal: '', slot_waktu: '' });
      toast.success('Booking fasilitas berhasil dibuat!');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal membuat booking'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (status) => {
    setSubmitting(true);
    try {
      await api.put(`/booking/fasilitas/${selectedBooking.id}/status`, { ...approveForm, status });
      setShowApproveModal(false);
      toast.success(status === 'approved' ? 'Booking disetujui!' : 'Booking ditolak.');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal mengupdate status'); 
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Batalkan Booking Fasilitas?',
      message: 'Anda yakin ingin membatalkan booking ini?',
      confirmText: 'Ya, Batalkan',
      variant: 'danger',
    });
    if (!ok) return;
    
    try { 
      await api.delete(`/booking/fasilitas/${id}`); 
      toast.success('Booking berhasil dibatalkan');
      fetchData(); 
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Gagal membatalkan booking'); 
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat data fasilitas..." />;

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}
      
      <div className="page-header">
        <h2>🧺 Booking Fasilitas</h2>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} aria-label="Buat booking fasilitas baru">
            + Buat Booking
          </button>
        )}
      </div>

      <div className="table-container" role="region" aria-label="Tabel booking fasilitas">
        <div className="table-header">
          <span className="table-title">Daftar Booking Fasilitas</span>
          <span className="badge badge-info">{bookings.length} booking</span>
        </div>
        <div className="table-wrapper">
          {bookings.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">🧺</div>
              <p>Belum ada booking fasilitas</p>
            </div>
          ) : (
            <table aria-label="Data booking fasilitas">
              <thead>
                <tr>
                  {isAdmin && <th scope="col">Penghuni</th>}
                  <th scope="col">Fasilitas</th>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Slot Waktu</th>
                  <th scope="col">Status</th>
                  <th scope="col">Catatan</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    {isAdmin && <td style={{ color: 'var(--text-primary)' }}>{b.user?.nama}</td>}
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.fasilitas?.nama}</td>
                    <td>{b.tanggal}</td>
                    <td><span className="badge badge-cyan">{b.slot_waktu}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>{b.catatan_admin || '-'}</td>
                    <td>
                      <div className="flex gap-2">
                        {isAdmin && b.status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-success" 
                            aria-label="Proses booking"
                            onClick={() => { 
                              setSelectedBooking(b); 
                              setApproveForm({ status: '', catatan_admin: '' }); 
                              setShowApproveModal(true); 
                            }}>
                            ✓ Proses
                          </button>
                        )}
                        {!isAdmin && b.status === 'pending' && (
                          <button className="btn btn-sm btn-danger" aria-label="Batalkan booking" onClick={() => handleCancel(b.id)}>✕ Batal</button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Booking Fasilitas"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Mengirim...' : '📤 Kirim'}
            </button>
          </>
        }>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required">Pilih Fasilitas</label>
            <select className="form-select" value={form.fasilitas_id} onChange={e => setForm({...form, fasilitas_id: e.target.value})} required aria-required="true">
              <option value="">-- Pilih --</option>
              {fasilitas.filter(f => f.status === 'tersedia').map(f => (
                <option key={f.id} value={f.id}>{f.nama} (Tersedia: {f.jumlah_tersedia})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Tanggal</label>
              <input className="form-input" type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required aria-required="true" min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="form-group">
              <label className="form-label required">Slot Waktu</label>
              <select className="form-select" value={form.slot_waktu} onChange={e => setForm({...form, slot_waktu: e.target.value})} required aria-required="true">
                <option value="">-- Pilih Slot --</option>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Proses Booking"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowApproveModal(false)}>Tutup</button>
            <button className="btn btn-danger" onClick={() => handleApprove('rejected')} disabled={submitting}>✕ Tolak</button>
            <button className="btn btn-success" onClick={() => handleApprove('approved')} disabled={submitting}>✓ Setujui</button>
          </>
        }>
        {selectedBooking && (
          <div>
            <p style={{marginBottom: 8}}><strong>Penghuni:</strong> {selectedBooking.user?.nama}</p>
            <p style={{marginBottom: 8}}><strong>Fasilitas:</strong> {selectedBooking.fasilitas?.nama}</p>
            <p style={{marginBottom: 8}}><strong>Tanggal:</strong> {selectedBooking.tanggal}</p>
            <p style={{marginBottom: 16}}><strong>Waktu:</strong> {selectedBooking.slot_waktu}</p>
            <div className="form-group">
              <label className="form-label">Catatan Admin</label>
              <textarea className="form-textarea" placeholder="Catatan tambahan (opsional)..." value={approveForm.catatan_admin} onChange={e => setApproveForm({...approveForm, catatan_admin: e.target.value})} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
