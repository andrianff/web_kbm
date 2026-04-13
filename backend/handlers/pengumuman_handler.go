package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetPengumuman(c *gin.Context) {
	var pengumuman []models.Pengumuman
	config.DB.Preload("Admin").Order("is_pinned DESC, created_at DESC").Find(&pengumuman)
	c.JSON(http.StatusOK, pengumuman)
}

func CreatePengumuman(c *gin.Context) {
	adminID, _ := c.Get("user_id")
	var req models.PengumumanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	pengumuman := models.Pengumuman{
		AdminID:   adminID.(uint),
		Judul:     req.Judul,
		Isi:       req.Isi,
		Prioritas: req.Prioritas,
		IsPinned:  req.IsPinned,
	}
	if pengumuman.Prioritas == "" {
		pengumuman.Prioritas = "biasa"
	}

	config.DB.Create(&pengumuman)
	config.DB.Preload("Admin").First(&pengumuman, pengumuman.ID)
	c.JSON(http.StatusCreated, pengumuman)
}

func UpdatePengumuman(c *gin.Context) {
	id := c.Param("id")
	var pengumuman models.Pengumuman
	if err := config.DB.First(&pengumuman, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pengumuman tidak ditemukan"})
		return
	}

	var req models.PengumumanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	pengumuman.Judul = req.Judul
	pengumuman.Isi = req.Isi
	if req.Prioritas != "" {
		pengumuman.Prioritas = req.Prioritas
	}
	pengumuman.IsPinned = req.IsPinned

	config.DB.Save(&pengumuman)
	config.DB.Preload("Admin").First(&pengumuman, pengumuman.ID)
	c.JSON(http.StatusOK, pengumuman)
}

func DeletePengumuman(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Pengumuman{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Pengumuman berhasil dihapus"})
}
