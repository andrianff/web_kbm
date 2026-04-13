package models

import (
	"time"
)

type Ruangan struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Nama      string    `json:"nama" gorm:"not null"`
	Deskripsi string    `json:"deskripsi"`
	Kapasitas int       `json:"kapasitas"`
	Status    string    `json:"status" gorm:"default:tersedia"` // tersedia | maintenance
	CreatedAt time.Time `json:"created_at"`
}

type RuanganRequest struct {
	Nama      string `json:"nama" binding:"required"`
	Deskripsi string `json:"deskripsi"`
	Kapasitas int    `json:"kapasitas"`
	Status    string `json:"status"`
}
