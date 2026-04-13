package models

import (
	"time"
)

type Pengumuman struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	AdminID   uint      `json:"admin_id" gorm:"not null"`
	Admin     User      `json:"admin" gorm:"foreignKey:AdminID"`
	Judul     string    `json:"judul" gorm:"not null"`
	Isi       string    `json:"isi" gorm:"not null"`
	Prioritas string    `json:"prioritas" gorm:"default:biasa"` // biasa|penting|darurat
	IsPinned  bool      `json:"is_pinned" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
}

type PengumumanRequest struct {
	Judul     string `json:"judul" binding:"required"`
	Isi       string `json:"isi" binding:"required"`
	Prioritas string `json:"prioritas"`
	IsPinned  bool   `json:"is_pinned"`
}
