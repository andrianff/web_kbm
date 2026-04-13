package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"kbm-backend/models"
)

var DB *gorm.DB

func InitDatabase() {
	// Load .env file for local development
	_ = godotenv.Load()

	var err error
	
	// Gunakan DB_DSN dari environment variable
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		// Fallback ke Laragon lokal jika tidak ada env var
		dsn = "root:@tcp(127.0.0.1:3306)/kbm?charset=utf8mb4&parseTime=True&loc=Local"
		log.Println("⚠️  DB_DSN tidak ditemukan, menggunakan konfigurasi lokal Laragon.")
	}
	
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Gagal koneksi ke database. Pastikan MySQL menyala dan DSN benar: ", err)
	}

	// Auto migrate
	err = DB.AutoMigrate(
		&models.User{},
		&models.Ruangan{},
		&models.Fasilitas{},
		&models.BookingRuangan{},
		&models.BookingFasilitas{},
		&models.LaporanKerusakan{},
		&models.Tagihan{},
		&models.Kas{},
		&models.IuranKas{},
		&models.Pengumuman{},
	)
	if err != nil {
		log.Fatal("Gagal migrasi database: ", err)
	}

	seedData()
}

func seedData() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return // Already seeded
	}

	log.Println("Memulai proses seeding data dummy yang komprehensif...")

	// 1. Users
	hashAdmin, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	admin := models.User{Username: "admin", PasswordHash: string(hashAdmin), Nama: "Bu Mary (Admin)", Role: "admin", NoKamar: "-"}
	DB.Create(&admin)

	hashUser, _ := bcrypt.GenerateFromPassword([]byte("user123"), bcrypt.DefaultCost)
	budi := models.User{Username: "budi", PasswordHash: string(hashUser), Nama: "Budi Santoso", Role: "penghuni", NoKamar: "A1", NoHP: "081234567890", Email: "budi@email.com"}
	sari := models.User{Username: "sari", PasswordHash: string(hashUser), Nama: "Sari Dewi", Role: "penghuni", NoKamar: "A2", NoHP: "081298765432", Email: "sari@email.com"}
	agung := models.User{Username: "agung", PasswordHash: string(hashUser), Nama: "Agung Pratama", Role: "penghuni", NoKamar: "B1", NoHP: "081211112222", Email: "agung@email.com"}
	lina := models.User{Username: "lina", PasswordHash: string(hashUser), Nama: "Lina Marlina", Role: "penghuni", NoKamar: "B2", NoHP: "081233334444", Email: "lina@email.com"}
	
	DB.Create(&budi)
	DB.Create(&sari)
	DB.Create(&agung)
	DB.Create(&lina)

	// 2. Ruangan
	ruangan := []models.Ruangan{
		{Nama: "Ruang Tengah", Deskripsi: "Ruang berkumpul bersama, TV cerdas, dan sofa", Kapasitas: 15, Status: "tersedia"},
		{Nama: "Dapur Bersama", Deskripsi: "Dapur lengkap dengan kulkas, kompor, microwave", Kapasitas: 5, Status: "tersedia"},
		{Nama: "Ruang Meeting", Deskripsi: "Ruang rapat/belajar kecil dengan papan tulis", Kapasitas: 8, Status: "tersedia"},
		{Nama: "Rooftop Area", Deskripsi: "Area atap untuk santai sore hari", Kapasitas: 20, Status: "tersedia"},
	}
	for i := range ruangan {
		DB.Create(&ruangan[i])
	}

	// 3. Fasilitas
	fasilitas := []models.Fasilitas{
		{Nama: "Mesin Cuci", Deskripsi: "Mesin cuci otomatis bukaan depan 7kg", JumlahTersedia: 2, Status: "tersedia"},
		{Nama: "Jemuran Jemari", Deskripsi: "Area jemuran gantung", JumlahTersedia: 5, Status: "tersedia"},
		{Nama: "Parkir Motor", Deskripsi: "Slot parkir berkanopi", JumlahTersedia: 10, Status: "tersedia"},
		{Nama: "Parkir Mobil", Deskripsi: "Slot parkir mobil depan kos", JumlahTersedia: 3, Status: "tersedia"},
		{Nama: "Setrika", Deskripsi: "Setrika dan meja lipat", JumlahTersedia: 2, Status: "tersedia"},
	}
	for i := range fasilitas {
		DB.Create(&fasilitas[i])
	}

	// Helper for dates
	today := time.Now().Format("2006-01-02")
	tomorrow := time.Now().AddDate(0, 0, 1).Format("2006-01-02")
	thisMonth := time.Now().Format("2006-01")

	// 4. Booking Ruangan
	DB.Create(&models.BookingRuangan{UserID: budi.ID, RuanganID: 1, Tanggal: today, SlotWaktu: "18:00-20:00", Keperluan: "Nonton bareng bola", Status: "approved"})
	DB.Create(&models.BookingRuangan{UserID: sari.ID, RuanganID: 2, Tanggal: today, SlotWaktu: "06:00-08:00", Keperluan: "Masak bekal minggu ini", Status: "done"})
	DB.Create(&models.BookingRuangan{UserID: agung.ID, RuanganID: 3, Tanggal: tomorrow, SlotWaktu: "10:00-12:00", Keperluan: "Kerja kelompok", Status: "pending"})

	// 5. Booking Fasilitas
	DB.Create(&models.BookingFasilitas{UserID: sari.ID, FasilitasID: 1, Tanggal: today, SlotWaktu: "08:00-10:00", Status: "done"})
	DB.Create(&models.BookingFasilitas{UserID: lina.ID, FasilitasID: 1, Tanggal: tomorrow, SlotWaktu: "14:00-16:00", Status: "pending"})
	DB.Create(&models.BookingFasilitas{UserID: budi.ID, FasilitasID: 5, Tanggal: tomorrow, SlotWaktu: "06:00-08:00", Status: "approved"})

	// 6. Laporan Kerusakan
	DB.Create(&models.LaporanKerusakan{UserID: budi.ID, Judul: "AC Kamar A1 Netes", Deskripsi: "Airnya netes ke kasur kalau nyala lama", Lokasi: "Kamar A1", Prioritas: "tinggi", Status: "diproses", TanggapanAdmin: "Sedang panggil tukang AC hari ini"})
	DB.Create(&models.LaporanKerusakan{UserID: lina.ID, Judul: "Kran Dapur Rusak", Deskripsi: "Kran air di wastafel dapur doll", Lokasi: "Dapur Bersama", Prioritas: "sedang", Status: "dilaporkan", TanggapanAdmin: ""})
	DB.Create(&models.LaporanKerusakan{UserID: sari.ID, Judul: "Lampu Toilet Mati", Deskripsi: "Sudah ganti bohlam tetap mati", Lokasi: "Toilet LT 2", Prioritas: "sedang", Status: "selesai", TanggapanAdmin: "Sudah digarap teknisi"})

	// 7. Pengumuman
	DB.Create(&models.Pengumuman{AdminID: admin.ID, Judul: "Peraturan Jam Malam", Isi: "Diingatkan kembali bahwa jam malam adalah pukul 23:00. Pintu gerbang utama akan dikunci.", Prioritas: "penting", IsPinned: true})
	DB.Create(&models.Pengumuman{AdminID: admin.ID, Judul: "Jadwal Bersih-bersih Gabungan", Isi: "Hari Minggu pagi ini kita akan kerja bakti membersihkan area luar.", Prioritas: "biasa", IsPinned: false})

	// 8. Tagihan
	DB.Create(&models.Tagihan{UserID: budi.ID, Bulan: thisMonth, Jumlah: 1500000, Jenis: "sewa", JatuhTempo: today, Status: "lunas", MetodePembayaran: "transfer", Keterangan: "Sewa bulan ini"})
	DB.Create(&models.Tagihan{UserID: sari.ID, Bulan: thisMonth, Jumlah: 1400000, Jenis: "sewa", JatuhTempo: today, Status: "belum_bayar", MetodePembayaran: "", Keterangan: "Sewa kamar"})
	DB.Create(&models.Tagihan{UserID: agung.ID, Bulan: thisMonth, Jumlah: 100000, Jenis: "listrik", JatuhTempo: tomorrow, Status: "belum_bayar", MetodePembayaran: "", Keterangan: "Listrik kamar B1"})

	// 9. Kas & Iuran
	// Initial kas
	DB.Create(&models.Kas{Tanggal: "2026-04-01", Tipe: "pemasukan", Jumlah: 500000, Kategori: "salto_awal", Keterangan: "Saldo awal bulan"})
	DB.Create(&models.Kas{Tanggal: "2026-04-05", Tipe: "pengeluaran", Jumlah: 75000, Kategori: "belanja", Keterangan: "Beli sabun cuci dan pewangi untuk laundry"})
	DB.Create(&models.Kas{Tanggal: "2026-04-10", Tipe: "pengeluaran", Jumlah: 150000, Kategori: "kegiatan", Keterangan: "Beli snack kerja bakti"})

	// Iuran for this month
	DB.Create(&models.IuranKas{UserID: budi.ID, Bulan: thisMonth, Jumlah: 25000, Status: "lunas", TanggalBayar: "2026-04-05"})
	DB.Create(&models.IuranKas{UserID: sari.ID, Bulan: thisMonth, Jumlah: 25000, Status: "belum_bayar", TanggalBayar: ""})
	DB.Create(&models.IuranKas{UserID: agung.ID, Bulan: thisMonth, Jumlah: 25000, Status: "belum_bayar", TanggalBayar: ""})
	DB.Create(&models.IuranKas{UserID: lina.ID, Bulan: thisMonth, Jumlah: 25000, Status: "belum_bayar", TanggalBayar: ""})

	log.Println("✅ Data dummy berhasil digenerate sepenuhnya.")
}
