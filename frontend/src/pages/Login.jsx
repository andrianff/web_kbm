import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', nama: '', no_hp: '', email: '', no_kamar: '' });
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      toast.warning('Username dan password wajib diisi');
      return;
    }
    
    if (isRegister && !form.nama) {
      toast.warning('Nama lengkap wajib diisi untuk pendaftaran');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success(`Selamat datang di KBM, ${form.nama}! Akun Anda berhasil dibuat.`);
      } else {
        await login(form.username, form.password);
        toast.success(`Berhasil masuk. Selamat datang kembali!`);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMode = (e) => {
    e.preventDefault();
    setIsRegister(!isRegister);
    setForm({ username: '', password: '', nama: '', no_hp: '', email: '', no_kamar: '' });
  };

  return (
    <div className="login-page">
      <main className="login-card" role="main" aria-label={isRegister ? 'Formulir Pendaftaran' : 'Formulir Login'}>
        <div className="login-logo" aria-hidden="true">K</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, marginBottom: 8, color: 'var(--text-white)' }}>
          {isRegister ? 'Daftar Akun Baru' : 'Selamat Datang'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
          {isRegister ? 'Lengkapi formulir untuk membuat akun KBM' : 'Masuk ke portal manajemen Kos Bu Mary'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label required" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              name="username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={onChange}
              required
              aria-required="true"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              placeholder="Masukkan password"
              value={form.password}
              onChange={onChange}
              required
              aria-required="true"
            />
          </div>

          {isRegister && (
            <div className="animate-in">
              <div className="form-group">
                <label className="form-label required" htmlFor="nama">Nama Lengkap</label>
                <input id="nama" className="form-input" type="text" name="nama" placeholder="Sesuai KTP/Kartu Pelajar" value={form.nama} onChange={onChange} required aria-required="true" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="no_hp">No. HP (Opsional)</label>
                  <input id="no_hp" className="form-input" type="tel" name="no_hp" placeholder="08xxxxxxxxxx" value={form.no_hp} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="no_kamar">No. Kamar (Opsional)</label>
                  <input id="no_kamar" className="form-input" type="text" name="no_kamar" placeholder="Contoh: A1" value={form.no_kamar} onChange={onChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Aktif (Opsional)</label>
                <input id="email" className="form-input" type="email" name="email" placeholder="alamat@email.com" value={form.email} onChange={onChange} />
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: 14, fontSize: 15 }}
            aria-busy={loading}
          >
            {loading ? '⏳ Memproses...' : isRegister ? '🚀 Daftar Sekarang' : '🔑 Masuk ke Dashboard'}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <>Sudah punya akun? <a href="#" onClick={toggleMode} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Masuk di sini</a></>
          ) : (
            <>Belum punya akun? <a href="#" onClick={toggleMode} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Daftar sekarang</a></>
          )}
        </div>
      </main>
    </div>
  );
}
