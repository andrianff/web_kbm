package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"kbm-backend/config"
	"kbm-backend/models"
)

// === BOOKING RUANGAN ===

func GetBookingRuangan(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var bookings []models.BookingRuangan
	query := config.DB.Preload("User").Preload("Ruangan").Order("created_at DESC")

	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&bookings)
	c.JSON(http.StatusOK, bookings)
}

func CreateBookingRuangan(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.BookingRuanganRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	// Check conflict
	var existing int64
	config.DB.Model(&models.BookingRuangan{}).
		Where("ruangan_id = ? AND tanggal = ? AND slot_waktu = ? AND status IN ?", req.RuanganID, req.Tanggal, req.SlotWaktu, []string{"pending", "approved"}).
		Count(&existing)

	if existing > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Slot waktu sudah dipesan"})
		return
	}

	booking := models.BookingRuangan{
		UserID:    userID.(uint),
		RuanganID: req.RuanganID,
		Tanggal:   req.Tanggal,
		SlotWaktu: req.SlotWaktu,
		Keperluan: req.Keperluan,
		Status:    "pending",
	}
	config.DB.Create(&booking)
	config.DB.Preload("User").Preload("Ruangan").First(&booking, booking.ID)
	c.JSON(http.StatusCreated, booking)
}

func UpdateBookingRuanganStatus(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	var booking models.BookingRuangan
	if err := config.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking tidak ditemukan"})
		return
	}

	booking.Status = req.Status
	booking.CatatanAdmin = req.CatatanAdmin
	config.DB.Save(&booking)
	config.DB.Preload("User").Preload("Ruangan").First(&booking, booking.ID)
	c.JSON(http.StatusOK, booking)
}

func CancelBookingRuangan(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var booking models.BookingRuangan
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking tidak ditemukan"})
		return
	}

	if booking.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya booking pending yang bisa dibatalkan"})
		return
	}

	booking.Status = "cancelled"
	config.DB.Save(&booking)
	c.JSON(http.StatusOK, gin.H{"message": "Booking berhasil dibatalkan"})
}

// === BOOKING FASILITAS ===

func GetBookingFasilitas(c *gin.Context) {
	role, _ := c.Get("role")
	userID, _ := c.Get("user_id")

	var bookings []models.BookingFasilitas
	query := config.DB.Preload("User").Preload("Fasilitas").Order("created_at DESC")

	if role != "admin" {
		query = query.Where("user_id = ?", userID)
	}

	query.Find(&bookings)
	c.JSON(http.StatusOK, bookings)
}

func CreateBookingFasilitas(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.BookingFasilitasRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid: " + err.Error()})
		return
	}

	// Check conflict
	var existing int64
	config.DB.Model(&models.BookingFasilitas{}).
		Where("fasilitas_id = ? AND tanggal = ? AND slot_waktu = ? AND status IN ?", req.FasilitasID, req.Tanggal, req.SlotWaktu, []string{"pending", "approved"}).
		Count(&existing)

	// Check against available quantity
	var fasilitas models.Fasilitas
	config.DB.First(&fasilitas, req.FasilitasID)
	if existing >= int64(fasilitas.JumlahTersedia) {
		c.JSON(http.StatusConflict, gin.H{"error": "Fasilitas sudah penuh pada slot ini"})
		return
	}

	booking := models.BookingFasilitas{
		UserID:      userID.(uint),
		FasilitasID: req.FasilitasID,
		Tanggal:     req.Tanggal,
		SlotWaktu:   req.SlotWaktu,
		Status:      "pending",
	}
	config.DB.Create(&booking)
	config.DB.Preload("User").Preload("Fasilitas").First(&booking, booking.ID)
	c.JSON(http.StatusCreated, booking)
}

func UpdateBookingFasilitasStatus(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak valid"})
		return
	}

	var booking models.BookingFasilitas
	if err := config.DB.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking tidak ditemukan"})
		return
	}

	booking.Status = req.Status
	booking.CatatanAdmin = req.CatatanAdmin
	config.DB.Save(&booking)
	config.DB.Preload("User").Preload("Fasilitas").First(&booking, booking.ID)
	c.JSON(http.StatusOK, booking)
}

func CancelBookingFasilitas(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")

	var booking models.BookingFasilitas
	if err := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&booking).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking tidak ditemukan"})
		return
	}

	if booking.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Hanya booking pending yang bisa dibatalkan"})
		return
	}

	booking.Status = "cancelled"
	config.DB.Save(&booking)
	c.JSON(http.StatusOK, gin.H{"message": "Booking berhasil dibatalkan"})
}
