import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useConfirm } from '../components/ConfirmDialog';

const TIME_SLOTS = [
  '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00',
];

export default function BookingRuangan() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [bookings, setBookings] = useState([]);
  const [ruangan, setRuangan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form, setForm] = useState({ ruangan_id: '', tanggal: '', slot_waktu: '', keperluan: '' });
  const [approveForm, setApproveForm] = useState({ status: '', catatan_admin: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, rRes] = await Promise.all([api.get('/booking/ruangan'), api.get('/ruangan')]);
      setBookings(bRes.data);
      setRuangan(rRes.data);
    } catch (err) {
      toast.error('Gagal memuat data booking');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.ruangan_id || !form.tanggal || !form.slot_waktu) {
      toast.warning('Mohon lengkapi semua field yang wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/booking/ruangan', { ...form, ruangan_id: parseInt(form.ruangan_id) });
      setShowModal(false);
      setForm({ ruangan_id: '', tanggal: '', slot_waktu: '', keperluan: '' });
      toast.success('Booking berhasil dibuat! Menunggu persetujuan admin.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membuat booking');
    } finally { setSubmitting(false); }
  };

  const handleApprove = async (status) => {
    setSubmitting(true);
    try {
      await api.put(`/booking/ruangan/${selectedBooking.id}/status`, { ...approveForm, status });
      setShowApproveModal(false);
      toast.success(status === 'approved' ? 'Booking disetujui!' : 'Booking ditolak.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengupdate status');
    } finally { setSubmitting(false); }
  };

  const handleCancel = async (id) => {
    const ok = await confirm({
      title: 'Batalkan Booking?',
      message: 'Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Batalkan',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/booking/ruangan/${id}`);
      toast.success('Booking berhasil dibatalkan');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membatalkan');
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Memuat data booking ruangan..." />;

  return (
    <div className="animate-in">
      {ConfirmDialogComponent}

      <div className="page-header">
        <h2>📅 Booking Ruangan</h2>
        {!isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)} aria-label="Buat booking ruangan baru">
            + Buat Booking
          </button>
        )}
      </div>

      <div className="table-container" role="region" aria-label="Tabel booking ruangan">
        <div className="table-header">
          <span className="table-title">Daftar Booking Ruangan</span>
          <span className="badge badge-info">{bookings.length} booking</span>
        </div>
        <div className="table-wrapper">
          {bookings.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">📅</div>
              <p>Belum ada booking ruangan</p>
              {!isAdmin && <p style={{marginTop: 8, fontSize: 12}}>Klik tombol "+ Buat Booking" untuk memulai</p>}
            </div>
          ) : (
            <table aria-label="Data booking ruangan">
              <thead>
                <tr>
                  {isAdmin && <th scope="col">Penghuni</th>}
                  <th scope="col">Ruangan</th>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Slot Waktu</th>
                  <th scope="col">Keperluan</th>
                  <th scope="col">Status</th>
                  <th scope="col">Catatan Admin</th>
                  <th scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    {isAdmin && <td data-label="Penghuni" style={{ color: 'var(--text-primary)' }}>{b.user?.nama}</td>}
                    <td data-label="Ruangan" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{b.ruangan?.nama}</td>
                    <td data-label="Tanggal">{b.tanggal}</td>
                    <td data-label="Slot Waktu"><span className="badge badge-cyan">{b.slot_waktu}</span></td>
                    <td data-label="Keperluan">{b.keperluan || '-'}</td>
                    <td data-label="Status"><StatusBadge status={b.status} /></td>
                    <td data-label="Catatan">{b.catatan_admin || '-'}</td>
                    <td data-label="Aksi">
                      <div className="flex gap-2">
                        {isAdmin && b.status === 'pending' && (
                          <button className="btn btn-sm btn-success" aria-label={`Proses booking ${b.ruangan?.nama}`} onClick={() => {
                            setSelectedBooking(b);
                            setApproveForm({ status: 'approved', catatan_admin: '' });
                            setShowApproveModal(true);
                          }}>✓ Proses</button>
                        )}
                        {!isAdmin && b.status === 'pending' && (
                          <button className="btn btn-sm btn-danger" aria-label={`Batalkan booking ${b.ruangan?.nama}`} onClick={() => handleCancel(b.id)}>
                            ✕ Batal
                          </button>
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

      {/* Create Booking Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Booking Ruangan"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Mengirim...' : '📤 Kirim Booking'}
            </button>
          </>
        }>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required">Pilih Ruangan</label>
            <select className="form-select" value={form.ruangan_id} onChange={e => setForm({...form, ruangan_id: e.target.value})} required aria-required="true">
              <option value="">-- Pilih Ruangan --</option>
              {ruangan.filter(r => r.status === 'tersedia').map(r => (
                <option key={r.id} value={r.id}>{r.nama} (Kapasitas: {r.kapasitas})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Tanggal</label>
              <input className="form-input" type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal: e.target.value})} required aria-required="true" min={new Date().toISOString().split('T')[0]} />
              <span className="form-helper">Pilih tanggal mulai dari hari ini</span>
            </div>
            <div className="form-group">
              <label className="form-label required">Slot Waktu</label>
              <select className="form-select" value={form.slot_waktu} onChange={e => setForm({...form, slot_waktu: e.target.value})} required aria-required="true">
                <option value="">-- Pilih Slot --</option>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Keperluan</label>
            <textarea className="form-textarea" placeholder="Untuk apa ruangan digunakan..." value={form.keperluan} onChange={e => setForm({...form, keperluan: e.target.value})} aria-describedby="keperluan-help" />
            <span className="form-helper" id="keperluan-help">Opsional, tapi membantu admin memproses lebih cepat</span>
          </div>
        </form>
      </Modal>

      {/* Approve Modal */}
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
            <p style={{marginBottom:8}}><strong>Penghuni:</strong> {selectedBooking.user?.nama}</p>
            <p style={{marginBottom:8}}><strong>Ruangan:</strong> {selectedBooking.ruangan?.nama}</p>
            <p style={{marginBottom:8}}><strong>Tanggal:</strong> {selectedBooking.tanggal}</p>
            <p style={{marginBottom:16}}><strong>Waktu:</strong> {selectedBooking.slot_waktu}</p>
            <p style={{marginBottom:16}}><strong>Keperluan:</strong> {selectedBooking.keperluan || '-'}</p>
            <div className="form-group">
              <label className="form-label">Catatan Admin</label>
              <textarea className="form-textarea" placeholder="Catatan opsional..." value={approveForm.catatan_admin} onChange={e => setApproveForm({...approveForm, catatan_admin: e.target.value})} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
