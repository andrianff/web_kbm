package models

import (
	"time"
)

type BookingFasilitas struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	FasilitasID  uint      `json:"fasilitas_id" gorm:"not null"`
	Fasilitas    Fasilitas `json:"fasilitas" gorm:"foreignKey:FasilitasID"`
	Tanggal      string    `json:"tanggal" gorm:"not null"`
	SlotWaktu    string    `json:"slot_waktu" gorm:"not null"`
	Status       string    `json:"status" gorm:"default:pending"` // pending|approved|rejected|cancelled
	CatatanAdmin string    `json:"catatan_admin"`
	CreatedAt    time.Time `json:"created_at"`
}

type BookingFasilitasRequest struct {
	FasilitasID uint   `json:"fasilitas_id" binding:"required"`
	Tanggal     string `json:"tanggal" binding:"required"`
	SlotWaktu   string `json:"slot_waktu" binding:"required"`
}
