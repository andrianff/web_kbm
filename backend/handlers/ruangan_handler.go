package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetRuangan(c *gin.Context) {
	var ruangan []models.Ruangan
	config.DB.Order("nama ASC").Find(&ruangan)
	c.JSON(http.StatusOK, ruangan)
}

func CreateRuangan(c *gin.Context) {
	var req models.RuanganRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}
	ruangan := models.Ruangan{
		Nama:      req.Nama,
		Deskripsi: req.Deskripsi,
		Kapasitas: req.Kapasitas,
		Status:    "tersedia",
	}
	if req.Status != "" {
		ruangan.Status = req.Status
	}
	config.DB.Create(&ruangan)
	c.JSON(http.StatusCreated, ruangan)
}

func UpdateRuangan(c *gin.Context) {
	id := c.Param("id")
	var ruangan models.Ruangan
	if err := config.DB.First(&ruangan, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ruangan tidak ditemukan"})
		return
	}
	var req models.RuanganRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}
	ruangan.Nama = req.Nama
	ruangan.Deskripsi = req.Deskripsi
	ruangan.Kapasitas = req.Kapasitas
	if req.Status != "" {
		ruangan.Status = req.Status
	}
	config.DB.Save(&ruangan)
	c.JSON(http.StatusOK, ruangan)
}

func DeleteRuangan(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Ruangan{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Ruangan berhasil dihapus"})
}
