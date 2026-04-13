package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

func GetFasilitas(c *gin.Context) {
	var fasilitas []models.Fasilitas
	config.DB.Order("nama ASC").Find(&fasilitas)
	c.JSON(http.StatusOK, fasilitas)
}

func CreateFasilitas(c *gin.Context) {
	var req models.FasilitasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}
	fasilitas := models.Fasilitas{
		Nama:           req.Nama,
		Deskripsi:      req.Deskripsi,
		JumlahTersedia: req.JumlahTersedia,
		Status:         "tersedia",
	}
	if req.Status != "" {
		fasilitas.Status = req.Status
	}
	if fasilitas.JumlahTersedia == 0 {
		fasilitas.JumlahTersedia = 1
	}
	config.DB.Create(&fasilitas)
	c.JSON(http.StatusCreated, fasilitas)
}

func UpdateFasilitas(c *gin.Context) {
	id := c.Param("id")
	var fasilitas models.Fasilitas
	if err := config.DB.First(&fasilitas, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Fasilitas tidak ditemukan"})
		return
	}
	var req models.FasilitasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}
	fasilitas.Nama = req.Nama
	fasilitas.Deskripsi = req.Deskripsi
	fasilitas.JumlahTersedia = req.JumlahTersedia
	if req.Status != "" {
		fasilitas.Status = req.Status
	}
	config.DB.Save(&fasilitas)
	c.JSON(http.StatusOK, fasilitas)
}

func DeleteFasilitas(c *gin.Context) {
	id := c.Param("id")
	config.DB.Delete(&models.Fasilitas{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Fasilitas berhasil dihapus"})
}
