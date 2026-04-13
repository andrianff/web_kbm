const statusConfig = {
  // Booking
  pending: { label: 'Pending', class: 'badge-warning' },
  approved: { label: 'Disetujui', class: 'badge-success' },
  rejected: { label: 'Ditolak', class: 'badge-danger' },
  cancelled: { label: 'Dibatalkan', class: 'badge-default' },
  done: { label: 'Selesai', class: 'badge-info' },
  // Ruangan/Fasilitas
  tersedia: { label: 'Tersedia', class: 'badge-success' },
  maintenance: { label: 'Maintenance', class: 'badge-warning' },
  // Laporan
  dilaporkan: { label: 'Dilaporkan', class: 'badge-warning' },
  diproses: { label: 'Diproses', class: 'badge-info' },
  selesai: { label: 'Selesai', class: 'badge-success' },
  // Tagihan & Iuran
  belum_bayar: { label: 'Belum Bayar', class: 'badge-danger' },
  lunas: { label: 'Lunas', class: 'badge-success' },
  terlambat: { label: 'Terlambat', class: 'badge-danger' },
  // Prioritas
  rendah: { label: 'Rendah', class: 'badge-default' },
  sedang: { label: 'Sedang', class: 'badge-warning' },
  tinggi: { label: 'Tinggi', class: 'badge-danger' },
  darurat: { label: 'Darurat', class: 'badge-danger' },
  // Pengumuman
  biasa: { label: 'Biasa', class: 'badge-default' },
  penting: { label: 'Penting', class: 'badge-warning' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, class: 'badge-default' };
  return <span className={`badge ${config.class}`}>{config.label}</span>;
}
