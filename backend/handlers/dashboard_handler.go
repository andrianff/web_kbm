package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetDashboardStats(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	stats := gin.H{}

	if role == "admin" {
		var totalPenghuni int64
		config.DB.Model(&models.User{}).Where("role = ?", "penghuni").Count(&totalPenghuni)

		var totalRuangan int64
		config.DB.Model(&models.Ruangan{}).Count(&totalRuangan)

		var bookingPending int64
		config.DB.Model(&models.BookingRuangan{}).Where("status = ?", "pending").Count(&bookingPending)
		var bookingFasilitasPending int64
		config.DB.Model(&models.BookingFasilitas{}).Where("status = ?", "pending").Count(&bookingFasilitasPending)

		var laporanBaru int64
		config.DB.Model(&models.LaporanKerusakan{}).Where("status = ?", "dilaporkan").Count(&laporanBaru)

		var tagihanBelumBayar int64
		config.DB.Model(&models.Tagihan{}).Where("status = ?", "belum_bayar").Count(&tagihanBelumBayar)

		var saldoKas models.SaldoKas
		config.DB.Model(&models.Kas{}).Where("tipe = ?", "pemasukan").Select("COALESCE(SUM(jumlah), 0) as total_pemasukan").Scan(&saldoKas)
		var pengeluaran float64
		config.DB.Model(&models.Kas{}).Where("tipe = ?", "pengeluaran").Select("COALESCE(SUM(jumlah), 0)").Scan(&pengeluaran)
		saldoKas.TotalPengeluaran = pengeluaran
		saldoKas.Saldo = saldoKas.TotalPemasukan - saldoKas.TotalPengeluaran

		var iuranBelumBayar int64
		config.DB.Model(&models.IuranKas{}).Where("status = ?", "belum_bayar").Count(&iuranBelumBayar)

		// 5 pengumuman terbaru
		var pengumuman []models.Pengumuman
		config.DB.Order("is_pinned DESC, created_at DESC").Limit(5).Find(&pengumuman)

		stats = gin.H{
			"total_penghuni":          totalPenghuni,
			"total_ruangan":           totalRuangan,
			"booking_pending":         bookingPending + bookingFasilitasPending,
			"laporan_baru":            laporanBaru,
			"tagihan_belum_bayar":     tagihanBelumBayar,
			"saldo_kas":               saldoKas,
			"iuran_belum_bayar":       iuranBelumBayar,
			"pengumuman_terbaru":      pengumuman,
		}
	} else {
		uid := userID.(uint)

		var bookingAktif int64
		config.DB.Model(&models.BookingRuangan{}).Where("user_id = ? AND status IN ?", uid, []string{"pending", "approved"}).Count(&bookingAktif)
		var bookingFasAktif int64
		config.DB.Model(&models.BookingFasilitas{}).Where("user_id = ? AND status IN ?", uid, []string{"pending", "approved"}).Count(&bookingFasAktif)

		var tagihanPending int64
		config.DB.Model(&models.Tagihan{}).Where("user_id = ? AND status = ?", uid, "belum_bayar").Count(&tagihanPending)

		var totalTagihan float64
		config.DB.Model(&models.Tagihan{}).Where("user_id = ? AND status = ?", uid, "belum_bayar").Select("COALESCE(SUM(jumlah), 0)").Scan(&totalTagihan)

		var laporanAktif int64
		config.DB.Model(&models.LaporanKerusakan{}).Where("user_id = ? AND status != ?", uid, "selesai").Count(&laporanAktif)

		var iuranBelumBayar int64
		config.DB.Model(&models.IuranKas{}).Where("user_id = ? AND status = ?", uid, "belum_bayar").Count(&iuranBelumBayar)

		var pengumuman []models.Pengumuman
		config.DB.Preload("Admin").Order("is_pinned DESC, created_at DESC").Limit(5).Find(&pengumuman)

		stats = gin.H{
			"booking_aktif":       bookingAktif + bookingFasAktif,
			"tagihan_pending":     tagihanPending,
			"total_tagihan":       totalTagihan,
			"laporan_aktif":       laporanAktif,
			"iuran_belum_bayar":   iuranBelumBayar,
			"pengumuman_terbaru":  pengumuman,
		}
	}

	c.JSON(http.StatusOK, stats)
}
