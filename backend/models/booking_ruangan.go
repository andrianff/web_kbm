package models

import (
	"time"
)

type BookingRuangan struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	RuanganID    uint      `json:"ruangan_id" gorm:"not null"`
	Ruangan      Ruangan   `json:"ruangan" gorm:"foreignKey:RuanganID"`
	Tanggal      string    `json:"tanggal" gorm:"not null"`
	SlotWaktu    string    `json:"slot_waktu" gorm:"not null"` // "08:00-10:00"
	Keperluan    string    `json:"keperluan"`
	Status       string    `json:"status" gorm:"default:pending"` // pending|approved|rejected|cancelled
	CatatanAdmin string    `json:"catatan_admin"`
	CreatedAt    time.Time `json:"created_at"`
}

type BookingRuanganRequest struct {
	RuanganID uint   `json:"ruangan_id" binding:"required"`
	Tanggal   string `json:"tanggal" binding:"required"`
	SlotWaktu string `json:"slot_waktu" binding:"required"`
	Keperluan string `json:"keperluan"`
}

type UpdateStatusRequest struct {
	Status       string `json:"status" binding:"required"`
	CatatanAdmin string `json:"catatan_admin"`
}
