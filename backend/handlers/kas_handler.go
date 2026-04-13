package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetKasTransaksi(c *gin.Context) {
	var kas []models.Kas
	config.DB.Preload("User").Order("tanggal DESC, created_at DESC").Find(&kas)
	c.JSON(http.StatusOK, kas)
}

func GetSaldoKas(c *gin.Context) {
	var pemasukan float64
	var pengeluaran float64

	config.DB.Model(&models.Kas{}).Where("tipe = ?", "pemasukan").Select("COALESCE(SUM(jumlah), 0)").Scan(&pemasukan)
	config.DB.Model(&models.Kas{}).Where("tipe = ?", "pengeluaran").Select("COALESCE(SUM(jumlah), 0)").Scan(&pengeluaran)

	c.JSON(http.StatusOK, models.SaldoKas{
		TotalPemasukan:   pemasukan,
		TotalPengeluaran: pengeluaran,
		Saldo:            pemasukan - pengeluaran,
	})
}

func CreateKasTransaksi(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.KasTransaksiRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	kas := models.Kas{
		UserID:     userID.(uint),
		Tipe:       req.Tipe,
		Jumlah:     req.Jumlah,
		Keterangan: req.Keterangan,
		Kategori:   req.Kategori,
		Tanggal:    req.Tanggal,
	}
	if kas.Kategori == "" {
		kas.Kategori = "lainnya"
	}

	config.DB.Create(&kas)
	config.DB.Preload("User").First(&kas, kas.ID)
	c.JSON(http.StatusCreated, kas)
}

func GetIuranKas(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var iuran []models.IuranKas
	query := config.DB.Preload("User").Order("bulan DESC, created_at DESC")

	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&iuran)
	c.JSON(http.StatusOK, iuran)
}

func CreateIuranKas(c *gin.Context) {
	var req models.IuranKasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	// Create iuran for all penghuni
	var penghuni []models.User
	config.DB.Where("role = ?", "penghuni").Find(&penghuni)

	created := 0
	for _, p := range penghuni {
		// Check if already exists for this month
		var existing int64
		config.DB.Model(&models.IuranKas{}).Where("user_id = ? AND bulan = ?", p.ID, req.Bulan).Count(&existing)
		if existing > 0 {
			continue
		}

		iuran := models.IuranKas{
			UserID: p.ID,
			Jumlah: req.Jumlah,
			Bulan:  req.Bulan,
			Status: "belum_bayar",
		}
		config.DB.Create(&iuran)
		created++
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Iuran berhasil dibuat",
		"total_created": created,
	})
}

func BayarIuranKas(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var iuran models.IuranKas
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&iuran).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Iuran tidak ditemukan"})
		return
	}

	iuran.Status = "lunas"
	iuran.TanggalBayar = time.Now().Format("2006-01-02")
	config.DB.Save(&iuran)

	// Automatically create kas pemasukan entry
	kas := models.Kas{
		UserID:     userID.(uint),
		Tipe:       "pemasukan",
		Jumlah:     iuran.Jumlah,
		Keterangan: "Iuran kas bulan " + iuran.Bulan,
		Kategori:   "iuran_bulanan",
		Tanggal:    time.Now().Format("2006-01-02"),
	}
	config.DB.Create(&kas)

	c.JSON(http.StatusOK, gin.H{"message": "Iuran berhasil dibayar"})
}

func VerifikasiIuranKas(c *gin.Context) {
	id := c.Param("id")
	var iuran models.IuranKas
	if err := config.DB.First(&iuran, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Iuran tidak ditemukan"})
		return
	}

	iuran.Status = "lunas"
	if iuran.TanggalBayar == "" {
		iuran.TanggalBayar = time.Now().Format("2006-01-02")
	}
	config.DB.Save(&iuran)

	// Automatically create kas pemasukan entry
	kas := models.Kas{
		UserID:     iuran.UserID,
		Tipe:       "pemasukan",
		Jumlah:     iuran.Jumlah,
		Keterangan: "Iuran kas bulan " + iuran.Bulan + " (verifikasi admin)",
		Kategori:   "iuran_bulanan",
		Tanggal:    time.Now().Format("2006-01-02"),
	}
	config.DB.Create(&kas)

	c.JSON(http.StatusOK, gin.H{"message": "Iuran berhasil diverifikasi"})
}
