package models

import (
	"time"
)

type IuranKas struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null"`
	User         User      `json:"user" gorm:"foreignKey:UserID"`
	Jumlah       float64   `json:"jumlah" gorm:"not null"`
	Bulan        string    `json:"bulan" gorm:"not null"` // "2026-04"
	Status       string    `json:"status" gorm:"default:belum_bayar"` // belum_bayar | lunas
	TanggalBayar string    `json:"tanggal_bayar"`
	CreatedAt    time.Time `json:"created_at"`
}

type IuranKasRequest struct {
	Jumlah float64 `json:"jumlah" binding:"required"`
	Bulan  string  `json:"bulan" binding:"required"`
}

type BayarIuranRequest struct {
	MetodePembayaran string `json:"metode_pembayaran"`
}
