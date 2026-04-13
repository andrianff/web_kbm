package models

import (
	"time"
)

type Fasilitas struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Nama            string    `json:"nama" gorm:"not null"`
	Deskripsi       string    `json:"deskripsi"`
	JumlahTersedia  int       `json:"jumlah_tersedia" gorm:"default:1"`
	Status          string    `json:"status" gorm:"default:tersedia"` // tersedia | maintenance
	CreatedAt       time.Time `json:"created_at"`
}

type FasilitasRequest struct {
	Nama           string `json:"nama" binding:"required"`
	Deskripsi      string `json:"deskripsi"`
	JumlahTersedia int    `json:"jumlah_tersedia"`
	Status         string `json:"status"`
}
