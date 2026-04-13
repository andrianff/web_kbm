package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetLaporan(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var laporan []models.LaporanKerusakan
	query := config.DB.Preload("User").Order("created_at DESC")

	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&laporan)
	c.JSON(http.StatusOK, laporan)
}

func CreateLaporan(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.LaporanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	laporan := models.LaporanKerusakan{
		UserID:    userID.(uint),
		Judul:     req.Judul,
		Deskripsi: req.Deskripsi,
		Lokasi:    req.Lokasi,
		Prioritas: req.Prioritas,
		Status:    "dilaporkan",
	}
	if laporan.Prioritas == "" {
		laporan.Prioritas = "sedang"
	}

	config.DB.Create(&laporan)
	config.DB.Preload("User").First(&laporan, laporan.ID)
	c.JSON(http.StatusCreated, laporan)
}

func UpdateLaporan(c *gin.Context) {
	id := c.Param("id")
	var laporan models.LaporanKerusakan
	if err := config.DB.First(&laporan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Laporan tidak ditemukan"})
		return
	}

	var req models.UpdateLaporanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	if req.Status != "" {
		laporan.Status = req.Status
	}
	if req.TanggapanAdmin != "" {
		laporan.TanggapanAdmin = req.TanggapanAdmin
	}

	config.DB.Save(&laporan)
	config.DB.Preload("User").First(&laporan, laporan.ID)
	c.JSON(http.StatusOK, laporan)
}
