package models

import (
	"time"
)

type Tagihan struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"user_id" gorm:"not null"`
	User             User      `json:"user" gorm:"foreignKey:UserID"`
	Jumlah           float64   `json:"jumlah" gorm:"not null"`
	Bulan            string    `json:"bulan" gorm:"not null"` // "2026-04"
	Jenis            string    `json:"jenis" gorm:"not null"` // sewa|listrik|air|lainnya
	Status           string    `json:"status" gorm:"default:belum_bayar"` // belum_bayar|lunas|terlambat
	JatuhTempo       string    `json:"jatuh_tempo"`
	TanggalBayar     string    `json:"tanggal_bayar"`
	MetodePembayaran string    `json:"metode_pembayaran"`
	Keterangan       string    `json:"keterangan"`
	CreatedAt        time.Time `json:"created_at"`
}

type TagihanRequest struct {
	UserID     uint    `json:"user_id" binding:"required"`
	Jumlah     float64 `json:"jumlah" binding:"required"`
	Bulan      string  `json:"bulan" binding:"required"`
	Jenis      string  `json:"jenis" binding:"required"`
	JatuhTempo string  `json:"jatuh_tempo"`
	Keterangan string  `json:"keterangan"`
}

type BayarTagihanRequest struct {
	MetodePembayaran string `json:"metode_pembayaran" binding:"required"`
}

type VerifikasiTagihanRequest struct {
	Status string `json:"status" binding:"required"`
}
