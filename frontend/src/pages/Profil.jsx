import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profil() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({ username: '', nama: '', no_hp: '', email: '', no_kamar: '' });
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' });
  
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setForm({
        username: res.data.username || '',
        nama: res.data.nama || '',
        no_hp: res.data.no_hp || '',
        email: res.data.email || '',
        no_kamar: res.data.no_kamar || '',
      });
    } catch (err) {
      toast.error('Gagal mengambil data profil Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!form.nama) {
      toast.warning('Nama lengkap wajib diisi');
      return;
    }

    setSubmittingProfile(true);
    try {
      await api.put('/auth/profile', form);
      // PENTING: Untuk reload AuthContext user data di masa depan, saat ini kita hanya memberitahu via Toast.
      toast.success('Pembaruan profil Anda telah disimpan.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengubah profil Anda');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.old_password || !pwdForm.new_password) {
      toast.warning('Tolong masukkan pasword lama dan baru');
      return;
    }
    if (pwdForm.new_password.length < 6) {
      toast.warning('Password minimal harus 6 karakter keamanan');
      return;
    }

    setSubmittingPassword(true);
    try {
      await api.put('/auth/profile/password', pwdForm);
      toast.success('Keamanan gembok kunci (Password) berhasil diperbarui.');
      setPwdForm({ old_password: '', new_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal merubah password. Password lama salah?');
    } finally {
      setSubmittingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Mengambil profil Anda..." />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>👤 Profil & Privasi Saya</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Profile Card */}
        <div className="card">
          <h3 style={{ marginBottom: 20, color: 'var(--text-white)' }}>✏️ Identitas Anda</h3>
          <form onSubmit={handleUpdateProfile} noValidate>
            <div className="form-group">
              <label className="form-label required">Nama Penuh</label>
              <input className="form-input" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Username Log in</label>
                <input className="form-input" value={form.username} disabled title="Tidak dapat diganti" />
              </div>
              <div className="form-group">
                <label className="form-label">Akses Role Sistem</label>
                <input className="form-input" value={user?.role === 'admin' ? 'Pemilik Admin' : 'Anggota Penghuni'} disabled />
              </div>
            </div>
            
            <div style={{ height: 1, background: 'var(--border-color)', margin: '24px 0' }}></div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Alamat Surel (Email)</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">No. WA / Calls</label>
                <input className="form-input" type="tel" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} />
              </div>
            </div>
            <div className="form-group mb-6">
              <label className="form-label">Pengakuan Kamar Hunian Kos</label>
              <input className="form-input" value={form.no_kamar} onChange={e => setForm({...form, no_kamar: e.target.value})} disabled={user?.role === 'admin'} title={user?.role === 'admin' ? "Admin tidak disetup kamar" : "Informasi ini diverifikasi pusat"} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submittingProfile}>
              {submittingProfile ? 'Menyimpan...' : '💾 Simpan Biodata'}
            </button>
          </form>
        </div>

        {/* Security Card */}
        <div className="card">
          <h3 style={{ marginBottom: 20, color: 'var(--text-white)' }}>🔒 Ganti Kata Sandi</h3>
          <form onSubmit={handleChangePassword} noValidate>
            <div className="form-group">
              <label className="form-label required">Password Lama Anda</label>
              <input 
                className="form-input" 
                type="password" 
                value={pwdForm.old_password} 
                onChange={e => setPwdForm({...pwdForm, old_password: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group mb-6">
              <label className="form-label required">Password Baru</label>
              <input 
                className="form-input" 
                type="password" 
                value={pwdForm.new_password} 
                onChange={e => setPwdForm({...pwdForm, new_password: e.target.value})} 
                required 
                minLength={6}
              />
              <span className="form-helper" style={{ display: 'block', marginTop: 6 }}>Min. kombinasi 6 karakter.</span>
            </div>
            <button type="submit" className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} disabled={submittingPassword}>
              {submittingPassword ? 'Memperbarui Keamanan...' : 'Ganti Password Sekarang'}
            </button>
          </form>
        </div>
      </div>
      
      {/* Mobile override for the grid above via inline styles is tough, so it falls back gracefully in the small media query normally. For best practice, we can add a class or keep it simple. The general container is responsive. */}
      
    </div>
  );
}
