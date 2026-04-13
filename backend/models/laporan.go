package models

import (
	"time"
)

type LaporanKerusakan struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	UserID          uint      `json:"user_id" gorm:"not null"`
	User            User      `json:"user" gorm:"foreignKey:UserID"`
	Judul           string    `json:"judul" gorm:"not null"`
	Deskripsi       string    `json:"deskripsi"`
	Lokasi          string    `json:"lokasi"`
	Prioritas       string    `json:"prioritas" gorm:"default:sedang"` // rendah|sedang|tinggi|darurat
	Status          string    `json:"status" gorm:"default:dilaporkan"` // dilaporkan|diproses|selesai
	TanggapanAdmin  string    `json:"tanggapan_admin"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type LaporanRequest struct {
	Judul     string `json:"judul" binding:"required"`
	Deskripsi string `json:"deskripsi"`
	Lokasi    string `json:"lokasi"`
	Prioritas string `json:"prioritas"`
}

type UpdateLaporanRequest struct {
	Status         string `json:"status"`
	TanggapanAdmin string `json:"tanggapan_admin"`
}
