package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetTagihan(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var tagihan []models.Tagihan
	query := config.DB.Preload("User").Order("created_at DESC")

	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&tagihan)
	c.JSON(http.StatusOK, tagihan)
}

func CreateTagihan(c *gin.Context) {
	var req models.TagihanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	tagihan := models.Tagihan{
		UserID:     req.UserID,
		Jumlah:     req.Jumlah,
		Bulan:      req.Bulan,
		Jenis:      req.Jenis,
		Status:     "belum_bayar",
		JatuhTempo: req.JatuhTempo,
		Keterangan: req.Keterangan,
	}

	config.DB.Create(&tagihan)
	config.DB.Preload("User").First(&tagihan, tagihan.ID)
	c.JSON(http.StatusCreated, tagihan)
}

func BayarTagihan(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var tagihan models.Tagihan
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&tagihan).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	var req models.BayarTagihanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	tagihan.Status = "lunas"
	tagihan.MetodePembayaran = req.MetodePembayaran
	tagihan.TanggalBayar = time.Now().Format("2006-01-02")
	config.DB.Save(&tagihan)
	c.JSON(http.StatusOK, tagihan)
}

func VerifikasiTagihan(c *gin.Context) {
	id := c.Param("id")
	var tagihan models.Tagihan
	if err := config.DB.First(&tagihan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tagihan tidak ditemukan"})
		return
	}

	var req models.VerifikasiTagihanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	tagihan.Status = req.Status
	config.DB.Save(&tagihan)
	c.JSON(http.StatusOK, tagihan)
}
